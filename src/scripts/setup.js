const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const download = require("download");
const decompress = require("decompress");
const util = require("util");
const execAsync = util.promisify(exec);

async function setupJavaGson() {
  console.log("Setting up Gson...");
  const gsonVersion = "2.10.1";
  const gsonUrl = `https://repo1.maven.org/maven2/com/google/code/gson/gson/${gsonVersion}/gson-${gsonVersion}.jar`;

  try {
    await download(gsonUrl, "lib");
    await fs.rename(`lib/gson-${gsonVersion}.jar`, "lib/gson.jar");
    console.log("Gson setup complete");
  } catch (error) {
    console.error("Failed to setup Gson:", error);
  }
}

async function setupNlohmannJson() {
  console.log("Setting up nlohmann/json...");
  const jsonVersion = "v3.11.2";
  const jsonUrl = `https://github.com/nlohmann/json/releases/download/${jsonVersion}/json.hpp`;

  try {
    await fs.mkdir("lib/include/nlohmann", { recursive: true });
    await download(jsonUrl, "lib/include/nlohmann");
    console.log("nlohmann/json setup complete");
  } catch (error) {
    console.error("Failed to setup nlohmann/json:", error);
  }
}

async function setupJansson() {
  console.log("Setting up Jansson...");
  try {
    // For Linux
    await execAsync(
      "sudo apt-get update && sudo apt-get install -y libjansson-dev"
    );
    console.log("Jansson setup complete");
  } catch (error) {
    console.error("Failed to setup Jansson:", error);
    console.log("Please install Jansson manually:");
    console.log("- Linux: sudo apt-get install libjansson-dev");
    console.log("- macOS: brew install jansson");
    console.log("- Windows: Use MSYS2 or vcpkg");
  }
}

async function main() {
  try {
    // Create lib directory
    await fs.mkdir("lib", { recursive: true });

    // Setup all libraries
    await Promise.all([setupJavaGson(), setupNlohmannJson(), setupJansson()]);

    console.log("All JSON libraries setup complete!");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

main();
