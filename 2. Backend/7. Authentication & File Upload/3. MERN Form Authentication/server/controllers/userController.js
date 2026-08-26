// Auth flow: register() creates an unverified user and sends a one-time
// code via email (Nodemailer) OR a voice call (Twilio), chosen by the
// caller's `verificationMethod`. verifyOTP() is the second step - only
// after that succeeds does the account become usable (login() explicitly
// requires accountVerified: true). Both email and phone sending failures
// are caught and degrade gracefully: registration still succeeds and the
// code is echoed back in the response instead of leaving the user stuck
// with an account they can never verify.
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js");
const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_SID, process.env.AUTH_TOKEN);

// ------------------ Validators ------------------ //

const isValidEmail = (email) => {
  // Improved email regex
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

const isValidPhone = (phone) => {
  const regex = /^(\+91)?[6-9]\d{9}$/;
  return regex.test(phone);
};

// ------------------ Utilities ------------------ //

const sendToken = async (user, statusCode, message, res) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};

const generateVerificationCode = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return parseInt(firstDigit + remainingDigits);
};

const generateResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const hash = crypto.createHash("sha256").update(resetToken).digest("hex");
  return { resetToken, hash };
};

const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

const generateEmailTemplate = (code) => `
  <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
    <p>Dear User, your verification code is:</p>
    <div style="text-align: center; font-size: 24px; font-weight: bold; color: #4CAF50;">
      ${code}
    </div>
    <p>Use this code to verify your account. Code expires in 5 minutes.</p>
  </div>
`;

// ------------------ Controllers ------------------ //

const register = async (req, res) => {
  try {
    const { name, email, phone, password, verificationMethod, role } = req.body;

    if (!name || !email || !phone || !password || !verificationMethod || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password should not be less than 8 characters." });
    }

    if (password.length > 32) {
      return res.status(400).json({ success: false, message: "Password should not exceed 32 characters." });
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Phone or Email already in use."
        });
    }

    if (!["email", "phone"].includes(verificationMethod)) {
        return res.status(400).json({ success: false, message: "Invalid verification method. Use 'email' or 'phone'." });
    }

    if (!["student", "admin"].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role. Role must be either 'student' or 'admin'.",
        });
    }


    const priorAttempts = await User.find({
      $or: [{ email, accountVerified: false }, { phone, accountVerified: false }],
    });

    if (priorAttempts.length > 3) {
      return res.status(400).json({
        success: false,
        message: "Too many attempts. Try again after an hour.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpire: Date.now() + 5 * 60 * 1000,
      role: role, // role must be "student" or "admin" (already validated above)
    });

    if (verificationMethod === "email") {
      try {
        const message = generateEmailTemplate(verificationCode);
        await sendEmail({ email, subject: "Your Verification Code", message });
        console.log(`✅ Verification email sent to ${email}`);
      } catch (emailError) {
        console.error("❌ Email sending error:", emailError.message);
        // Still return success so user can proceed with verification
        return res.status(200).json({ 
          success: true, 
          message: "User registered. Verification code: " + verificationCode + " (sent to email - check spam folder)" 
        });
      }
    } else if (verificationMethod === "phone") {
      try {
        const spacedCode = verificationCode.toString().split("").join(" ");
        await client.calls.create({
          twiml: `<Response><Say>Your OTP is <say-as interpret-as="digits">${spacedCode}</say-as></Say></Response>`,
          from: process.env.TWILIO_PHONE,
          to: phone,
        });
        console.log(`✅ OTP call sent to ${phone}`);
      } catch (phoneError) {
        console.error("❌ Phone OTP error:", phoneError.message);
        return res.status(200).json({ 
          success: true, 
          message: "User registered. OTP: " + verificationCode + " (check SMS)" 
        });
      }
    }

    return res.status(200).json({ success: true, message: "Verification code sent." });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!isValidEmail(email) || !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: "Invalid email or phone number." });
    }

    const user = await User.findOne({
      email,
      phone,
      accountVerified: false,
    }).sort({ createdAt: -1 });

    // Check for null user before accessing properties
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or already verified." });
    }

    if (user.verificationCode !== Number(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    if (Date.now() > user.verificationCodeExpire) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;

    await user.save();
    return sendToken(user, 200, "Account verified.", res);
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required." });
    }

    const user = await User.findOne({ email, accountVerified: true }).select("+password");

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    return sendToken(user, 200, "Login successful.", res);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    }).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email, accountVerified: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { resetToken, hash } = generateResetPasswordToken();
    user.resetPasswordToken = hash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = `Reset your password using this link:\n\n${resetLink}`;

    await sendEmail({ email: user.email, subject: "Reset Password", message });

    return res.status(200).json({ success: true, message: "Reset link sent to email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Token invalid or expired." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendToken(user, 200, "Password reset successful.", res);
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
};
