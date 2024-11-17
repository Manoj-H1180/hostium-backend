const express = require("express");
const router = express.Router();

const communicationController = require("../controllers/communicationController");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/send/chat", authMiddleware, communicationController);

module.exports = router;
