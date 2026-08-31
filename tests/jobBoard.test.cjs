const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { filterJobs, getFreshness, formatDate } = require("../lib/jobBoard.js");
const { validateJobBoard } = require("../lib/validateJobBoard.js");
const profile = require("../content/jobs/profile.json");
const companies = require("../content/jobs/companies.json");
const listings = require("../content/jobs/listings.json");
const config = require("../job-board.config.json");
const root = path.resolve(__dirname, "..");
const dataset = () => structuredClone({ profile, companies, listings });

test("curated data has valid stable identities, sources, dates, and metadata", () => {
  assert.equal(validateJobBoard(dataset()), true);
});

test("all six requested companies have a starter listing and daily monitoring is configured", () => {
  for (const id of ["openai", "anthropic", "cohere", "modal", "baseten", "google"]) {
    assert.equal(companies.find((company) => company.id === id).selection, "requested");
    assert.ok(listings.some((job) => job.companyId === id));
  }
  assert.equal(profile.scan.enabled, true);
  assert.ok(Number.isFinite(Date.parse(profile.scan.lastRunAt)));
  assert.equal(profile.scan.scheduleLabel, "Daily check · 9 AM PT");
  assert.ok(companies.every((company) => company.monitorEnabled === true));
  assert.equal(profile.scan.companyChecks.length, companies.length);
});

test("the approved positioning is preserved in the reference and board", () => {
  const statement = "I’ve spent five years at NVIDIA building deep-learning-based runtime power allocation across CPU, GPU, memory, and I/O. I’m looking to apply that hardware-aware ML and optimization experience to inference infrastructure or onboard robotic systems.";
  assert.equal(profile.positioning, statement);
  assert.ok(fs.readFileSync(path.join(root, "docs/career-direction.md"), "utf8").includes(statement));
});

test("search is case-insensitive and AND-matches company and skill terms", () => {
  const sample = listings.filter((job) => job.id === "modal:af17da5e-23ca-4802-854d-5f0546e1ed32").map((job) => ({ ...job, status: "open" }));
  const results = filterJobs(sample, companies, { query: "   MODAL    CUDA  " });
  assert.equal(results.length, 1);
  assert.equal(results[0].title, "Member of Technical Staff - ML Performance");
});

test("company and direction filters compose and support empty results", () => {
  const results = filterJobs(listings, companies, { companyId: "etched", track: "codesign" });
  assert.equal(results.length, listings.filter((job) => job.status !== "closed" && job.companyId === "etched" && job.track === "codesign").length);
  assert.ok(results.every((job) => job.companyId === "etched" && job.track === "codesign"));
  assert.equal(filterJobs(listings, companies, { companyId: "no-such-company", track: "robotics" }).length, 0);
  assert.equal(filterJobs(listings, companies, { query: "no-such-job-qzx" }).length, 0);
  assert.equal(filterJobs(listings, companies).length, listings.filter((job) => job.status !== "closed").length);
});

test("sorting never mutates the source and places unknown publication dates last", () => {
  const before = structuredClone(listings);
  const results = filterJobs(listings, companies, { sort: "published" });
  assert.equal(results[0].sourcePublishedAt, listings.filter((job) => job.status !== "closed").map((job) => job.sourcePublishedAt || "").sort().at(-1));
  assert.equal(results.at(-1).sourcePublishedAt, null);
  assert.deepEqual(listings, before);
  const priority = filterJobs(listings, companies);
  assert.ok(priority.every((job, index) => index === 0 || job.priority >= priority[index - 1].priority));
  const fresh = dataset().listings;
  fresh[0].status = "open";
  fresh[0].lastVerifiedAt = new Date(Math.max(...fresh.map((job) => Date.parse(job.lastVerifiedAt))) + 86400000).toISOString().slice(0, 10);
  assert.equal(filterJobs(fresh, companies, { sort: "verified" })[0].id, fresh[0].id);
});

test("closed jobs are hidden without deleting history", () => {
  const data = dataset();
  data.listings[0].status = "open";
  const before = filterJobs(data.listings, companies).length;
  data.listings[0].status = "closed";
  assert.equal(filterJobs(data.listings, companies).length, before - 1);
  assert.equal(data.listings.length, listings.length);
});

test("freshness is explicit and does not claim old or uncertain listings are live", () => {
  const job = { ...listings[0], status: "open", lastVerifiedAt: "2026-08-31" };
  assert.equal(getFreshness(job, new Date("2026-09-01")), "Open when checked");
  assert.equal(getFreshness(job, new Date("2026-09-16")), "Needs recheck");
  assert.equal(getFreshness({ ...job, status: "unverified" }), "Needs recheck");
  assert.equal(getFreshness({ ...job, lastVerifiedAt: "invalid" }), "Needs recheck");
  assert.equal(getFreshness({ ...job, status: "closed" }), "Closed");
  assert.equal(formatDate("2026-08-31"), "Aug 31, 2026");
  assert.equal(formatDate(null), "Not recorded");
});

test("invalid data fails before publication", () => {
  const duplicate = dataset();
  duplicate.listings.push(duplicate.listings[0]);
  assert.throws(() => validateJobBoard(duplicate), /Duplicate job/);
  const badUrl = dataset();
  badUrl.listings[0].url = "javascript:alert(1)";
  assert.throws(() => validateJobBoard(badUrl), /HTTPS/);
  const badDate = dataset();
  badDate.listings[0].lastVerifiedAt = "2026-02-30";
  assert.throws(() => validateJobBoard(badDate), /dates/);
  const unknownCompany = dataset();
  unknownCompany.listings[0].companyId = "unknown";
  assert.throws(() => validateJobBoard(unknownCompany), /Unknown company/);
});

test("unlisted page is isolated from the homepage build and suppresses indexing/referrers", () => {
  for (const name of ["site.jsx", "main.jsx", "index.html"]) {
    const source = fs.readFileSync(path.join(root, name), "utf8");
    assert.ok(!source.includes(`/${config.path}/`));
    assert.ok(!source.includes("JobBoard"));
    assert.ok(!source.includes("content/jobs"));
  }
  const html = fs.readFileSync(path.join(root, "jobs.html"), "utf8");
  assert.match(html, /name="robots" content="noindex, nofollow, noarchive"/);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.equal(config.path, "jobs");
  const homeBundle = fs.readFileSync(path.join(root, "dist/bundle.js"), "utf8");
  assert.ok(!homeBundle.includes(`/${config.path}/`));
  assert.ok(!homeBundle.includes("deep-learning-based runtime power allocation"));
  assert.ok(!homeBundle.includes("5224564008"));
  const output = path.join(root, "dist", config.path);
  assert.ok(fs.existsSync(path.join(output, "index.html")));
  assert.ok(fs.existsSync(path.join(output, "jobs.js")));
  assert.ok(fs.existsSync(path.join(output, "jobs.css")));
  assert.equal(fs.existsSync(path.join(output, "jobs.js.map")), false);
});
