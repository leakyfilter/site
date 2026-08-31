const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const esbuild = require("esbuild");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const listings = require("../content/jobs/listings.json");

test("job board renders all records, controls, reference, and honest monitoring state", async () => {
  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, "../components/JobBoard.jsx")],
    bundle: true, write: false, platform: "node", format: "cjs",
    external: ["react"], loader: { ".md": "text", ".css": "empty" },
  });
  const compiled = { exports: {} };
  new Function("require", "module", "exports", result.outputFiles[0].text)(require, compiled, compiled.exports);
  const html = renderToStaticMarkup(React.createElement(compiled.exports.default));
  assert.equal((html.match(/class="job-card"/g) || []).length, listings.length);
  assert.match(html, /Manual snapshot · scan off/);
  assert.match(html, /Unlisted, not access-controlled/);
  assert.match(html, /aria-label="Filter by career direction"/);
  assert.match(html, /Search jobs/);
  assert.match(html, /Sort jobs/);
  assert.match(html, /Company/);
  assert.match(html, /download="career-direction.md"/);
  assert.match(html, /Compensation not listed/);
  assert.match(html, /larger company/);
  for (const job of listings) {
    assert.ok(html.includes(`href="${job.url}"`), `Listing link missing for ${job.id}`);
    assert.ok(html.includes(`id="job-${job.sourceId}"`));
  }
  for (const link of html.matchAll(/<a [^>]*href="https:[^>]*>/g)) {
    assert.match(link[0], /rel="noopener noreferrer"/);
  }
});
