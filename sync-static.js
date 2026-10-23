const fs = require("fs");
const path = require("path");

const root = __dirname;
const distDir = path.join(root, "dist");
const assetsDir = path.join(root, "assets");
const staticDir = path.join(root, "static");

fs.mkdirSync(distDir, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(distDir, "index.html"));

if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(distDir, "assets"), { recursive: true });
}

// Standalone pages copied verbatim to the site root (e.g. static/llm-deploy-lab/ -> /llm-deploy-lab/).
if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, distDir, { recursive: true });
}
