const mongoose = require("mongoose");
const { Schema } = mongoose;

const SolvedProblemSchema = new Schema({
  problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
  problemName: { type: String, required: true },
  problemDifficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  problemSolvedDate: { type: Date, required: true },
  problemSolvedTime: { type: String, required: true },
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  solvedProblems: [SolvedProblemSchema],
  solvedProblemCount: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
