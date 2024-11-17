const fs = require("fs");
const path = require("path");

const saveCodeToFile = (code, language, fileName) => {
  return new Promise((resolve, reject) => {
    const fileExtension = getFileExtension(language);

    fs.writeFile(`${fileName}${fileExtension}`, code, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const getFileExtension = (language) => {
  const extensions = {
    javascript: ".js",
    python: ".py",
    java: ".java",
    cpp: ".cpp",
  };
  return extensions[language];
};

module.exports = { saveCodeToFile };
