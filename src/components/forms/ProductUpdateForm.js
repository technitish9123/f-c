import React from "react";
import { Select } from "antd";
const { Option } = Select;

const ProductUpdateForm = ({
  handleChange,
  handleSubmit,
  values,
  handleSubsChange,
  subOptions,
  showSub,
  setValues,
  categories,
  arrSubsIds,
  setArrSubsIds,
}) => {
  const {
    title,
    description,
    price,

    category,
    subs,
    shipping,
    quantity,
    images,
    colors,
    brands,
    color,
    brand,
    section,
    sections,
    gst,
    productid,

    material,
    materials,

    design,
    application,
    instruction,
    width,
    length,
    weight,
    repeatLength,
    rollLength,
    property,
    properties,
    style,
    photo,

    delivery,
  } = values;

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          className="form-control"
          value={title}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Description</label>

        <input
          type="text"
          name="description"
          className="form-control"
          value={description}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>brand</label>

        <input
          type="text"
          name="brand"
          className="form-control"
          value={brand}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Material</label>

        <input
          type="text"
          name="material"
          className="form-control"
          value={material}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Property</label>

        <input
          type="text"
          name="property"
          className="form-control"
          value={property}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Design</label>

        <input
          type="text"
          name="design"
          className="form-control"
          value={design}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>style</label>

        <input
          type="text"
          name="style"
          className="form-control"
          value={style}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>application</label>

        <input
          type="text"
          name="application"
          className="form-control"
          value={application}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Instruction</label>

        <input
          type="text"
          name="instruction"
          className="form-control"
          value={instruction}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Width (in cm)</label>

        <input
          type="text"
          name="width"
          className="form-control"
          value={width}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Length (in cm)</label>

        <input
          type="text"
          name="length"
          className="form-control"
          value={length}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Weight (in gm)</label>

        <input
          type="text"
          name="weight"
          className="form-control"
          value={weight}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Repeat Length (in inch)</label>

        <input
          type="text"
          name="repeatLength"
          className="form-control"
          value={repeatLength}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Roll Length (in cm)</label>

        <input
          type="text"
          name="rollLength"
          className="form-control"
          value={rollLength}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Price</label>

        <input
          type="number"
          name="price"
          className="form-control"
          value={price}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>GST (%)</label>

        <input
          type="number"
          name="gst"
          className="form-control"
          value={gst}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Shipping</label>
        <select
          name="shipping"
          className="form-control"
          onChange={handleChange}
          value={shipping === "Yes" ? "Yes" : "No"}
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>
      <div className="form-group">
        <label>Quantity</label>

        <input
          type="number"
          name="quantity"
          className="form-control"
          value={quantity}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Color</label>
        <select
          multiple
          value={color}
          name="color"
          className="form-control"
          onChange={handleChange}
        >
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {/* <div className="form-group">
        <label>Brand</label>
        <select
          value={brand}
          name="brand"
          className="form-control"
          onChange={handleChange}
        >
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div> */}
      <div className="form-group">
        <label>Category</label>
        {categories.length > 0 && (
          <select
            name="category"
            className="form-control"
            onChange={handleSubsChange}
            value={category._id}
          >
            {categories.map((c) => (
              <option value={c._id} key={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label>Sub Categories</label>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="---Please Select---"
          value={arrSubsIds}
          onChange={(value) => setArrSubsIds(value)}
        >
          {subOptions.length > 0 &&
            subOptions.map((s) => (
              <Option key={s._id} value={s._id}>
                {s.name}
              </Option>
            ))}
        </Select>
      </div>

      <br />
      <button className="btn btn-outline-info">Save</button>
    </form>
  );
};

export default ProductUpdateForm;
