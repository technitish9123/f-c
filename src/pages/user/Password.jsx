import React, { useState } from "react";
import { updatePassword } from "firebase/auth";
import AccountLayout from "../../components/nav/AccountLayout";
import { auth } from "../../firebase";
import { toast } from "react-toastify";

const Password = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await updatePassword(auth.currentUser, password)
      .then(() => {
        setLoading(false);
        setPassword("");
        toast.success("Password updated");
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.message);
      });
  };

  const passwordUpdateForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="eyebrow" htmlFor="new-password">New password</label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
          placeholder="At least 6 characters"
          id="new-password"
          autoComplete="new-password"
          disabled={loading}
          value={password}
        />
        <button
          className="btn btn-primary"
          disabled={!password || password.length < 6 || loading}
        >
          Update password
        </button>
      </div>
    </form>
  );

  return (
    <AccountLayout title="Password" intro="Choose a new password of at least six characters.">
      <div className="account-form">{passwordUpdateForm()}</div>
    </AccountLayout>
  );
};

export default Password;
