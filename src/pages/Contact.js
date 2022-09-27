import React from "react";
import { BiPhone } from "react-icons/bi";
import { AiOutlineMail, AiOutlineHome } from "react-icons/ai";

const Contact = () => {
  return (
    <div className="container">
      <h1>Get in touch</h1>
      <div className="contact">
        <div className="one-contact">
          <div className="contact-details">
            <div>
              <div>
                <AiOutlineHome className="contact-icon" />
              </div>
              <div>
                First Impression
                <br />
                8-11, Om Chambers,
                <br />
                Ground floor, Kemps Corner,
                <br /> Mumbai - 400036
              </div>
            </div>
            <br />
            <div>
              <div>
                <BiPhone className="contact-icon" />
              </div>

              <div>
                +91-22-23631490
                <br />
                +91-22-23634167
                <br />
                +91-22-23686547
                <br />
                +91-22-66642030
                <br />
                +91-22-66642031
                <br />
                +91 7777054811
                <br />
               +91 9323943092
              </div>
            </div>
            <br />
            <div>
              <div>
                <AiOutlineMail className="contact-icon" />
              </div>
              <div>meher@firstimp.in <br /></div>
              
            </div>
            <div>
              <div>
                <AiOutlineMail className="contact-icon" />
              </div>
              <div>firstimp777@gmail.com</div>
              
            </div>
          </div>
          <br />
          <div className="map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120744.91162828589!2d72.73705795820311!3d18.963304500000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce752ab391db%3A0x4c1ab42fc4c3481b!2sFirst%20Impression!5e0!3m2!1sen!2sin!4v1610647467585!5m2!1sen!2sin"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen=""
              aria-hidden="false"
              tabIndex="0"
              title="map"
            ></iframe>
          </div>
        </div>
        <div className="two-contact">
          <form
            target="_blank"
            action="https://formsubmit.co/playbloxblog@gmail.com"
            method="POST"
          >
            <div className="form-group">
              <div className="form-col ">
                <div className="col ">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Full Name"
                    required
                  />
                </div><br></br>
                <div className="col">
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Email Address"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <textarea
                placeholder="Your Message"
                className="form-control"
                name="message"
                rows="10"
                required
              ></textarea>
            </div>
            <input
              type="hidden"
              name="_autoresponse"
              value="We've received your email. Thanks for contacting First Impression."
            />
            <input type="hidden" name="_template" value="table" />
            <button type="submit" className="btn btn-lg btn-dark btn-block">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
