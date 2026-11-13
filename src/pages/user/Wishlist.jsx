import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useFavourites } from "../../functions/useFavourites";
import { addToCart } from "../../functions/cart";
import AccountLayout from "../../components/nav/AccountLayout";
import laptop from "../../images/laptop.png";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const SITE = "https://firstimp.in";

const FavouriteRow = ({ item, onRemove }) => {
  const dispatch = useDispatch();
  const imgs = (item.images || []).map((i) => i.url);
  const first = imgs[0] || laptop;
  const second = imgs[1] || imgs[0] || laptop;
  const meta = [item.category && item.category.name, item.color, item.material].filter(Boolean);
  const enquiry = `mailto:meher@firstimp.in?subject=${encodeURIComponent(`Enquiry: ${item.title}`)}&body=${encodeURIComponent(
    `Hello,\n\nI'd like to know more about ${item.title} (${SITE}/product/${item.slug}).\n\nThank you.`
  )}`;
  const out = item.quantity === 0;
  const onRequest = item.priceOnRequest || !(item.price > 0);

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
          <div className="fav-row__price">{onRequest ? "Price on request" : inr(item.price)}</div>
        </div>
        <div className="fav-row__actions">
          <button type="button" onClick={onRemove}>
            Remove
          </button>
          <Link to={`/product/${item.slug}`}>Details</Link>
          <a href={enquiry}>Enquire</a>
          {!onRequest && (
            <button type="button" className="is-primary" onClick={() => addToCart(dispatch, item)} disabled={out}>
              {out ? "Sold out" : "Add to bag"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

// Same frame as the account pages when signed in; a public header otherwise.
const Frame = ({ signedIn, intro, children }) =>
  signedIn ? (
    <AccountLayout title="Your favourites" intro={intro}>
      {children}
    </AccountLayout>
  ) : (
    <div className="account">
      <header className="account__head">
        <div className="eyebrow">Favourites</div>
        <h1>Your favourites</h1>
        {intro && <p>{intro}</p>}
      </header>
      <div className="fav-guest">
        <p className="fav-guest__note">
          Saved on this device. <Link to="/login" state={{ from: "/favourites" }}>Sign in</Link> to keep your
          favourites across devices.
        </p>
        {children}
      </div>
    </div>
  );

const Wishlist = () => {
  const fav = useFavourites();
  const items = fav.items;
  const loading = fav.loading && items.length === 0;

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
    <Frame
      signedIn={fav.signedIn}
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
              <FavouriteRow key={item._id} item={item} onRemove={() => fav.toggle(item)} />
            ))}
          </ul>
        </>
      )}
    </Frame>
  );
};

export default Wishlist;
