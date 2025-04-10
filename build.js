const fs = require("fs-extra");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const nodeModulesDir = path.join(__dirname, "node_modules");
const distDir = path.join(__dirname, "dist", "Face Verification");
const packageJson = path.join(__dirname, "package.json");

fs.ensureDirSync(distDir);

fs.copySync(srcDir, path.join(distDir, "src"));
fs.copySync(packageJson, path.join(distDir, "package.json"));

const requiredModules = ["electron", "axios", "path", "os"];
requiredModules.forEach((module) => {
  const modulePath = path.join(nodeModulesDir, module);
  if (fs.existsSync(modulePath)) {
    fs.copySync(modulePath, path.join(distDir, "node_modules", module));
  }
});

const startBatContent = `@echo off
echo Starting Face Verification Application...
cd /d "%~dp0"
.\\node_modules\\electron\\dist\\electron.exe .
`;
fs.writeFileSync(path.join(distDir, "start.bat"), startBatContent);
