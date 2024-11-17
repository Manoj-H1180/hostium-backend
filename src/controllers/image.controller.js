const uploadToCloudinary = require("../helpers/cloudinary.helper");
const Image = require("../model/image.model");

const imageController = async (req, res) => {
  try {
    const avatarPath = req.file?.path;

    if (!avatarPath) {
      return res.status(403).json({
        success: false,
        message: "Avatar image required",
      });
    }

    // Sending image to cloudinary helper
    const { url, publicId } = await uploadToCloudinary(avatarPath);

    // Store the url and public id with user ID
    const newlyUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.id,
    });

    await newlyUploadedImage.save();
    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarImage: newlyUploadedImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading image",
    });
  }
};

module.exports = imageController;
