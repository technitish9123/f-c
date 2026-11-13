import { useEffect, useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getUserWishlist, addItemToWishlist, removeProductFromWishlist } from "./user";

/*
 * One shared favourites store for the whole app.
 * - Signed out: favourites live in this browser (localStorage), like JAB.
 * - Signed in: they live on the account (API). On sign-in, anything saved
 *   as a guest is moved into the account.
 */
const LOCAL_KEY = "favourites";

// Keep only what the favourites page needs to render.
const snapshot = (p) => ({
  _id: String(p._id),
  title: p.title,
  slug: p.slug,
  price: p.price,
  images: (p.images || []).slice(0, 2).map((i) => ({ url: i.url })),
  category: p.category && p.category.name ? { name: p.category.name } : undefined,
  color: p.color,
  material: p.material,
  quantity: p.quantity,
  priceOnRequest: p.priceOnRequest,
  colours: p.colours || (p.variants && p.variants.length) || undefined,
});

const readLocal = () => {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY));
    return Array.isArray(list) ? list.filter((p) => p && p._id) : [];
  } catch (e) {
    return [];
  }
};
const writeLocal = (list) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch (e) {
    /* storage full or blocked: favourites just won't persist */
  }
};

let state = {
  items: readLocal(), // product snapshots (guest) or populated products (account)
  token: null,
  loading: false,
};
const listeners = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const idsOf = (items) => new Set(items.map((p) => String(p._id)));

const loadAccount = async (token) => {
  if (state.token === token || state.loading) return;
  set({ loading: true, token });
  try {
    // Move guest favourites into the account first.
    const guest = readLocal();
    if (guest.length) {
      await Promise.all(guest.map((p) => addItemToWishlist(p._id, token).catch(() => null)));
      writeLocal([]);
    }
    const res = await getUserWishlist(token);
    const list = ((res.data && res.data.wishlist) || []).filter(Boolean);
    set({ items: list });
    if (guest.length) toast(`${guest.length} saved ${guest.length === 1 ? "piece" : "pieces"} added to your account`);
  } catch (e) {
    set({ token: null });
  } finally {
    set({ loading: false });
  }
};

export const useFavourites = () => {
  const user = useSelector((s) => s.user);
  const snap = useSyncExternalStore(subscribe, () => state);
  const token = user && user.token;

  useEffect(() => {
    if (token) loadAccount(token);
    else if (state.token) set({ token: null, items: readLocal() }); // signed out
  }, [token]);

  const ids = idsOf(snap.items);
  const has = (id) => ids.has(String(id));

  const toggle = async (product) => {
    const id = String(product._id);
    const adding = !ids.has(id);
    const before = state.items;
    const next = adding ? [snapshot(product), ...before] : before.filter((p) => String(p._id) !== id);
    set({ items: next }); // optimistic

    if (!token) {
      writeLocal(next);
      toast(adding ? `${product.title} saved to favourites` : `${product.title} removed from favourites`);
      return;
    }
    try {
      if (adding) await addItemToWishlist(id, token);
      else await removeProductFromWishlist(token, id);
      toast(adding ? `${product.title} saved to favourites` : `${product.title} removed from favourites`);
    } catch (e) {
      set({ items: before });
      toast.error("Couldn't update your favourites");
    }
  };

  return { has, toggle, items: snap.items, count: snap.items.length, loading: snap.loading, signedIn: !!token };
};
