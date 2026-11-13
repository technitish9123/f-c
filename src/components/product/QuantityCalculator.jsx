import React, { useMemo, useState } from "react";

/*
 * "How much do I need?" for curtains (fabric, in metres) and walls (wallpaper,
 * in rolls), from the product's own width, repeat and roll length. Fabric
 * repeat is entered in inches in the admin; widths and lengths in cm.
 */
const HEM_CM = 30; // turn-up + heading per drop
const TRIM_M = 0.1; // wallpaper trimming per strip

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const curtainMetres = ({ windowCm, dropCm, fullness, fabricCm, repeatIn }) => {
  if (!windowCm || !dropCm) return null;
  const widths = Math.max(1, Math.ceil((windowCm * fullness) / fabricCm));
  const repeat = repeatIn * 2.54;
  let cut = dropCm + HEM_CM;
  if (repeat > 0) cut = Math.ceil(cut / repeat) * repeat;
  const metres = (widths * cut) / 100;
  return { widths, cutCm: Math.round(cut), metres, buy: Math.ceil(metres) };
};

export const wallpaperRolls = ({ wallM, heightM, rollWidthM, rollLengthM, repeatM }) => {
  if (!wallM || !heightM) return null;
  let drop = heightM + TRIM_M;
  if (repeatM > 0) drop = Math.ceil(drop / repeatM) * repeatM;
  const perRoll = Math.floor(rollLengthM / drop);
  if (perRoll < 1) return { tooTall: true };
  const strips = Math.ceil(wallM / rollWidthM);
  return { strips, perRoll, buy: Math.ceil(strips / perRoll) };
};

const QuantityCalculator = ({ product, onAdd }) => {
  const isWallpaper = product.category?.slug === "wallpaper" || /wall/i.test(product.category?.name || "");
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ a: "", b: "", fullness: "2" });
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  // Product data, with common defaults when a field was never filled in.
  const fabricCm = num(product.width) || 140;
  const repeatIn = num(product.repeatLength);
  const rollLen = num(product.rollLength);
  const rollLengthM = rollLen > 50 ? rollLen / 100 : rollLen || 10; // stored as cm or m over the years
  const rollWidthM = (num(product.width) || 53) / 100;

  const result = useMemo(
    () =>
      isWallpaper
        ? wallpaperRolls({ wallM: num(v.a), heightM: num(v.b), rollWidthM, rollLengthM, repeatM: (repeatIn * 2.54) / 100 })
        : curtainMetres({ windowCm: num(v.a), dropCm: num(v.b), fullness: num(v.fullness), fabricCm, repeatIn }),
    [isWallpaper, v, rollWidthM, rollLengthM, repeatIn, fabricCm]
  );
  const unit = isWallpaper ? (result?.buy === 1 ? "roll" : "rolls") : "m";

  return (
    <div className={`calc${open ? " is-open" : ""}`}>
      <button type="button" className="calc__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>How much do I need?</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="calc__body">
          <p className="calc__hint">
            {isWallpaper
              ? `Measure each wall. Rolls are ${Math.round(rollWidthM * 100)} cm × ${rollLengthM} m${repeatIn ? `, ${repeatIn}" pattern repeat` : ""}.`
              : `For a pair of curtains. Fabric is ${fabricCm} cm wide${repeatIn ? `, ${repeatIn}" pattern repeat` : ""}.`}
          </p>
          <div className="calc__grid">
            <label>
              <span>{isWallpaper ? "Wall width (m)" : "Window / track width (cm)"}</span>
              <input type="number" inputMode="decimal" min="0" value={v.a} onChange={set("a")} placeholder={isWallpaper ? "4.2" : "180"} />
            </label>
            <label>
              <span>{isWallpaper ? "Wall height (m)" : "Drop, track to floor (cm)"}</span>
              <input type="number" inputMode="decimal" min="0" value={v.b} onChange={set("b")} placeholder={isWallpaper ? "2.7" : "260"} />
            </label>
            {!isWallpaper && (
              <label>
                <span>Fullness</span>
                <select value={v.fullness} onChange={set("fullness")}>
                  <option value="1.5">Flat / Roman (1.5×)</option>
                  <option value="2">Pleated (2×)</option>
                  <option value="2.5">Full / wave (2.5×)</option>
                </select>
              </label>
            )}
          </div>

          {result?.tooTall && <p className="co-field__err">That wall is taller than one roll. Please call us to plan it.</p>}
          {result?.buy > 0 && (
            <div className="calc__result" aria-live="polite">
              <div>
                <span className="calc__num">{result.buy} {unit}</span>
                <span className="calc__how">
                  {isWallpaper
                    ? `${result.strips} strips, ${result.perRoll} per roll`
                    : `${result.widths} width${result.widths > 1 ? "s" : ""} × ${result.cutCm} cm cut (${result.metres.toFixed(2)} m)`}
                </span>
              </div>
              {onAdd && product.quantity !== 0 && (
                <button type="button" className="ink-btn" onClick={() => onAdd(result.buy)}>
                  Add {result.buy} {unit} to bag
                </button>
              )}
            </div>
          )}
          <p className="calc__note">An estimate including hems and pattern matching. Our team checks every order before cutting.</p>
        </div>
      )}
    </div>
  );
};

export default QuantityCalculator;
