const adminMiddleware = (req, res, next) => {
  try {
    const user = req.userInfo;
    if (user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this page, authorization required",
      });
    }
    // res.status(200).json({
    //   success: true,
    //   message: "Hello Admin ",
    //   user,
    // });
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Unauthorized to access this page",
    });
  }
};

module.exports = adminMiddleware;
