const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .withMessage(
      "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character"
    ),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (errors.array().length > 0) {
      for (let i = 0; i < errors.array().length; i++) {
        return res.status(400).json({ errors: errors.array()[i] });
      }
    }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  registerUser
);
router.post("/login", loginUser);

module.exports = router;
