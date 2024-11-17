const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getUserDetails } = require("../controllers/auth.controller");
const router = express.Router();

router.get("/userdetails", authMiddleware, getUserDetails);

module.exports = router;
