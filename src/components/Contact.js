import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt, faClock, faUserShield, faHome } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faLinkedinIn, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="contact-hero-bg">
      <div className="contact-hero-overlay">
        <div className="contact-split-layout">
          {/* Left: Contact Form */}
          <div className="contact-form-pane">
            <h1 className="contact-title">Contact <span className="brand-accent">Us</span></h1>
            <p className="contact-subtitle">We'd love to hear from you! Fill out the form and our team will get back to you soon.</p>
            <form className="contact-form-pro" onSubmit={handleSubmit} autoComplete="off">
              <div className="form-group-pro">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="form-group-pro">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                />
              </div>
              <div className="form-group-pro">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  required
                />
              </div>
              <div className="form-group-pro">
                <label htmlFor="message">Message</label>
                <textarea
                  name="message"
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  required
                ></textarea>
              </div>
              <button type="submit" className="contact-btn-pro">
                Send Message
              </button>
              {submitted && <div className="contact-success-pro">Thank you for your message! We'll get back to you soon.</div>}
            </form>
          </div>

          {/* Right: Info, Social, Map, Quick Links */}
          <div className="contact-info-pane">
            <div className="contact-info-cards">
              <div className="info-card-pro">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon-pro" />
                <div>
                  <h3>Our Office</h3>
                  <p>123 Property Street<br/>Downtown Area, Stone Town<br/>Zanzibar, Tanzania</p>
                </div>
              </div>
              <div className="info-card-pro">
                <FontAwesomeIcon icon={faPhone} className="info-icon-pro" />
                <div>
                  <h3>Phone</h3>
                  <p>+255 777 123 456<br/>+255 777 654 321</p>
                </div>
              </div>
              <div className="info-card-pro">
                <FontAwesomeIcon icon={faEnvelope} className="info-icon-pro" />
                <div>
                  <h3>Email</h3>
                  <p>info@udigiproperties.com<br/>support@udigiproperties.com</p>
                </div>
              </div>
              <div className="info-card-pro">
                <FontAwesomeIcon icon={faClock} className="info-icon-pro" />
                <div>
                  <h3>Business Hours</h3>
                  <p>Mon-Fri: 9:00 AM - 6:00 PM<br/>Sat: 10:00 AM - 2:00 PM<br/>Sun: Closed</p>
                </div>
              </div>
            </div>
            <div className="contact-social-section">
              <h2>Follow Us</h2>
              <div className="contact-social-links">
                <a href="https://facebook.com/udigiproperties" target="_blank" rel="noopener noreferrer" className="social-btn-pro">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="https://twitter.com/udigiproperties" target="_blank" rel="noopener noreferrer" className="social-btn-pro">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="https://instagram.com/udigiproperties" target="_blank" rel="noopener noreferrer" className="social-btn-pro">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="https://linkedin.com/company/udigiproperties" target="_blank" rel="noopener noreferrer" className="social-btn-pro">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
              </div>
            </div>
            <div className="contact-map-section">
              <h2>Find Us</h2>
              <div className="contact-map-container">
                <iframe
                  title="Udigi Properties Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.770088421325!2d39.19485441429062!3d-6.165224097950322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1865984f53015615%3A0x74a3e20b9f95f329!2sStone%20Town!5e0!3m2!1sen!2stz!4v1688638781000!5m2!1sen!2stz"
                  width="100%"
                  height="220"
                  style={{ border: 0, borderRadius: '14px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
            <div className="contact-actions-pro">
              <Link to="/login" className="admin-login-btn-pro">
                <FontAwesomeIcon icon={faUserShield} /> Sign Up or In
              </Link>
              <Link to="/" className="back-btn-pro">
                <FontAwesomeIcon icon={faHome} /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
