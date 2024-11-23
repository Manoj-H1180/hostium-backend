const Problem = require("../model/problems.model");
const User = require("../model/user.model");
const Image = require("../model/image.model");
const { runCodeInDocker } = require("../services/dockerService");
const { successResponse, errorResponse } = require("../utils/response");
const { functionRegexes } = require("../utils/regex");

//add problems api
const problemController = async (req, res) => {
  try {
    const { title, description, difficulty, testCases } = req.body;

    // Validate the incoming data
    if (!title || !description || !difficulty || !testCases) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Create a new problem document
    const newProblem = new Problem({
      title,
      description,
      difficulty,
      testCases,
    });

    await newProblem.save();
    res.status(201).json({
      success: true,
      message: "Problem saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving problem",
      error,
    });
  }
};

//get all problems
const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();

    const userId = req.userInfo.id;

    const userDetails = await User.findById(userId).select(
      "solvedProblems name email username avatarImage"
    );

    const imgDetails = await Image.find({ uploadedBy: userId }).select(
      "url uploadedBy"
    );
    // Filter the problems to include user-specific data
    const filteredProblems = problems.map((problem) => {
      if (problem.solvedBy && problem.solvedBy.toString() !== userId) {
        return {
          ...problem.toObject(),
          isSolved: false,
          solvedBy: null,
          sollution: "",
        };
      }
      return problem;
    });

    res.status(200).json({
      success: true,
      message: "Problems fetched",
      problems: filteredProblems,
      user: userDetails,
      imgDetails,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error getting problems",
      error,
    });
  }
};

const getSpecificProblem = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch problem details
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // Hide sensitive data if the current user is not the solver
    const userId = req.userInfo.id;
    if (problem.solvedBy && problem.solvedBy.toString() !== userId) {
      problem.isSolved = false;
      problem.solvedBy = null;
      problem.sollution = "";
    }

    res.status(200).json({
      success: true,
      message: "Problem fetched",
      problem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to fetch the problem",
      error,
    });
  }
};

// const functionRegexes = {
//   python: /def\s+([a-zA-Z0-9_]+)\s*\(/, // For Python functions
//   javascript: /function\s+([a-zA-Z0-9_]+)\s*\(/, // For JavaScript functions
//   java: /(public\s+\S+\s+\S+)\s*\(/, // For Java functions
//   cpp: /([a-zA-Z0-9_]+)\s*\(/, // For C/C++ functions
//   c: /([a-zA-Z0-9_]+)\s*\(/, // For C functions
// };

const runCode = async (req, res) => {
  const { code, language, id, testCases } = req.body;

  // Validate required fields
  if (!code || !language || !id || !testCases || !Array.isArray(testCases)) {
    return res
      .status(400)
      .json(
        errorResponse(
          "Missing or invalid fields: code, language, id, or testCases"
        )
      );
  }

  const testCasesList = testCases.map((testCase) => testCase.input);
  const funcName = functionRegexes[language]?.exec(code)?.[1]; // Get function name from code

  try {
    // Fetch problem details from DB
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json(errorResponse("Problem not found"));
    }

    let executionResults = [];

    // Execute the code based on the language
    executionResults = await Promise.all(
      testCasesList.map(async (testCaseInput, index) => {
        const result = await runCodeInDocker(code, language, testCaseInput);
        const expected = testCases[index].expected;
        return {
          input: testCaseInput,
          expected,
          output: result.output,
          result: result.output === expected ? "Passed" : "Failed",
        };
      })
    );

    // Check if the problem is solved (all test cases passed)
    const isProblemSolved = executionResults.every(
      (result) => result.result === "Passed"
    );

    if (isProblemSolved) {
      await updateUserSolvedProblem(req.userInfo.id, problem);
    }

    // Return the results for all test cases
    return res
      .status(200)
      .json(successResponse(executionResults, "Code executed successfully"));
  } catch (err) {
    console.error("Error during code execution:", err);
    return res
      .status(500)
      .json(errorResponse(err.message || "Failed to execute code"));
  }
};

/**
 * Updates the user's solved problems if the problem is solved.
 */
const updateUserSolvedProblem = async (userId, problem) => {
  try {
    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (!validDifficulties.includes(problem.difficulty)) {
      throw new Error("Invalid problem difficulty");
    }

    const incrementField = `solvedProblemCount.${problem.difficulty.toLowerCase()}`;

    // Fetch user and check if the problem is already solved
    const user = await User.findById(userId);
    const alreadySolved = user.solvedProblems.some(
      (solvedProblem) =>
        solvedProblem.problemId.toString() === problem._id.toString()
    );

    if (!alreadySolved) {
      // Update user's solved problems and increment the count for the difficulty
      const updateProblem = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            solvedProblems: {
              problemId: problem._id,
              problemName: problem.title,
              problemDifficulty: problem.difficulty,
              problemSolvedDate: new Date(),
              problemSolvedTime: new Date().toLocaleTimeString(),
            },
          },
          $inc: {
            [incrementField]: 1,
          },
        },
        { new: true }
      );

      if (!updateProblem) {
        throw new Error("Failed to update user data.");
      }
    } else {
      console.log("Problem already solved by the user. No update made.");
    }
  } catch (err) {
    console.error("Error updating user's solved problems:", err);
    throw err;
  }
};

module.exports = {
  problemController,
  getAllProblems,
  getSpecificProblem,
  runCode,
};
