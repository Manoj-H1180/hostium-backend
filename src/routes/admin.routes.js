const express = require("express");
const adminMiddleware = require("../middleware/admin.middleware");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/admin", authMiddleware, adminMiddleware, adminController);

module.exports = router;
