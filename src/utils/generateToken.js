// utils/generateOtp.js
const crypto = require("crypto");

const generateOtp = (length = 6) => {
  // Generate a random number and extract only the desired length for OTP
  const otp = crypto
    .randomInt(0, Math.pow(10, length))
    .toString()
    .padStart(length, "0");
  return otp;
};

module.exports = { generateOtp };
