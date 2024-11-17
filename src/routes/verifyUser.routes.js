const express = require("express");
const verificationController = require("../controllers/userVerification.controller");
const router = express.Router();

router.post("/verify", verificationController);

module.exports = router;
