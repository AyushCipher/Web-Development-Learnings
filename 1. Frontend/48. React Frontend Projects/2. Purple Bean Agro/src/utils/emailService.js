import emailjs from 'emailjs-com';

// Initialize EmailJS with your public key
const EMAILJS_SERVICE_ID = 'service_na2ynkg';
const EMAILJS_TEMPLATE_ID = 'template_ud55bhp';
const EMAILJS_PUBLIC_KEY = 'dvaK0oCpfI7OtnUip';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const sendContactEmail = async (formData) => {
  try {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      company: formData.company || 'Not provided',
      subject: formData.subject,
      message: formData.message,
    };

    // Send main contact form email to Purple Bean Agro
    const contactResponse = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    // Send auto-reply to the customer
    const autoReplyParams = {
      from_name: formData.name,
      message: formData.message,
      from_email: formData.email, 
    };

    const autoReplyResponse = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_k4h4q7d',
      autoReplyParams
    );

    return { success: true, contactResponse, autoReplyResponse };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};
