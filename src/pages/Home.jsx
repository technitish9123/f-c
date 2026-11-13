import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import CategoryList from "../components/category/CategoryList";
import ProductRail from "../components/home/ProductRail";
import Background from "../components/homeComponents/background";
import lookA from "../components/assets/images/s2.jpg";
import lookB from "../components/assets/images/s4.jpg";

// Fades editorial blocks in as they enter the viewport.
const useReveal = () => {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("reveal-ready");
    let fired = false;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          fired = true;
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    const watch = () =>
      document
        .querySelectorAll(".reveal:not(.is-in):not([data-reveal])")
        .forEach((el) => {
          el.setAttribute("data-reveal", "");
          io.observe(el);
        });
    watch();
    // content loaded from the API (e.g. category tiles) mounts later
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    // fail-safe: never leave content hidden if the observer doesn't report
    const failsafe = setTimeout(() => {
      if (!fired) document.documentElement.classList.remove("reveal-ready");
    }, 1500);
    return () => {
      clearTimeout(failsafe);
      document.documentElement.classList.remove("reveal-ready");
      io.disconnect();
      mo.disconnect();
    };
  }, []);
};

const SectionHead = ({ index, label, title, to }) => (
  <div className="home-section__head reveal">
    <div>
      <div className="eyebrow">
        {index} — {label}
      </div>
      <h2>{title}</h2>
    </div>
    {to && (
      <Link to={to} className="link-line">
        View all
      </Link>
    )}
  </div>
);

const Home = () => {
  useReveal();

  return (
    <>
      <Background />

      <div className="home-wrap">
        <section className="statement reveal">
          <div>
            <div className="eyebrow">The House</div>
            <h2>
              Curtains, upholstery and wallcoverings, chosen with the patience
              of people who <em>live with textiles</em>.
            </h2>
          </div>
          <div className="statement__body">
            <p>
              From our showroom at Kemps Corner, First Impression brings
              together fabrics and wallpapers for homes that are meant to be
              lived in, and remembered.
            </p>
            <Link to="/shop" className="link-line">
              Explore the collection
            </Link>
          </div>
        </section>

        <section className="lookbook">
          <figure className="lookbook__a reveal">
            <img src={lookA} alt="Living room dressed in First Impression fabrics" />
          </figure>
          <div className="lookbook__side">
            <figure className="lookbook__b reveal">
              <img src={lookB} alt="Detail of upholstery fabric" />
            </figure>
            <div className="lookbook__caption reveal">
              <div className="eyebrow">Material Study</div>
              <h3>Texture, drape and the quiet of good light</h3>
              <p>
                Each piece is selected for how it falls, how it ages and how
                it feels under the hand.
              </p>
              <Link to="/category/fabrics" className="link-line">
                Fabrics
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section">
          <SectionHead index="01" label="Just arrived" title="New Arrivals" to="/shop" />
          <ProductRail sort="newest" label="New arrivals" />
        </section>

        <section className="home-section">
          <SectionHead index="02" label="Categories" title="Shop by Category" />
          <CategoryList />
        </section>

        <section className="home-section">
          <SectionHead index="03" label="Most loved" title="Best Sellers" to="/shop" />
          <ProductRail sort="bestselling" label="Best sellers" />
        </section>
      </div>

      <section className="visit">
        <div className="visit__inner reveal">
          <div>
            <div className="eyebrow">Visit</div>
            <h2>See, touch and compare in our Mumbai showroom</h2>
          </div>
          <div>
            <p>
              8-11, Om Chambers, Ground floor, Kemps Corner, Mumbai - 400036.
              Our team will help you match fabrics to your space.
            </p>
            <Link to="/contact" className="ink-btn" style={{ display: "inline-block", padding: "16px 36px" }}>
              Plan a visit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
