import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import video2 from "../assets/videos/video2.mp4";
import video3 from "../assets/videos/video3.mp4";
import video4 from "../assets/videos/video4.mp4";
import thumb2 from "../assets/images/video2.png";
import thumb3 from "../assets/images/video3.png";
import thumb4 from "../assets/images/video4.png";

const SLIDES = [
  { video: video2, thumb: thumb2 },
  { video: video3, thumb: thumb3 },
  { video: video4, thumb: thumb4 },
];
const INTERVAL = 12000;

// Home hero: muted, looping showroom films that advance every 12 s.
const Background = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <section className="hero">
      <div className="hero__copy">
        <div className="eyebrow">First Impression · Mumbai</div>
        <h1>
          Fabrics that furnish <em>a feeling</em>
        </h1>
        <Link to="/shop">Discover the collection</Link>
      </div>
      <div className="background">
        <video key={index} autoPlay muted loop playsInline preload="auto" poster={SLIDES[index].thumb}>
          <source src={SLIDES[index].video} type="video/mp4" />
        </video>
        <ul className="navigation">
          {SLIDES.map((s, i) => (
            <li key={s.thumb}>
              <button type="button" onClick={() => setIndex(i)} aria-label={`Show film ${i + 1}`} aria-pressed={i === index}>
                <img src={s.thumb} alt="" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Background;
