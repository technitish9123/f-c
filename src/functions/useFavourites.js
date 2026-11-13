import { useEffect, useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getUserWishlist, addItemToWishlist, removeProductFromWishlist } from "./user";
import { useLegacyHistory } from "../components/routes/legacy";

/*
 * One shared favourites (wishlist) store for the whole app, so every heart
 * on every card stays in sync without each one calling the API.
 */
let state = { ids: new Set(), token: null, loading: false };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const set = (patch) => {
  state = { ...state, ...patch };
  emit();
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const load = (token) => {
  if (!token || state.token === token || state.loading) return;
  set({ loading: true, token });
  getUserWishlist(token)
    .then((res) => {
      const list = (res.data && res.data.wishlist) || [];
      set({ ids: new Set(list.filter(Boolean).map((p) => String(p._id || p))) });
    })
    .catch(() => set({ token: null }))
    .finally(() => set({ loading: false }));
};

export const useFavourites = () => {
  const user = useSelector((s) => s.user);
  const history = useLegacyHistory();
  const snapshot = useSyncExternalStore(subscribe, () => state);
  const token = user && user.token;

  useEffect(() => {
    if (token) load(token);
    else if (state.token) set({ ids: new Set(), token: null });
  }, [token]);

  const has = (id) => snapshot.ids.has(String(id));

  const toggle = async (product) => {
    if (!token) {
      history.push("/login", { from: history.location.pathname });
      return;
    }
    const id = String(product._id);
    const adding = !snapshot.ids.has(id);
    const next = new Set(state.ids);
    adding ? next.add(id) : next.delete(id);
    set({ ids: next }); // optimistic
    try {
      if (adding) await addItemToWishlist(id, token);
      else await removeProductFromWishlist(token, id);
      toast(adding ? `${product.title} saved to favourites` : `${product.title} removed from favourites`);
    } catch (e) {
      const undo = new Set(state.ids);
      adding ? undo.delete(id) : undo.add(id);
      set({ ids: undo });
      toast.error("Couldn't update your favourites");
    }
  };

  return { has, toggle, count: snapshot.ids.size };
};

// Lets the favourites page drop an id after removing it there.
export const forgetFavourite = (id) => {
  const next = new Set(state.ids);
  next.delete(String(id));
  set({ ids: next });
};
