// utils/codeExecution.js
const vm2 = require("../config/vm2");
const { runCodeInDocker } = require("../services/dockerService");

const runJavaScriptCode = (code) => {
  return new Promise((resolve, reject) => {
    try {
      const result = vm2.run(code); // Executes JavaScript in VM2 sandbox
      resolve({
        output: result,
        error: null,
      });
    } catch (err) {
      reject({
        output: null,
        error: err.message,
      });
    }
  });
};

const executeCode = async (language, code, fileName) => {
  let result;

  if (language === "javascript") {
    // For JavaScript, we use VM2
    result = await runJavaScriptCode(code);
  } else {
    // For other languages (Java, Python, etc.), use Docker
    result = await runCodeInDocker(language, fileName);
  }

  return result;
};

module.exports = { executeCode, runJavaScriptCode };
