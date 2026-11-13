import { useSyncExternalStore } from "react";

/*
 * A small list kept in localStorage and shared live across components
 * (sample basket, recently viewed). Items are product snapshots keyed by _id,
 * or by _id and colour code for a product in a chosen colour.
 */
export const itemKey = (p) => (p.variant ? `${p._id}:${p.variant}` : String(p._id));
export const createLocalList = (key, max) => {
  const read = () => {
    try {
      const list = JSON.parse(localStorage.getItem(key));
      return Array.isArray(list) ? list.filter((p) => p && p._id) : [];
    } catch {
      return [];
    }
  };
  let items = read();
  const listeners = new Set();
  const save = (next) => {
    items = next;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* storage blocked: the list just won't persist */
    }
    listeners.forEach((l) => l());
  };
  const subscribe = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const snapshot = (p) => ({
    _id: String(p._id), title: p.title, slug: p.slug, price: p.price, priceOnRequest: p.priceOnRequest, quantity: p.quantity, color: p.color,
    ...(p.variant && { variant: p.variant }), ...(p.colours || p.variants?.length ? { colours: p.colours || p.variants.length } : {}),
    images: (p.images || []).slice(0, 2).map((i) => ({ url: i.url })),
    category: p.category && p.category.name ? { name: p.category.name, slug: p.category.slug } : undefined,
  });
  return {
    has: (id) => items.some((p) => p._id === String(id)),
    add: (p) => {
      if (items.some((x) => itemKey(x) === itemKey(p))) return true;
      if (items.length >= max) return false;
      save([...items, snapshot(p)]);
      return true;
    },
    // Most recent first, capped.
    push: (p) => save([snapshot(p), ...items.filter((x) => x._id !== String(p._id))].slice(0, max)),
    // Takes an item key (itemKey) or a plain product id.
    remove: (key) => save(items.filter((p) => itemKey(p) !== String(key))),
    clear: () => save([]),
    use: () => useSyncExternalStore(subscribe, () => items),
  };
};

export const SAMPLE_LIMIT = 5;
export const samples = createLocalList("sampleBasket", SAMPLE_LIMIT);
export const recentlyViewed = createLocalList("recentlyViewed", 12);
