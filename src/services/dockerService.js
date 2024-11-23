const { exec } = require("child_process");
const path = require("path");
const fs = require("fs").promises;

const runCodeInDocker = async (code, language, testCaseInput) => {
  const absoluteCodeDir = path.resolve(`./tmp/user-${Date.now()}`);
  let codeFilePath = "";
  let dockerCommand = "";

  try {
    await fs.mkdir(absoluteCodeDir, { recursive: true, mode: 0o777 });
    const inputFilePath = path.join(absoluteCodeDir, "input.txt");
    await fs.writeFile(inputFilePath, testCaseInput || "", { mode: 0o666 });

    console.log("Created directory:", absoluteCodeDir);
    console.log("Input file created at:", inputFilePath);

    // Generate code file and Docker command based on language
    switch (language) {
      case "javascript":
        codeFilePath = path.join(absoluteCodeDir, "userCode.js");
        await fs.writeFile(codeFilePath, code);
        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(
          /\\/g,
          "/"
        )}:/usr/src/app" node:18 sh -c "node /usr/src/app/${path.basename(
          codeFilePath
        )} /usr/src/app/input.txt"`;
        break;

      case "python":
        codeFilePath = path.join(absoluteCodeDir, "userCode.py");
        await fs.writeFile(codeFilePath, code);
        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(
          /\\/g,
          "/"
        )}:/usr/src/app" python:3.9 sh -c "python /usr/src/app/${path.basename(
          codeFilePath
        )} /usr/src/app/input.txt"`;
        break;

      case "cpp":
        codeFilePath = path.join(absoluteCodeDir, "userCode.cpp");
        await fs.writeFile(codeFilePath, code);
        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 \
-v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" gcc:11  \
sh -c "g++ /usr/src/app/userCode.cpp -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`;
        break;

      case "rust":
        codeFilePath = path.join(absoluteCodeDir, "userCode.rs");
        await fs.writeFile(codeFilePath, code);
        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" rust:latest sh -c "rustc /usr/src/app/userCode.rs -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`;
        break;

      case "java":
        codeFilePath = path.join(absoluteCodeDir, "UserCode.java");
        await fs.writeFile(codeFilePath, code);
        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" openjdk:17 sh -c "javac /usr/src/app/UserCode.java && java -cp /usr/src/app UserCode < /usr/src/app/input.txt"`;
        break;

      case "go":
        codeFilePath = path.join(absoluteCodeDir, "userCode.go");
        await fs.writeFile(codeFilePath, code);
        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" golang:1.18 sh -c "go run /usr/src/app/userCode.go < /usr/src/app/input.txt"`;
        break;

      default:
        throw new Error("Unsupported language");
    }

    const dirContents = await fs.readdir(absoluteCodeDir);
    console.log("Directory contents:", dirContents);

    await fs.access(codeFilePath);
    console.log("Code file created at:", codeFilePath);
    console.log("Running docker command:", dockerCommand);

    const result = await new Promise((resolve, reject) => {
      exec(dockerCommand, (error, stdout, stderr) => {
        if (error) {
          console.error("Docker execution error:", error);
          reject(error.message || stderr);
        } else {
          resolve(stdout || stderr);
        }
      });
    });

    return { output: result, error: null };
  } catch (err) {
    console.error("Error in running code:", err);
    return { output: null, error: err.message };
  } finally {
    try {
      await fs.rm(absoluteCodeDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Failed to clean up directory:", cleanupError);
    }
  }
};

module.exports = { runCodeInDocker };
