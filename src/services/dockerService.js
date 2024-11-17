const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/docker");

const runCodeInDocker = async (code, language) => {
  const tmpDir = path.resolve("/tmp/code-runner"); // Use absolute path

  // Ensure the directory exists with proper permissions
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true, mode: 0o777 });
  }

  try {
    const containerName = uuidv4();
    const fileExtension = getFileExtension(language);
    const fileName = `${containerName}${fileExtension}`;
    const filePath = path.join(tmpDir, fileName);

    // Write file with proper permissions
    fs.writeFileSync(filePath, code, { mode: 0o666 });

    // Verify file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`Failed to create file at ${filePath}`);
    }

    const command = getDockerExecutionCommand(
      language,
      filePath,
      containerName,
      tmpDir
    );

    console.log("Executing command:", command);

    return new Promise((resolve, reject) => {
      exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        // Cleanup function
        const cleanup = () => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.error("Error deleting temporary file:", err.message);
          }
        };

        cleanup(); // Always cleanup

        if (error) {
          console.error(`Error executing code: ${error.message}`);
          return reject({ output: null, error: error.message });
        }

        if (stderr) {
          // Some languages use stderr for compilation messages
          console.warn(`stderr: ${stderr}`);
        }

        return resolve({ output: stdout, error: stderr || null });
      });
    });
  } catch (err) {
    console.error("Error in running code:", err);
    return { output: null, error: err.message };
  }
};

const getDockerExecutionCommand = (
  language,
  filePath,
  containerName,
  tmpDir
) => {
  const image = config.images[language];
  if (!image) throw new Error(`Unsupported language: ${language}`);

  const fileName = path.basename(filePath);
  const containerDir = "/code"; // Fixed container directory

  // Create a more secure Docker command with proper volume mounting and working directory
  const command = `docker run --rm --name ${containerName} \
    --network none \
    --cpus=1 \
    --memory=512m \
    --user nobody \
    -w ${containerDir} \
    -v ${tmpDir}:${containerDir}:ro \
    ${image} \
    sh -c "${getExecutionCommand(language, fileName)}"`;

  return command;
};

const getFileExtension = (language) => {
  const extensions = {
    javascript: ".js",
    python: ".py",
    java: ".java",
    cpp: ".cpp",
  };

  const ext = extensions[language];
  if (!ext) throw new Error(`Unsupported language: ${language}`);
  return ext;
};

const getExecutionCommand = (language, fileName) => {
  switch (language) {
    case "javascript":
      return `node ${fileName}`;
    case "python":
      return `python3 ${fileName}`;
    case "java": {
      const className = path.basename(fileName, ".java");
      return `javac ${fileName} && java ${className}`;
    }
    case "cpp": {
      const execName = path.basename(fileName, ".cpp");
      return `g++ ${fileName} -o ${execName} && ./${execName}`;
    }
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};

module.exports = { runCodeInDocker };
