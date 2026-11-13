import React from "react";

// Destination kept exactly as before; confirm the inbox with the business.
const FORM_ACTION = "https://formsubmit.co/playbloxblog@gmail.com";

const PHONES = [
  "+91-22-23631490",
  "+91-22-23634167",
  "+91-22-23686547",
  "+91-22-66642030",
  "+91-22-66642031",
  "+91 7777054811",
  "+91 9323943092",
];

const Contact = () => (
  <div className="contact-page">
    <header className="contact-page__head">
      <div className="eyebrow">Contact</div>
      <h1>Visit the showroom, or write to us</h1>
    </header>

    <div className="contact-page__grid">
      <section className="contact-page__details">
        <div>
          <div className="eyebrow">Showroom</div>
          <address>
            First Impression
            <br />
            8-11, Om Chambers, Ground floor
            <br />
            Kemps Corner, Mumbai - 400036
          </address>
        </div>
        <div>
          <div className="eyebrow">Telephone</div>
          <ul>
            {PHONES.map((p) => (
              <li key={p}>
                <a href={`tel:${p.replace(/[^+\d]/g, "")}`}>{p}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow">Email</div>
          <ul>
            <li><a href="mailto:meher@firstimp.in">meher@firstimp.in</a></li>
            <li><a href="mailto:firstimp777@gmail.com">firstimp777@gmail.com</a></li>
          </ul>
        </div>
      </section>

      <section className="contact-page__form">
        <div className="eyebrow">Send a message</div>
        <form target="_blank" action={FORM_ACTION} method="POST">
          <label htmlFor="c-name">Full name</label>
          <input id="c-name" type="text" name="name" className="form-control" autoComplete="name" required />
          <label htmlFor="c-email">Email address</label>
          <input id="c-email" type="email" name="email" className="form-control" autoComplete="email" required />
          <label htmlFor="c-msg">Message</label>
          <textarea id="c-msg" name="message" className="form-control" rows="5" required></textarea>
          <input
            type="hidden"
            name="_autoresponse"
            value="We've received your email. Thanks for contacting First Impression."
          />
          <input type="hidden" name="_template" value="table" />
          <button type="submit" className="ink-btn">Send message</button>
        </form>
      </section>
    </div>

    <div className="contact-page__map">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120744.91162828589!2d72.73705795820311!3d18.963304500000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce752ab391db%3A0x4c1ab42fc4c3481b!2sFirst%20Impression!5e0!3m2!1sen!2sin!4v1610647467585!5m2!1sen!2sin"
        loading="lazy"
        style={{ border: 0 }}
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title="First Impression showroom on Google Maps"
      ></iframe>
    </div>
  </div>
);

export default Contact;
