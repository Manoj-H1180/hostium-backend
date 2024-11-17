const User = require("../model/user.model");

const verificationController = async (req, res) => {
  try {
    const { _id, code } = req.body;
    // Check if user is created or not
    const user = await User.findById(_id);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
    // Removing commas and joining otp
    const otp = code.join("");

    // Check whether otp matches or not
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid otp",
      });
    } else if (user.otp === otp) {
      user.verified = true;
      user.otp = null; // Once verified, removing saved otp
      await user.save(); // Save the updated user object

      // Remove password from user object before sending response
      const userData = user.toObject();
      delete userData.password;
      return res.status(200).json({
        success: true,
        message: "Email verified",
        userData,
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).json({
      success: false,
      message: "Verification failed",
    });
  }
};

module.exports = verificationController;
