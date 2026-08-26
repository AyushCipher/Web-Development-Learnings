import React from 'react';
import './ContactForm.css';

const ContactForm = () => {
  return (
    <div className="form-container">
      <form className="contact-form">
        <input type="text" placeholder="Name" className="form-input" />
        <input type="email" placeholder="Email" className="form-input" />
        <textarea placeholder="Message" className="form-textarea"></textarea>
        <button type="submit" className="form-button">Submit</button>
      </form>
    </div>
  );
};

export default ContactForm;
