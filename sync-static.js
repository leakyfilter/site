const fs = require("fs");
const path = require("path");

const root = __dirname;
const distDir = path.join(root, "dist");
const assetsDir = path.join(root, "assets");

fs.mkdirSync(distDir, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(distDir, "index.html"));

if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(distDir, "assets"), { recursive: true });
}
