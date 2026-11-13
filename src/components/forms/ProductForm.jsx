import React from "react";
import { Select } from "antd";
import { PRODUCT_COLOURS } from "../../functions/facets";

// Text and number fields, in display order: [name, label, type].
const FIELDS = [
  ["title", "Title", "text"],
  ["description", "Description", "text"],
  ["brand", "Brand", "text"],
  ["material", "Material", "text"],
  ["property", "Property", "text"],
  ["design", "Design", "text"],
  ["style", "Style", "text"],
  ["application", "Application", "text"],
  ["instruction", "Instruction", "text"],
  ["width", "Width (cm)", "text"],
  ["length", "Length (cm)", "text"],
  ["weight", "Weight (g)", "text"],
  ["repeatLength", "Repeat length (in)", "text"],
  ["rollLength", "Roll length (cm)", "text"],
  ["price", "Price", "number"],
  ["gst", "GST (%)", "number"],
  ["quantity", "Quantity", "number"],
];

/*
 * One form for creating and editing products.
 * - Create: pass `showSub` to reveal sub-categories once a category is picked.
 * - Edit: pass `subIds`/`setSubIds`, the selected sub-category ids.
 */
const ProductForm = ({
  values,
  setValues,
  categories,
  subOptions = [],
  showSub = true,
  subIds,
  setSubIds,
  handleChange,
  handleCategoryChange,
  handleSubmit,
  submitLabel = "Save",
}) => {
  const { shipping, color, category, subs } = values;
  const categoryId = category && typeof category === "object" ? category._id : category;
  const colours = color && !PRODUCT_COLOURS.includes(color) ? [color, ...PRODUCT_COLOURS] : PRODUCT_COLOURS;
  const editing = Array.isArray(subIds);

  return (
    <form onSubmit={handleSubmit}>
      {FIELDS.map(([name, label, type]) => (
        <div className="form-group" key={name}>
          <label htmlFor={`pf-${name}`}>{label}</label>
          <input
            id={`pf-${name}`}
            type={type}
            name={name}
            className="form-control"
            value={values[name] ?? ""}
            onChange={handleChange}
          />
        </div>
      ))}

      <div className="form-group">
        <label htmlFor="pf-shipping">Shipping</label>
        <select id="pf-shipping" name="shipping" className="form-control" value={shipping || ""} onChange={handleChange}>
          <option value="" disabled>
            Select…
          </option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="pf-color">Colour</label>
        <select id="pf-color" name="color" className="form-control" value={color || ""} onChange={handleChange}>
          <option value="" disabled>
            Select…
          </option>
          {colours.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="pf-category">Category</label>
        <select id="pf-category" name="category" className="form-control" value={categoryId || ""} onChange={handleCategoryChange}>
          <option value="" disabled>
            Select…
          </option>
          {categories.map((c) => (
            <option value={c._id} key={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {showSub && subOptions.length > 0 && (
        <div className="form-group">
          <label>Sub categories</label>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select…"
            value={editing ? subIds : subs}
            onChange={(v) => (editing ? setSubIds(v) : setValues({ ...values, subs: v }))}
            options={subOptions.map((s) => ({ value: s._id, label: s.name }))}
          />
        </div>
      )}

      <button className="btn btn-primary">{submitLabel}</button>
    </form>
  );
};

export default ProductForm;
