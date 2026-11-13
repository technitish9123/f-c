import React from "react";

// Labelled text field in the checkout style (underline input, inline error).
const Field = ({ id, label, error, as = "input", className = "", ...props }) => {
  const Tag = as;
  return (
    <div className={`co-field${error ? " is-invalid" : ""} ${className}`}>
      <label htmlFor={id}>{label}</label>
      <Tag id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      {error && <span className="co-field__err" id={`${id}-err`}>{error}</span>}
    </div>
  );
};

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
export const isPhone = (v) => /^(\+?91)?[6-9]\d{9}$/.test(String(v || "").replace(/[\s-]/g, ""));

export default Field;
