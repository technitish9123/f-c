import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import AccountLayout from "../../components/nav/AccountLayout";
import Field, { isPhone } from "../../components/ui/Field";
import { getProfile, saveProfile } from "../../functions/user";

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;
const blankAddress = { label: "", name: "", mobileNum: "", add: "" };

// Name, phone, GSTIN (for business invoices) and up to five saved addresses.
const Profile = () => {
  const user = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const [p, setP] = useState(null);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    getProfile(user.token)
      .then(({ data }) => setP({ name: data.name || "", phone: data.phone || "", gstin: data.gstin || "", addresses: data.addresses || [] }))
      .catch(() => setP({ name: "", phone: "", gstin: "", addresses: [] }));
  }, [user.token]);

  if (!p) return <AccountLayout title="Profile"><div className="account__loading">Loading…</div></AccountLayout>;

  const errors = {
    name: p.name.trim() ? "" : "Please enter your name.",
    phone: !p.phone || isPhone(p.phone) ? "" : "Enter a 10-digit mobile number.",
    gstin: !p.gstin || GSTIN.test(p.gstin.toUpperCase()) ? "" : "A GSTIN has 15 characters, e.g. 27AAAAA0000A1Z5.",
    addresses: p.addresses.some((a) => !a.name.trim() || !isPhone(a.mobileNum) || a.add.trim().length < 10)
      ? "Each address needs a name, a 10-digit mobile number and the full address." : "",
  };
  const set = (k) => (e) => setP((s) => ({ ...s, [k]: e.target.value }));
  const setAddr = (i, k) => (e) => setP((s) => ({ ...s, addresses: s.addresses.map((a, j) => (j === i ? { ...a, [k]: e.target.value } : a)) }));

  const save = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    setSaving(true);
    try {
      const { data } = await saveProfile(user.token, {
        name: p.name.trim(), phone: p.phone.trim(), gstin: p.gstin.trim().toUpperCase(),
        addresses: p.addresses.map(({ label, name, mobileNum, add }) => ({ label: label.trim(), name: name.trim(), mobileNum: mobileNum.trim(), add: add.trim() })),
      });
      dispatch({ type: "LOGGED_IN_USER", payload: { ...user, name: data.name } });
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(err.response?.data?.err || "Couldn't save. Please check the details.");
    } finally {
      setSaving(false);
    }
  };
  const err = (k) => (touched ? errors[k] : "");

  return (
    <AccountLayout title="Profile" intro="Your details fill in checkout for you. Add a GSTIN to get business invoices.">
      <form className="profile" onSubmit={save} noValidate>
        <div className="lead-form__grid">
          <Field id="pf-name" label="Full name" value={p.name} onChange={set("name")} error={err("name")} autoComplete="name" />
          <Field id="pf-phone" label="Mobile number" type="tel" value={p.phone} onChange={set("phone")} error={err("phone")} autoComplete="tel" />
          <Field id="pf-email" label="Email" value={user.email} disabled readOnly />
          <Field id="pf-gstin" label="GSTIN (optional)" value={p.gstin} onChange={set("gstin")} error={err("gstin")} maxLength={15}
            style={{ textTransform: "uppercase" }} />
        </div>

        <div className="profile__addresses">
          <div className="profile__addr-head">
            <h2 className="co__title">Saved addresses</h2>
            {p.addresses.length < 5 && (
              <button type="button" className="text-link" onClick={() => setP((s) => ({ ...s, addresses: [...s.addresses, { ...blankAddress, name: s.name, mobileNum: s.phone }] }))}>
                + Add address
              </button>
            )}
          </div>
          {!p.addresses.length && <p className="co__hint">No saved addresses yet. Addresses you use at checkout can be saved too.</p>}
          {p.addresses.map((a, i) => (
            <fieldset key={i} className="profile__addr">
              <div className="lead-form__grid">
                <Field id={`pa-label-${i}`} label="Label" value={a.label} onChange={setAddr(i, "label")} placeholder="Home, Office…" maxLength={30} />
                <Field id={`pa-name-${i}`} label="Recipient" value={a.name} onChange={setAddr(i, "name")} maxLength={80} />
                <Field id={`pa-mob-${i}`} label="Mobile" type="tel" value={a.mobileNum} onChange={setAddr(i, "mobileNum")} maxLength={13} />
              </div>
              <Field id={`pa-add-${i}`} label="Address with PIN code" as="textarea" rows={2} value={a.add} onChange={setAddr(i, "add")} maxLength={400} />
              <button type="button" className="text-link" onClick={() => setP((s) => ({ ...s, addresses: s.addresses.filter((_, j) => j !== i) }))}>
                Remove
              </button>
            </fieldset>
          ))}
          {err("addresses") && <p className="co-field__err">{err("addresses")}</p>}
        </div>

        <button type="submit" className="ink-btn profile__save" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
      </form>
    </AccountLayout>
  );
};

export default Profile;
