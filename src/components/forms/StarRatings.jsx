import React, { useState } from "react";

/*
 * Drop-in replacement for the unmaintained react-star-ratings package
 * (same props), so it works on React 19.
 */
const Star = ({ fill, size, onClick, onEnter, onLeave, label, selectable }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    role={selectable ? "button" : undefined}
    aria-label={label}
    tabIndex={selectable ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(e) => selectable && (e.key === "Enter" || e.key === " ") && onClick()}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    style={{ cursor: selectable ? "pointer" : "default", display: "block" }}
  >
    <path
      d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"
      fill={fill}
    />
  </svg>
);

const StarRatings = ({
  rating = 0,
  numberOfStars = 5,
  starDimension = "16px",
  starSpacing = "2px",
  starRatedColor = "#1c1b19",
  starEmptyColor = "#ddd6cb",
  starHoverColor,
  isSelectable = false,
  changeRating,
  name,
}) => {
  const [hover, setHover] = useState(0);
  const shown = hover || rating;
  const selectable = isSelectable && typeof changeRating === "function";

  return (
    <div
      className="star-ratings"
      title={`${rating} out of ${numberOfStars}`}
      style={{ display: "inline-flex", gap: starSpacing, verticalAlign: "middle" }}
    >
      {Array.from({ length: numberOfStars }, (_, i) => {
        const n = i + 1;
        const fill =
          hover && n <= hover
            ? starHoverColor || starRatedColor
            : n <= Math.round(shown)
            ? starRatedColor
            : starEmptyColor;
        return (
          <Star
            key={n}
            size={starDimension}
            fill={fill}
            selectable={selectable}
            label={selectable ? `Rate ${n} of ${numberOfStars}` : undefined}
            onClick={selectable ? () => changeRating(n, name) : undefined}
            onEnter={selectable ? () => setHover(n) : undefined}
            onLeave={selectable ? () => setHover(0) : undefined}
          />
        );
      })}
    </div>
  );
};

export default StarRatings;
