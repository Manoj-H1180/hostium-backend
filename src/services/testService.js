const fs = require("fs");
const path = require("path");

const saveCodeToFile = (code, language, fileName) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, `../temp/${fileName}.${language}`);
    fs.writeFile(filePath, code, (err) => {
      if (err) {
        reject("Failed to save code to file.");
      } else {
        resolve(filePath); // Return the path where the file is saved
      }
    });
  });
};
const runTestCases = (testCases, codeOutput) => {
  return testCases.map((testCase) => {
    const expected = testCase.expected;

    // Check if the expected value has multiple valid outputs
    if (expected.includes("or")) {
      const expectedValues = expected.split("or").map((v) => Number(v.trim()));
      const result = expectedValues.includes(Number(codeOutput)); // Check if code output matches any of the expected values
      return {
        input: testCase.input,
        expected,
        result,
        codeOutput: codeOutput,
      };
    } else {
      // Normal single expected value check
      const result = codeOutput === expected; // Compare the output with expected value
      return {
        input: testCase.input,
        expected,
        result,
        codeOutput: codeOutput,
      };
    }
  });
};

module.exports = { saveCodeToFile, runTestCases };
