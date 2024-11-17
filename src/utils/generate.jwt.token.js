const jwt = require("jsonwebtoken");

const generateJWTToken = (existingUser) => {
  const token = jwt.sign(
    {
      id: existingUser._id,
      username: existingUser.username,
      role: existingUser.role,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: process.env.TOKEN_EXPIRY,
    }
  );
  return token;
};

module.exports = generateJWTToken;
