import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Field, { isEmail, isPhone } from "../ui/Field";
import { createLead, leadError } from "../../functions/leads";

// Prefill from the signed-in account where we can.
const useContact = () => {
  const user = useSelector((s) => s.user);
  return { name: user?.name || "", email: user?.email || "", phone: "" };
};

// Shared submit handling: validation, sending, success state.
const useLeadForm = (initial, validate, build) => {
  const [v, setV] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const errors = validate(v);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const err = (k) => (touched ? errors[k] : "");
  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    setSending(true);
    try {
      await createLead(build(v));
      setDone(true);
    } catch (error) {
      toast.error(leadError(error));
    } finally {
      setSending(false);
    }
  };
  return { v, set, err, submit, sending, done };
};

export const EnquiryForm = ({ product, onDone }) => {
  const contact = useContact();
  const f = useLeadForm(
    { ...contact, message: `I'd like to know more about ${product.title}.` },
    (v) => ({
      name: v.name.trim() ? "" : "Please enter your name.",
      email: isEmail(v.email) ? "" : "Enter a valid email address.",
      phone: !v.phone || isPhone(v.phone) ? "" : "Enter a 10-digit mobile number.",
      message: v.message.trim().length > 3 ? "" : "Tell us what you'd like to know.",
    }),
    (v) => ({ type: "enquiry", name: v.name.trim(), email: v.email.trim(), ...(v.phone && { phone: v.phone.trim() }),
      message: v.message.trim(), products: [product._id] })
  );
  if (f.done) {
    return (
      <div className="lead-done">
        <p>Thank you. Our team will reply within one working day.</p>
        <button type="button" className="ink-btn" onClick={onDone}>Close</button>
      </div>
    );
  }
  return (
    <form className="lead-form" onSubmit={f.submit} noValidate>
      <Field id="enq-name" label="Name" value={f.v.name} onChange={f.set("name")} error={f.err("name")} autoComplete="name" />
      <Field id="enq-email" label="Email" type="email" value={f.v.email} onChange={f.set("email")} error={f.err("email")} autoComplete="email" />
      <Field id="enq-phone" label="Mobile (optional)" type="tel" value={f.v.phone} onChange={f.set("phone")} error={f.err("phone")} autoComplete="tel" />
      <Field id="enq-msg" label="Your question" as="textarea" rows={4} value={f.v.message} onChange={f.set("message")} error={f.err("message")} maxLength={1000} />
      <button type="submit" className="ink-btn lead-form__submit" disabled={f.sending}>{f.sending ? "Sending…" : "Send enquiry"}</button>
    </form>
  );
};

export const NotifyForm = ({ product }) => {
  const contact = useContact();
  const f = useLeadForm(
    { email: contact.email },
    (v) => ({ email: isEmail(v.email) ? "" : "Enter a valid email address." }),
    (v) => ({ type: "restock", email: v.email.trim(), products: [product._id] })
  );
  if (f.done) return <p className="notify__done">We'll email you as soon as {product.title} is back.</p>;
  return (
    <form className="notify" onSubmit={f.submit} noValidate>
      <p className="notify__lead">Sold out. Leave your email and we'll tell you when it's back.</p>
      <div className="notify__row">
        <Field id="notify-email" label="Email" type="email" value={f.v.email} onChange={f.set("email")} error={f.err("email")} autoComplete="email" />
        <button type="submit" className="ink-btn" disabled={f.sending}>{f.sending ? "…" : "Notify me"}</button>
      </div>
    </form>
  );
};

