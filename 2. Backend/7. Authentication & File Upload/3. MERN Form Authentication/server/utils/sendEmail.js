// utils/sendEmail.js

const nodeMailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Verify connection configuration
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    
    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    console.error("Error details:", err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
};

module.exports = sendEmail;
