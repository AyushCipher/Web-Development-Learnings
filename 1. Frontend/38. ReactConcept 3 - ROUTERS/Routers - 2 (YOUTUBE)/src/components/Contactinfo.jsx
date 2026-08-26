import React from 'react';
import './Contactinfo.css'; // Import the CSS file

const Contactinfo = () => {
  return (
    <div className="contact-info-container">
      <div className="contact-info-item"><strong>Email:</strong> Example@gmail.com</div>
      <div className="contact-info-item"><strong>Phone:</strong> +12345678910</div>
      <div className="contact-info-item"><strong>Address:</strong> xyz street, New Delhi, 843403</div>
    </div>
  );
};

export default Contactinfo;
