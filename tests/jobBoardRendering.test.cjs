const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const esbuild = require("esbuild");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const listings = require("../content/jobs/listings.json");
const companies = require("../content/jobs/companies.json");
const logos = require("../content/jobs/logos.json");

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
  assert.match(html, /aria-label="Filter by company"/);
  assert.match(html, /aria-label="Switch to dark mode"/);
  assert.equal((html.match(/<details class="job-details">/g) || []).length, listings.length);
  assert.equal((html.match(/<details[^>]*\sopen(?:\s|=|>)/g) || []).length, 0, "Long-form notes must start collapsed");
  assert.match(html, /href="#opportunities-heading"/);
  assert.match(html, /class="jobs-mobile-status">Manual snapshot · scan off/);
  for (const company of companies) {
    assert.ok(html.includes(`src="../assets/companies/${logos[company.id]}"`), `Logo missing for ${company.id}`);
  }
  for (const job of listings) {
    assert.ok(html.includes(`href="${job.url}"`), `Listing link missing for ${job.id}`);
    assert.ok(html.includes(`id="job-${job.sourceId}"`));
  }
  for (const article of html.matchAll(/<article class="job-card"[\s\S]*?<\/article>/g)) {
    const [overview, expanded] = article[0].split('<details class="job-details">');
    assert.ok(!overview.includes("job-fit"), "Fit analysis must not crowd the overview");
    assert.ok(expanded.includes("job-fit"));
    assert.ok(expanded.includes("What to clarify"));
    assert.ok(expanded.includes("Source &amp; freshness"));
  }
  for (const link of html.matchAll(/<a [^>]*href="https:[^>]*>/g)) {
    assert.match(link[0], /rel="noopener noreferrer"/);
  }
});
