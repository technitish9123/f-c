import React, { useState, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Recaptcha from "react-recaptcha";

const ForgotPassword = ({ history }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setiIsVerified] = useState(false);
  const { user } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    if (user && user.token) history.push("/");
  }, [user, history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const config = {
      url: import.meta.env.REACT_APP_FORGOT_PASSWORD_REDIRECT,
      handleCodeInApp: true,
    };

    await sendPasswordResetEmail(auth, email, config)
      .then(() => {
        setEmail("");
        setLoading(false);
        toast.success("Check your email for password reset link");
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error.message);
        console.log("ERROR MSG IN FORGOT PASSWORD", error);
      });
  };
  const RecaptchaLoaded = () => {};
  const verifyCallback = (response) => {
    if (response) {
      setiIsVerified(true);
    }
  };

  return (
    <div className="container auth-page"><div className="auth-card">
      {loading ? (
        <h4 className="text-danger">Loading</h4>
      ) : (
        <h4>Forgot Password</h4>
      )}

      <form onSubmit={handleSubmit}>
        <input
          required
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Type your email"
          autoFocus
        />
        <br />
        <Recaptcha
          sitekey="6LecT7QfAAAAACAPPOOhNf_H1SKFCwhkMRhMjdEa"
          render="explicit"
          onloadCallback={RecaptchaLoaded}
          verifyCallback={verifyCallback}
        />
        <br />
        <button className="btn btn-raised" disabled={!email && !isVerified}>
          Submit
        </button>
      </form>
    </div></div>
  );
};

export default ForgotPassword;
