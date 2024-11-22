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
  sollution: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Problem = mongoose.model("Problem", ProblemSchema);

module.exports = Problem;
