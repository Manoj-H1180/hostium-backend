// config/config.js
require("dotenv").config();

module.exports = {
  resendApiKey: process.env.RESEND_API_KEY,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};