export const SampleForm = ({ items, onDone }) => {
  const contact = useContact();
  const f = useLeadForm(
    { ...contact, address: "", message: "" },
    (v) => ({
      name: v.name.trim() ? "" : "Please enter your name.",
      email: isEmail(v.email) ? "" : "Enter a valid email address.",
      phone: isPhone(v.phone) ? "" : "Enter a 10-digit mobile number.",
      address: v.address.trim().length >= 10 ? "" : "Please enter your full address with PIN code.",
    }),
    (v) => ({ type: "sample", name: v.name.trim(), email: v.email.trim(), phone: v.phone.trim(), address: v.address.trim(),
      ...(v.message.trim() && { message: v.message.trim() }), products: items.map((p) => p._id) })
  );
  useEffect(() => {
    if (f.done) onDone?.();
  }, [f.done]); // eslint-disable-line react-hooks/exhaustive-deps
  if (f.done) {
    return (
      <div className="lead-done">
        <div className="eyebrow">Request received</div>
        <p>Thank you. Your swatches will be posted within 2–3 working days. A confirmation is on its way to {f.v.email}.</p>
      </div>
    );
  }
  return (
    <form className="lead-form" onSubmit={f.submit} noValidate>
      <div className="lead-form__grid">
        <Field id="s-name" label="Full name" value={f.v.name} onChange={f.set("name")} error={f.err("name")} autoComplete="name" />
        <Field id="s-phone" label="Mobile number" type="tel" value={f.v.phone} onChange={f.set("phone")} error={f.err("phone")} autoComplete="tel" />
      </div>
      <Field id="s-email" label="Email" type="email" value={f.v.email} onChange={f.set("email")} error={f.err("email")} autoComplete="email" />
      <Field id="s-address" label="Postal address" as="textarea" rows={3} value={f.v.address} onChange={f.set("address")} error={f.err("address")} autoComplete="street-address" maxLength={400} />
      <Field id="s-msg" label="Notes (optional)" value={f.v.message} onChange={f.set("message")} placeholder="Room, project, timeline…" maxLength={1000} />
      <button type="submit" className="ink-btn lead-form__submit" disabled={f.sending || !items.length}>
        {f.sending ? "Sending…" : `Request ${items.length} free sample${items.length === 1 ? "" : "s"}`}
      </button>
    </form>
  );
};

const SLOTS = ["11:00", "12:30", "14:00", "15:30", "17:00", "18:30"];
const istDate = (offsetDays) => new Date(Date.now() + offsetDays * 864e5 + 5.5 * 3600e3).toISOString().slice(0, 10);

export const VisitForm = () => {
  const contact = useContact();
  const f = useLeadForm(
    { ...contact, date: istDate(1), slot: "14:00", mode: "showroom", message: "" },
    (v) => ({
      name: v.name.trim() ? "" : "Please enter your name.",
      email: isEmail(v.email) ? "" : "Enter a valid email address.",
      phone: isPhone(v.phone) ? "" : "Enter a 10-digit mobile number.",
      date: v.date > istDate(0) ? "" : "Please pick a day from tomorrow onwards.",
    }),
    (v) => ({ type: "visit", name: v.name.trim(), email: v.email.trim(), phone: v.phone.trim(),
      visit: { date: v.date, slot: v.slot, mode: v.mode }, ...(v.message.trim() && { message: v.message.trim() }) })
  );
  if (f.done) {
    return (
      <div className="lead-done">
        <div className="eyebrow">Booked</div>
        <p>
          Thank you, {f.v.name.split(" ")[0]}. We've noted your {f.v.mode === "video" ? "video consultation" : "showroom visit"} on{" "}
          {new Date(f.v.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} at {f.v.slot}.
          We'll call you to confirm.
        </p>
      </div>
    );
  }
  return (
    <form className="lead-form" onSubmit={f.submit} noValidate>
      <div className="visit__modes" role="radiogroup" aria-label="Visit type">
        {[["showroom", "At the showroom", "Kemps Corner, Mumbai"], ["video", "Video consultation", "From anywhere"]].map(([k, t, d]) => (
          <label key={k} className={`visit__mode${f.v.mode === k ? " is-on" : ""}`}>
            <input type="radio" name="mode" value={k} checked={f.v.mode === k} onChange={f.set("mode")} />
            <strong>{t}</strong>
            <span>{d}</span>
          </label>
        ))}
      </div>
      <div className="lead-form__grid">
        <Field id="v-date" label="Date" type="date" min={istDate(1)} max={istDate(60)} value={f.v.date} onChange={f.set("date")} error={f.err("date")} />
        <div className="co-field">
          <label htmlFor="v-slot">Time</label>
          <select id="v-slot" value={f.v.slot} onChange={f.set("slot")}>
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Field id="v-name" label="Full name" value={f.v.name} onChange={f.set("name")} error={f.err("name")} autoComplete="name" />
        <Field id="v-phone" label="Mobile number" type="tel" value={f.v.phone} onChange={f.set("phone")} error={f.err("phone")} autoComplete="tel" />
      </div>
      <Field id="v-email" label="Email" type="email" value={f.v.email} onChange={f.set("email")} error={f.err("email")} autoComplete="email" />
      <Field id="v-msg" label="What are you working on? (optional)" value={f.v.message} onChange={f.set("message")} maxLength={1000} />
      <button type="submit" className="ink-btn lead-form__submit" disabled={f.sending}>{f.sending ? "Booking…" : "Book appointment"}</button>
    </form>
  );
};
