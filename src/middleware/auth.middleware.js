const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const headers = req.headers["authorization"];
    const token = headers.split(" ")[1];

    //checking if token received or not
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access, please login again",
      });
    }

    //decoding token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    req.userInfo = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access, access prohibited",
    });
  }
};

module.exports = authMiddleware;
