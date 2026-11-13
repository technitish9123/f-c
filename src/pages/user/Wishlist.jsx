import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getUserWishlist, removeProductFromWishlist } from "../../functions/user";
import AccountLayout from "../../components/nav/AccountLayout";
import laptop from "../../images/laptop.png";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Wishlist = () => {
  const user = useSelector((state) => state.user);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const loadWishlist = () =>
    getUserWishlist(user.token)
      .then((res) => setWishlist((res.data && res.data.wishlist) || []))
      .catch(() => toast.error("Couldn't load your wishlist"))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (user && user.token) loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRemove = (productId) => {
    setRemoving(productId);
    removeProductFromWishlist(user.token, productId)
      .then((res) => {
        if (res.data.ok) setWishlist((list) => list.filter((w) => w._id !== productId));
      })
      .catch(() => toast.error("Couldn't remove that item"))
      .finally(() => setRemoving(null));
  };

  const items = wishlist.filter(Boolean);

  return (
    <AccountLayout
      title="Wishlist"
      intro={
        !loading && items.length
          ? `${items.length} saved ${items.length === 1 ? "piece" : "pieces"}.`
          : null
      }
    >
      {loading ? (
        <div className="account__loading">Loading your wishlist…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>Nothing saved yet.</p>
          <Link to="/shop" className="buybox__cta">
            Discover fabrics
          </Link>
        </div>
      ) : (
        <div className="product-grid wishlist-grid">
          {items.map((w) => {
            const img = w.images && w.images.length ? w.images[0].url : laptop;
            const out = w.quantity === 0;
            return (
              <div className="pcard" key={w._id}>
                <Link to={`/product/${w.slug}`} className="pcard__media">
                  <img src={img} alt={w.title} loading="lazy" />
                  {w.images && w.images.length > 1 && (
                    <img className="pcard__alt" src={w.images[1].url} alt="" loading="lazy" />
                  )}
                  {out && <span className="pcard__badge">Sold out</span>}
                </Link>
                <div className="pcard__body">
                  <div className="pcard__row">
                    <Link to={`/product/${w.slug}`} className="pcard__title">
                      {w.title}
                    </Link>
                    <span className="pcard__price">{inr(w.price)}</span>
                  </div>
                  <div className="wishlist__actions">
                    <Link to={`/product/${w.slug}`}>View</Link>
                    <button
                      onClick={() => handleRemove(w._id)}
                      disabled={removing === w._id}
                      aria-label={`Remove ${w.title} from wishlist`}
                    >
                      {removing === w._id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
};

export default Wishlist;
