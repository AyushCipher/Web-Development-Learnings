// Importing React's useState hook for managing component state
import { useState } from "react";

// Importing motion component from Framer Motion for animations
import { motion } from "framer-motion";

// Importing EmailJS SDK
import emailjs from "@emailjs/browser";

// Importing Particles Background (same as Home component)
import ParticlesBackground from "../components/ParticlesBackground.jsx";

// Importing the contact image asset
import Astra from "../assets/Astra.png";

// Reading EmailJS credentials from environment variables (Vite)
const SERVICE_ID = import.meta.env.VITE_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_TEMPLATE_ID;
const AUTO_REPLY_TEMPLATE_ID = import.meta.env.VITE_AUTO_REPLY_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;

export default function Contact() {
  const [formData, setFormData] = useState({
    from_name: "",
    from_email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "budget" && value && !/^\d+$/.test(value)) return;

    setFormData((p) => ({ ...p, [name]: value }));

    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    const required = ["from_name", "from_email", "subject", "message"];
    const newErrors = {};

    required.forEach(
      (f) => !formData[f].trim() && (newErrors[f] = "Fill this field")
    );

    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setStatus("sending");
    setStatusMessage("");

    try {
      console.log("📧 Sending emails with data:", {
        SERVICE_ID,
        TEMPLATE_ID,
        AUTO_REPLY_TEMPLATE_ID,
        formData
      });

      // Create template parameters once (with time)
      const templateParams = {
        name: formData.from_name.trim(),
        email: formData.from_email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        time: new Date().toLocaleString(),
        year: new Date().getFullYear(),
        company_name: "Ayush Verma",
      };

      // Send email to you (Contact Us template)
      const contactResponse = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          ...templateParams,
          to_email: "ayushv3533e@gmail.com",
        },
        PUBLIC_KEY
      );

      console.log("✅ Contact email sent!", contactResponse);

      // Send auto-reply email to visitor (Auto-Reply template)
      const autoReplyResponse = await emailjs.send(
        SERVICE_ID,
        AUTO_REPLY_TEMPLATE_ID,
        {
          ...templateParams,
          email: formData.from_email.trim(), // ✅ Recipient email for auto-reply (matches {{email}} in template)
        },
        PUBLIC_KEY
      );

      console.log("✅ Auto-reply email sent!", autoReplyResponse);

      setStatus("success");
      setStatusMessage("Message sent successfully! I'll get back to you soon. 📧");
      setFormData({from_name: "",from_email: "",subject: "",message: ""});
      
      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setStatus("");
        setStatusMessage("");
      }, 5000);
    } catch (err) {
      console.error("❌ EmailJS Error:", {
        status: err.status,
        text: err.text,
        message: err.message,
        fullError: err
      });
      setStatus("error");
      setStatusMessage(err.text || "Failed to send message. Please try again later.");
    }
  };

  return (
    <section
      id="contact" className="w-full min-h-screen relative bg-black overflow-hidden text-white py-20 px-6 md:px-20 flex flex-col md:flex-row items-center gap-10">
      {/* Particles Background */}
      <ParticlesBackground />

      {/* Contact Section Content */}
      <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-10">
        {/* Left Animated Image Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full md:w-1/2 flex justify-center"
        >
          <motion.img
            src={Astra}
            alt="Contact"
            className="w-72 md:w-140 rounded-2xl shadow-lg object-cover"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Right Side Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full md:w-1/2 bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10"
        >
          <h2 className="text-3xl font-bold mb-6">Let’s Work Together</h2>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Name field */}
            <div className="flex flex-col">
              <label className="mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="from_name"
                placeholder="Your Name"
                value={formData.from_name}
                onChange={handleChange}
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.from_name ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.from_name && (
                <p className="text-red-500 text-xs">{errors.from_name}</p>
              )}
            </div>

            {/* Email field */}
            <div className="flex flex-col">
              <label className="mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="from_email"
                placeholder="Your Email"
                value={formData.from_email}
                onChange={handleChange}
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.from_email ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.from_email && (
                <p className="text-red-500 text-xs">{errors.from_email}</p>
              )}
            </div>

            {/* Subject field */}
            <div className="flex flex-col">
              <label className="mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                placeholder="Message Subject"
                value={formData.subject}
                onChange={handleChange}
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.subject ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.subject && (
                <p className="text-red-500 text-xs">{errors.subject}</p>
              )}
            </div>

            {/* Message textarea */}
            <div className="flex flex-col">
              <label className="mb-1">
                Message <span className="text-red-500">*</span>
              </label>

              <textarea
                name="message"
                rows={5}
                placeholder="Your message"
                value={formData.message}
                onChange={handleChange}
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.message ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              />

              {errors.message && (
                <p className="text-red-500 text-xs">{errors.message}</p>
              )}
            </div>

            {/* Status message */}
            {status && (
              <p
                className={`text-sm p-3 rounded-md ${
                  status === "success"
                    ? "bg-green-500/20 text-green-400"
                    : status === "error"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {status === "sending"
                  ? "Sending..."
                  : statusMessage || (status === "success"
                  ? "Message sent successfully ✅"
                  : "Something went wrong ❌")}
              </p>
            )}

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={status === "sending"}
              type="submit"
              className="
                bg-blue-600 
                hover:bg-blue-700 
                disabled:opacity-60 
                text-white 
                py-3 
                rounded-md 
                font-semibold 
                transition
              "
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
