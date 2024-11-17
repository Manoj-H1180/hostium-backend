const Problem = require("../model/problems.model");
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
    res.status(200).json({
      success: true,
      message: "Problems fetched",
      problems,
      user: req.userInfo,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error getting problems",
    });
  }
};

const getSpecificProblem = async (req, res) => {
  try {
    const id = req.params.id;

    const problem = await Problem.findById(id);
    res.status(200).json({
      success: true,
      message: "Problem fetched",
      problem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to find problem, problem not exists",
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
          const updateProblem = await Problem.findByIdAndUpdate(id, {
            isSolved: true,
            solvedBy: req.userInfo._id,
            sollution: code,
          });

          await updateProblem.save();
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
