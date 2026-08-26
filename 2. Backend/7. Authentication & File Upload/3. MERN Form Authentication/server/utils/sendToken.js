// utils/sendToken.js

const jwt = require("jsonwebtoken");

const sendToken = async (user, statusCode, message, res) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // Clean sensitive fields before sending
  const { password, verificationCode, verificationCodeExpire, resetPasswordToken, resetPasswordExpire, ...safeUser } = user._doc;

  const cookieOptions = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user: safeUser,
      token,
    });
};

module.exports = { sendToken };
