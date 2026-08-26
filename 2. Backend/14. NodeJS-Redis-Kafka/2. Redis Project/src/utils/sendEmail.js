// In a real app this would call an email provider's API (SendGrid, SES,
// Resend, etc). We simulate the delay so the queue/worker split in
// worker.js actually has something slow to demonstrate, instead of just
// returning instantly.
async function sendWelcomeEmail(email, name) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`[EMAIL] Welcome email sent to ${email} (${name})`);
}

module.exports = sendWelcomeEmail;
