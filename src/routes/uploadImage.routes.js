const express = require("express");
const imageController = require("../controllers/image.controller");
const upload = require("../middleware/multer.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/avatar",
  authMiddleware,

  upload.single("avatar"),
  imageController
);

module.exports = router;
