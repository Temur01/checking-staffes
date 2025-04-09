const fs = require("fs-extra");
const path = require("path");

// Define paths
const srcDir = path.join(__dirname, "src");
const nodeModulesDir = path.join(__dirname, "node_modules");
const distDir = path.join(__dirname, "dist", "Face Verification");
const packageJson = path.join(__dirname, "package.json");

// Create dist directory if it doesn't exist
console.log("Creating distribution directory...");
fs.ensureDirSync(distDir);

// Copy source files
console.log("Copying source files...");
fs.copySync(srcDir, path.join(distDir, "src"));

// Copy package.json
console.log("Copying package.json...");
fs.copySync(packageJson, path.join(distDir, "package.json"));

// Copy required node_modules
console.log("Copying required node_modules...");
const requiredModules = ["electron", "axios", "path", "os"];
requiredModules.forEach((module) => {
  const modulePath = path.join(nodeModulesDir, module);
  if (fs.existsSync(modulePath)) {
    fs.copySync(modulePath, path.join(distDir, "node_modules", module));
  }
});

// Create start.bat file
console.log("Creating startup script...");
const startBatContent = `@echo off
echo Starting Face Verification Application...
cd /d "%~dp0"
.\\node_modules\\electron\\dist\\electron.exe .
`;
fs.writeFileSync(path.join(distDir, "start.bat"), startBatContent);

console.log("Build completed successfully!");
console.log(`Application is available at: ${distDir}`);
