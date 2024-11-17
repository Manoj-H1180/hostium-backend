const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/dashboard", authMiddleware, dashboardController);

module.exports = router;
