const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const {
  problemController,
  getAllProblems,
  getSpecificProblem,
  runCode,
} = require("../controllers/problem.controller");
const router = express.Router();

router.post("/problems", authMiddleware, adminMiddleware, problemController);
router.get("/problems", authMiddleware, getAllProblems);
router.get("/problem/:id", authMiddleware, getSpecificProblem);
router.post("/problem/run-code", authMiddleware, runCode);

module.exports = router;
