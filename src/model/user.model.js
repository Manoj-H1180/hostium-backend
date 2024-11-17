const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const userInfo = new Schema({
  ip: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "username required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // token: {
    //   type: String,
    // },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    otp: {
      type: String,
      trim: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    userInformation: userInfo,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
