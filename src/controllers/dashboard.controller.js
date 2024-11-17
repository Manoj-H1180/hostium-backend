const dashboardController = (req, res) => {
  const user = req.userInfo;
  res.status(200).json({
    success: true,
    message: "Welcome to dashboard",
    user,
  });
};

module.exports = dashboardController;
