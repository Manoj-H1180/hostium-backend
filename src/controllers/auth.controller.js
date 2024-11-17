const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");

const { sendVerificationEmail } = require("../services/email.service");
const { generateOtp } = require("../utils/generateToken");
const generateJWTToken = require("../utils/generate.jwt.token");
const image = require("../model/image.model");

//register controller
const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const ip = req.clientIp;
    const geo = geoip.lookup(ip);

    // Check if the IP is IPv4 or IPv6
    const isIPv4 = ip.includes(".");
    const isIPv6 = ip.includes(":");

    const userInformation = {
      ip: ip || "Unknown",
      ipVersion: isIPv4 ? "IPv4" : isIPv6 ? "IPv6" : "Unknown",
      city: (geo && geo.city) || "Unknown",
      country: (geo && geo.country) || "Unknown",
      region: (geo && geo.region) || "Unknown",
      latitude: (geo && geo.ll && geo.ll[0]) || "Unknown",
      longitude: (geo && geo.ll && geo.ll[1]) || "Unknown",
    };

    //check if user is already exists or not
    const isUserExists = await User.findOne({ $or: [{ username }, { email }] });

    if (isUserExists) {
      return res.status(400).json({
        success: false,
        message: "User with either username or email is already existed",
      });
    }

    //creating verification otp
    const otp = generateOtp();

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating jwt token

    const token = generateJWTToken(username, email);

    //inserting or creating user into database
    const createdUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      otp,
      userInformation,
    });

    await createdUser.save();

    //checking whether user created or not
    if (!createdUser) {
      return res.status(400).json({
        success: false,
        message: "Error occured while creating user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration successfull",
      data: { createdUser },
      token,
    });

    //sending verification token
    await sendVerificationEmail(email, username, otp);
  } catch (error) {
    console.log(`Something went wrong in register api, ${error}`);
  }
};

//login controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.clientIp;
    const geo = geoip.lookup(ip);

    // Check if the IP is IPv4 or IPv6
    const isIPv4 = ip.includes(".");
    const isIPv6 = ip.includes(":");

    const userInformation = {
      ip: ip || "Unknown",
      ipVersion: isIPv4 ? "IPv4" : isIPv6 ? "IPv6" : "Unknown",
      city: (geo && geo.city) || "Unknown",
      country: (geo && geo.country) || "Unknown",
      region: (geo && geo.region) || "Unknown",
      latitude: (geo && geo.ll && geo.ll[0]) || "Unknown",
      longitude: (geo && geo.ll && geo.ll[1]) || "Unknown",
    };

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find the user with the email,
    const existingUser = await User.findOne({ email });

    // Check if user exists
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email not registered",
      });
    }

    // Compare passwords
    const isPasswordMatched = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const token = generateJWTToken(existingUser);

    // Remove password from user object before sending response
    const userWithoutPassword = existingUser.toObject();
    delete userWithoutPassword.password;

    await User.findByIdAndUpdate(existingUser._id, {
      userInformation,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error(`Login error: ${error}`);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.userInfo;
    const user = await User.findById(id).select("-password -otp");
    const userImageData = await image.findOne({ uploadedBy: id });

    console.log(user);

    res.status(200).json({
      success: true,
      message: "Authorized user",
      user,
      userImageData,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { registerUser, loginUser, getUserDetails };
