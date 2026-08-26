const nodemailer = require("nodemailer");

// Ported over from "2. File Upload(Cloudinary)", which emailed the uploader
// whenever a file finished saving (see that project's models/File.js post-save
// hook). Here it's a plain helper called explicitly from the controller after
// a successful upload, instead of a Mongoose post-save hook - easier to see in
// the request flow and to trace if it fails, and it can't accidentally block
// unrelated saves of the same model.
//
// Same graceful-degradation pattern as "4. AUTH Advanced"'s src/lib/email.ts:
// if MAIL_* env vars aren't set, this just logs and does nothing instead of
// throwing - so upload still succeeds even without email configured.
async function sendUploadNotification(to, mediaType, url) {
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log("Email envs are not available, skipping upload notification");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || "587"),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SANGAM" <${process.env.MAIL_USER}>`,
      to,
      subject: `New ${mediaType} uploaded`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
          <h2 style="color: #333;">Hello,</h2>
          <p>A new ${mediaType} has been successfully uploaded to your account.</p>
          <p><a href="${url}" target="_blank" style="color: #007BFF;">View it here</a></p>
        </div>
      `,
    });
  } catch (error) {
    // A failed notification email should never fail the upload itself - the
    // file is already safely stored in Cloudinary and recorded in the DB by
    // the time this runs.
    console.error("Failed to send upload notification email", error);
  }
}

module.exports = { sendUploadNotification };
