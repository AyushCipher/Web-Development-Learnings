const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { emailQueue } = require("../queues/email.queue");
const otpService = require("../services/otp.service");
const sessionService = require("../services/session.service");

// This file is where the OTP flow (otp.service.js) and the session flow
// (session.service.js) meet. Three steps, three functions: signup() just
// creates the account and queues a welcome email - it does NOT log anyone
// in. login() checks the password and generates an OTP (returned in the
// response here only as a demo shortcut - see the note on login() below).
// verifyOtp() is the step that actually establishes the session: only once
// the OTP is confirmed do we sign the JWT, store it in Redis, and set the
// cookie.

// SIGNUP - creates the user, then hands the "send a welcome email" job off
// to the queue instead of sending it inline (see queues/email.queue.js for
// why). Doesn't log the user in - that happens via the login/OTP flow below.
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    await emailQueue.add("send-welcome-email", { email: user.email, name: user.name });

    return res.status(201).json({ success: true, user: user.toSafeJSON() });
  } catch (error) {
    console.error("Signup error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// LOGIN, STEP 1 - verify the password, then generate an OTP instead of
// logging the user in right away (OTP-based 2FA). See otp.service.js for
// how/why it's stored in Redis.
//
// NOTE: a real app would text/email this OTP and NEVER return it in the API
// response. We return it here only because this project has no real
// email/SMS provider wired up - it's a deliberate demo shortcut, called out
// in the README, not something to copy into production.
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const otp = await otpService.generateAndStoreOtp(email);
    console.log(`[OTP] ${email} -> ${otp} (expires in ${otpService.OTP_TTL_SECONDS}s)`);

    return res.json({
      success: true,
      message: "OTP generated. Check the server console (demo mode) or the 'otp' field below.",
      otp,
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// LOGIN, STEP 2 - verify the OTP, then actually establish the session:
// sign a JWT, store it in Redis (session.service.js), send it as an
// httpOnly cookie so client-side JS can't read it (XSS protection).
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "email and otp are required" });
    }

    const result = await otpService.verifyOtp(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.reason });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
      expiresIn: sessionService.SESSION_TTL_SECONDS,
    });

    await sessionService.createSession(user._id.toString(), token);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: sessionService.SESSION_TTL_SECONDS * 1000,
    });

    return res.json({ success: true, message: "Logged in", user: user.toSafeJSON() });
  } catch (error) {
    console.error("Verify OTP error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// LOGOUT - deletes the Redis session key. The JWT itself still exists in
// the browser's cookie until it expires, but requireAuth.js will now
// reject it since getSession() no longer finds a match - that's the whole
// point of keeping a session record in Redis instead of trusting the JWT
// alone.
async function logout(req, res) {
  try {
    if (req.user) {
      await sessionService.destroySession(req.user.id);
    }
    res.clearCookie("token");
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { signup, login, verifyOtp, logout };
