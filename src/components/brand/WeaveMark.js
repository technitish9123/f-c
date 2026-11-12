import React from "react";

/*
 * First Impression weave mark: four woven squares (weft, warp, warp, check).
 * Drawn in currentColor so it inherits the surrounding text colour.
 * `threads` controls stripe density; use fewer threads at small sizes.
 */
const quadrant = (x, y, kind, n, cell) => {
  const step = cell / n;
  const w = step / 2;
  const bars = [];
  for (let i = 0; i < n; i++) {
    const o = i * step + w / 2;
    if (kind === "h" || kind === "x")
      bars.push(<rect key={`h${i}`} x={x} y={y + o} width={cell} height={w} />);
    if (kind === "v" || kind === "x")
      bars.push(<rect key={`v${i}`} x={x + o} y={y} width={w} height={cell} />);
  }
  return bars;
};

const WeaveMark = ({ size = 24, threads = 5, title, className = "", style }) => {
  const cell = 46;
  const gap = 4;
  const b = cell + gap;
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={`weave-mark ${className}`}
      style={style}
      fill="currentColor"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {quadrant(0, 0, "h", threads, cell)}
      {quadrant(b, 0, "v", threads, cell)}
      {quadrant(0, b, "v", threads, cell)}
      {quadrant(b, b, "x", threads, cell)}
    </svg>
  );
};

export default WeaveMark;
