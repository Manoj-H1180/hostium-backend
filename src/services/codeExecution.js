const vm2 = require("vm2");

const runJavaScriptCode = (code, funcName, testCases) => {
  const wrapCode = `
  ${code}
  const output = ${funcName}(${testCases});
  console.log(output);
  `;

  return new Promise((resolve, reject) => {
    let output = "";

    // Create a new NodeVM instance to run the code
    const vm = new vm2.NodeVM({
      console: "redirect", // Redirect the console output to capture logs
      sandbox: {
        console: {
          log: (message) => {
            output += message + "\n"; // Collect the console output
          },
        },
      },
      require: {
        external: true, // Allow external modules if needed
        builtin: ["fs", "path"], // Add other built-ins as required
      },
    });

    try {
      // Run the code inside the VM
      vm.run(wrapCode);

      // Output after the VM execution
      resolve({ output: output.trim(), error: null });
    } catch (error) {
      console.error("VM execution error:", error); // Log the error if occurs
      reject({ output: null, error: error.message });
    }
  });
};

module.exports = { runJavaScriptCode };
