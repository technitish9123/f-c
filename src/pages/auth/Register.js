import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Recaptcha from "react-recaptcha";

const Register = ({ history }) => {
  const [email, setEmail] = useState("");
  const [isVerified, setiIsVerified] = useState(false);
  const { user } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    if (user && user.token) history.push("/");
  }, [user, history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = {
      url: process.env.REACT_APP_REGISTER_REDIRECT_URL,
      handleCodeInApp: true,
    };

    await auth.sendSignInLinkToEmail(email, config);
    toast.success(
      `Email is sent to ${email}. Click the link to complete your registration.`
    );
    // save user email in local storage
    window.localStorage.setItem("emailForRegistration", email);
    // clear state
    setEmail("");
  };

  const RecaptchaLoaded = () => {
    console.log("captcha loaded");
  };
  const verifyCallback = (response) => {
    if (response) {
      setiIsVerified(true);
    }
  };

  const registerForm = () => (
    <form onSubmit={handleSubmit}>
      <input
        required
        type="email"
        className="form-control"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        autoFocus
      />
      <br />
      <Recaptcha
        sitekey="6LecT7QfAAAAACAPPOOhNf_H1SKFCwhkMRhMjdEa"
        render="explicit"
        onloadCallback={RecaptchaLoaded}
        verifyCallback={verifyCallback}
      />{" "}
      <br />
      <button type="submit" className="btn btn-raised " disabled={!isVerified}>
        Register
      </button>
    </form>
  );

  return (
    <div className="container p-5">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h4>Register</h4>
          {registerForm()}
        </div>
      </div>
    </div>
  );
};

export default Register;
