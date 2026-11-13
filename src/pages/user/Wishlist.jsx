import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getUserWishlist, removeProductFromWishlist } from "../../functions/user";
import { forgetFavourite } from "../../functions/useFavourites";
import AccountLayout from "../../components/nav/AccountLayout";
import laptop from "../../images/laptop.png";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const SITE = "https://firstimp.in";

const addToBag = (dispatch, product) => {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch (e) {
    cart = [];
  }
  if (!cart.some((p) => p._id === product._id)) cart.push({ ...product, count: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  dispatch({ type: "ADD_TO_CART", payload: cart });
  dispatch({ type: "DRAWER_VISIBILITY", payload: true });
};

const FavouriteRow = ({ item, onRemove, removing }) => {
  const dispatch = useDispatch();
  const imgs = (item.images || []).map((i) => i.url);
  const first = imgs[0] || laptop;
  const second = imgs[1] || imgs[0] || laptop;
  const meta = [item.category && item.category.name, item.color, item.material].filter(Boolean);
  const enquiry = `mailto:meher@firstimp.in?subject=${encodeURIComponent(`Enquiry: ${item.title}`)}&body=${encodeURIComponent(
    `Hello,\n\nI'd like to know more about ${item.title} (${SITE}/product/${item.slug}).\n\nThank you.`
  )}`;
  const out = item.quantity === 0;

  return (
    <li className="fav-row">
      <Link to={`/product/${item.slug}`} className="fav-row__img">
        <img src={first} alt={item.title} loading="lazy" />
      </Link>
      <Link to={`/product/${item.slug}`} className="fav-row__img fav-row__img--second" aria-hidden="true" tabIndex={-1}>
        <img src={second} alt="" loading="lazy" />
      </Link>
      <div className="fav-row__body">
        <div className="fav-row__text">
          <Link to={`/product/${item.slug}`} className="fav-row__title">
            {item.title}
          </Link>
          {meta.map((m) => (
            <div key={m} className="fav-row__meta">
              {m}
            </div>
          ))}
          <div className="fav-row__price">{inr(item.price)}</div>
        </div>
        <div className="fav-row__actions">
          <button type="button" onClick={onRemove} disabled={removing}>
            {removing ? "Removing…" : "Remove"}
          </button>
          <Link to={`/product/${item.slug}`}>Details</Link>
          <a href={enquiry}>Enquire</a>
          <button type="button" className="is-primary" onClick={() => addToBag(dispatch, item)} disabled={out}>
            {out ? "Sold out" : "Add to bag"}
          </button>
        </div>
      </div>
    </li>
  );
};

const Wishlist = () => {
  const user = useSelector((state) => state.user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user || !user.token) return;
    getUserWishlist(user.token)
      .then((res) => setItems(((res.data && res.data.wishlist) || []).filter(Boolean)))
      .catch(() => toast.error("Couldn't load your favourites"))
      .finally(() => setLoading(false));
  }, [user]);

  const remove = (item) => {
    setRemoving(item._id);
    removeProductFromWishlist(user.token, item._id)
      .then((res) => {
        if (res.data.ok) {
          setItems((list) => list.filter((w) => w._id !== item._id));
          forgetFavourite(item._id);
          toast(`${item.title} removed from favourites`);
        }
      })
      .catch(() => toast.error("Couldn't remove that piece"))
      .finally(() => setRemoving(null));
  };

  const share = async () => {
    const text = items.map((i) => `${i.title} — ${SITE}/product/${i.slug}`).join("\n");
    const data = { title: "My First Impression favourites", text };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(`${data.title}\n\n${text}`);
        toast("Favourites copied — paste them into a message");
      }
    } catch (e) {
      /* share sheet dismissed */
    }
  };

  return (
    <AccountLayout
      title="Your favourites"
      intro={!loading && items.length ? `${items.length} saved ${items.length === 1 ? "piece" : "pieces"}.` : null}
    >
      {loading ? (
        <div className="account__loading">Loading your favourites…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>Your favourites are empty.</p>
          <p className="empty-state__hint">Tap the heart on any fabric or wallcovering to keep it here.</p>
          <Link to="/shop" className="buybox__cta">
            Discover the collection
          </Link>
        </div>
      ) : (
        <>
          <div className="fav-toolbar">
            <button type="button" className="text-link" onClick={share}>
              Share list
            </button>
          </div>
          <ul className="fav-list">
            {items.map((item) => (
              <FavouriteRow key={item._id} item={item} onRemove={() => remove(item)} removing={removing === item._id} />
            ))}
          </ul>
        </>
      )}
    </AccountLayout>
  );
};

export default Wishlist;
