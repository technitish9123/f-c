import React, { useEffect, useRef } from "react";

// Native <dialog>: focus trapping, Esc to close and a backdrop for free.
const Dialog = ({ open, onClose, title, children }) => {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="fi-dialog"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()} // click on the backdrop
      aria-labelledby="fi-dialog-title"
    >
      <div className="fi-dialog__body">
        <div className="fi-dialog__head">
          <h2 id="fi-dialog-title">{title}</h2>
          <button type="button" className="fi-dialog__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
};

export default Dialog;
