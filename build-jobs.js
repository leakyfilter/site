const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const config = require("./job-board.config.json");
const { validateJobBoard } = require("./lib/validateJobBoard.js");

async function buildJobs() {
  validateJobBoard({
    profile: require("./content/jobs/profile.json"),
    companies: require("./content/jobs/companies.json"),
    listings: require("./content/jobs/listings.json"),
  });
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(config.path)) {
    throw new Error("Job-board path must be a single lowercase URL slug.");
  }
  const output = path.join(__dirname, "dist", config.path);
  await esbuild.build({
    entryPoints: [path.join(__dirname, "jobs-main.jsx")],
    bundle: true,
    outfile: path.join(output, "jobs.js"),
    format: "iife",
    platform: "browser",
    minify: true,
    loader: { ".md": "text" },
    define: { "process.env.NODE_ENV": '"production"' },
  });
  fs.copyFileSync(path.join(__dirname, "jobs.html"), path.join(output, "index.html"));
  console.log(`Job board: /${config.path}/ (unlisted; not access-controlled)`);
}

buildJobs().catch((error) => { console.error(error); process.exitCode = 1; });
