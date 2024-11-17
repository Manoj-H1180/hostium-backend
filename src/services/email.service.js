// services/email.service.js
const { Resend } = require("resend");
const config = require("../config/config");

// Initialize Resend client
const resend = new Resend(config.resendApiKey);

const sendVerificationEmail = async (userEmail, username, otp) => {
  const emailData = {
    from: "Hostium <noreply@hostium.tech>",
    to: userEmail,
    subject: "Email Verification",
    html: `
      <div style="background-color: #f3f4f6; padding: 24px; font-family: Arial, sans-serif; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px;">
        <h3 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px; text-align: center;">Hello ${username}</h3>
          <h3 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px; text-align: center;">Welcome to Hostium!</h3>
          <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px; text-align: center;">
            To verify your email, please use the OTP below:
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 24px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
              ${otp} <!-- Inject OTP here -->
            </span>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px; text-align: center;">
            If you did not sign up, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const response = await resend.emails.send(emailData);
    console.log("Verification email sent:", response);
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
