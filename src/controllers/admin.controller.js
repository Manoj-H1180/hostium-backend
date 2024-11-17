const adminController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "hello admin",
  });
};

module.exports = adminController;
