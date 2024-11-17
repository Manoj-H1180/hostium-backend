const mongoose = require("mongoose");
const { Schema } = mongoose;

const TestCaseSchema = new Schema({
  input: {
    type: String,
    required: true,
  },
  expected: {
    type: String,
    required: true,
  },
});

const ProblemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  testCases: [TestCaseSchema],
  solvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isSolved: {
    type: Boolean,
    default: false,
  },
  sollution: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static methods
ProblemSchema.statics.validateProblem = function (data) {
  const required = ["title", "description", "difficulty", "testCases"];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if (!Array.isArray(data.testCases) || data.testCases.length === 0) {
    throw new Error("Test cases must be a non-empty array");
  }

  if (!["Easy", "Medium", "Hard"].includes(data.difficulty)) {
    throw new Error("Invalid difficulty level");
  }

  return true;
};

const Problem = mongoose.model("Problem", ProblemSchema);

module.exports = Problem;
