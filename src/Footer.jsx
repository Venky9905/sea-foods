
import React from "react";
import {
  FiMapPin,
  FiPhone,
  FiClock,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Container } from "react-bootstrap";

const Footer = () => {
  const whatsappNumber = "919398439905";

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${whatsappNumber}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <footer className="seafood-footer" id="contact">
      <Container>
        <div className="footer-top">
          {/* Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/#catalog">Our Seafood</a></li>
              <li><a href="/#categories">Categories</a></li>
              <li><a href="/#contact">Contact Us</a></li>
            </ul>
          </div>

          {/* Seafood Categories */}
          <div className="footer-column">
            <h4>Seafood Categories</h4>
            <ul>
              <li>
                <a href="/#categories/sea-fish">Sea Fish</a>
              </li>
              <li>
                <a href="/#categories/prawns">Fresh Prawns</a>
              </li>
              <li>
                <a href="/#categories/crabs">Sea Crabs</a>
              </li>
              <li>
                <a href="/#categories/squid">Squid</a>
              </li>
              <li>
                <a href="/#categories/dry-fish">Dry Fish</a>
              </li>
              <li>
                <a href="/#categories/dry-prawns">Dry Prawns</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column footer-contact">
            <h4>Contact Us</h4>

            <p>
              <FiMapPin />
              <span>
                Local seafood delivery Mangalagiri and nearby areas
              </span>
            </p>
            <p>
              <FaWhatsapp />
              <button
                type="button"
                className="footer-order-btn"
                onClick={openWhatsApp}
              >
                Order on WhatsApp
              </button>
            </p>
            <p>
              <FiPhone />
              <div className="phone-calls">
                <a href="tel:8807392307">8807392307</a>
                <a href="tel:9398439905">9398439905</a>
              </div>
            </p>
          </div>

          {/* Google Maps */}
          <div className="footer-column footer-map-column">
            <h4>Find Us</h4>

            <div className="location-map">
              <iframe
                title="Sea to Plate location map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d331.65459648027155!2d80.5666701143337!3d16.44309609269926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35f1007bf41147%3A0x7f07905be9fc2942!2sSEA%20TO%20PLATE!5e1!3m2!1sen!2sin!4v1793272060105!5m2!1sen!2sin"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </Container>
      <Container>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Parth Krishna Sea Foods.
            All rights reserved.
          </p>

          <p className="footer-tagline">
            Freshness You Can Trust.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
