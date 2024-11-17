const { NodeVM } = require("vm2");

module.exports = new NodeVM({
  console: "inherit",
  sandbox: {},
  require: {
    external: true,
    builtin: ["fs", "path"],
  },
  timeout: 4000, // Timeout for code execution
});
