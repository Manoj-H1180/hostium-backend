const Problem = require("../model/problems.model");
const User = require("../model/user.model");
const { runJavaScriptCode } = require("../services/codeExecution");
const { saveCodeToFile, runTestCases } = require("../services/testService");
const { runCodeInDocker } = require("../services/dockerService");
const { successResponse, errorResponse } = require("../utils/response");
const { functionRegexes } = require("../utils/regex");
const fs = require("fs");
const path = require("path");

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
  if (!code || !language || !id || !testCases) {
    return res
      .status(400)
      .json(
        errorResponse(
          "Missing required fields: code, language, id, or testCases"
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

    let executionResults = []; // Store the results for each test case

    // Execute the code for JavaScript or other languages
    if (language === "javascript") {
      // Loop through test cases for JavaScript
      for (let i = 0; i < testCasesList.length; i++) {
        const testCaseInput = testCasesList[i];
        const result = await runJavaScriptCode(code, funcName, testCaseInput);
        executionResults.push({
          input: testCaseInput,
          expected: testCases[i].expected,
          output: result.output,
          result: result.output === testCases[i].expected ? "Passed" : "Failed",
        });
        isProblemSolved = result.output === testCases[i].expected;
      }
    } else {
      // Execute other languages using Docker
      executionResults = await Promise.all(
        testCasesList.map(async (testCaseInput, index) => {
          const result = await runCodeInDocker(code, language, testCaseInput);
          return {
            input: testCaseInput,
            expected: testCases[index].expected,
            output: result.output,
            result:
              result.output === testCases[index].expected ? "Passed" : "Failed",
          };
        })
      );
    }

    //update data if problem is solved
    for (const [index, result] of executionResults.entries()) {
      if (result.result === "Passed") {
        let solved =
          executionResults[index].expected === testCases[index].expected;
        if (solved) {
          const userId = req.userInfo.id;

          // Ensure the difficulty is valid and lowercase it for the increment field
          const validDifficulties = ["Easy", "Medium", "Hard"];
          if (!validDifficulties.includes(problem.difficulty)) {
            throw new Error("Invalid problem difficulty");
          }

          const incrementField = `solvedProblemCount.${problem.difficulty.toLowerCase()}`;

          // Check if the problem has already been solved by the user
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
              { new: true } // Return the updated user document
            );

            if (!updateProblem) {
              throw new Error("Failed to update user data.");
            }
          } else {
            console.log("Problem already solved by the user. No update made.");
          }
        }
      }
    }
    // Return the results for all test cases

    return res
      .status(200)
      .json(successResponse(executionResults, "Code executed successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(errorResponse(err.message, "Failed to execute code"));
  }
};

module.exports = {
  problemController,
  getAllProblems,
  getSpecificProblem,
  runCode,
};
