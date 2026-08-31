const test = require("node:test");
const assert = require("node:assert/strict");
const { applyObservation, normalizeFeed, candidateScore, inspectGooglePage, googleLinks } = require("../lib/jobChecking.js");
const { runCheck } = require("../scripts/check-jobs.cjs");
const { filterJobs } = require("../lib/jobBoard.js");

const company = { id: "modal", name: "Modal", monitorEnabled: true, source: { type: "ashby", board: "modal", url: "https://api.ashbyhq.com/posting-api/job-board/modal" } };
const job = { id: "modal:one", sourceId: "one", companyId: "modal", title: "Inference Engineer", status: "open", lastVerifiedAt: "2026-08-30", firstSeenAt: "2026-08-30", skills: [], track: "inference", priority: 1 };
const observation = (outcome, date = "2026-08-31") => ({ outcome, date, sourceUrl: company.source.url, detail: `Verified observation: ${outcome}` });
const feedJob = { id: "one", title: "Inference Engineer", jobUrl: "https://jobs.ashbyhq.com/modal/one", descriptionPlain: "GPU runtime and memory optimization", isListed: true };

test("a single absence, failed checks, and same-day retries cannot archive an active role", () => {
  const missing = applyObservation(job, observation("missing"));
  assert.equal(missing.status, "unverified");
  assert.equal(missing.lastVerifiedAt, job.lastVerifiedAt);
  assert.equal(applyObservation(missing, observation("missing")).status, "unverified");
  const failure = applyObservation(missing, observation("error", "2026-09-01"));
  assert.equal(failure.status, "unverified");
  assert.equal(failure.lastVerifiedAt, job.lastVerifiedAt);
  assert.equal(job.status, "open");
});

test("confirmed closure or separate-day feed absences archive with evidence and retain history", () => {
  const missing = applyObservation(job, observation("missing"));
  const archived = applyObservation(missing, observation("missing", "2026-09-01"));
  assert.equal(archived.status, "closed");
  assert.equal(archived.archivedAt, "2026-09-01");
  assert.equal(archived.firstSeenAt, job.firstSeenAt);
  assert.equal(archived.availabilityHistory.length, 2);
  assert.match(archived.archiveReason, /two successful/);
  const explicit = applyObservation(job, observation("closed"));
  assert.equal(explicit.status, "closed");
  assert.equal(applyObservation(explicit, observation("error", "2026-09-01")).archivedAt, explicit.archivedAt);
});

test("an open observation restores archived roles and resets the consecutive-absence sequence", () => {
  const archived = applyObservation(job, observation("closed"));
  const reopened = applyObservation(archived, observation("open", "2026-09-01"));
  assert.equal(reopened.status, "open");
  assert.equal(reopened.archivedAt, null);
  assert.equal(reopened.lastVerifiedAt, "2026-09-01");
  assert.equal(reopened.availabilityHistory.length, 2);
  assert.equal(applyObservation(reopened, observation("missing", "2026-09-02")).status, "unverified");
  const returned = applyObservation(applyObservation(job, observation("missing")), observation("open", "2026-09-01"));
  assert.equal(applyObservation(returned, observation("missing", "2026-09-01")).status, "unverified");
  assert.throws(() => applyObservation(reopened, observation("closed")), /older observation/);
});

test("empty, malformed, partial, or foreign-company feeds cannot confirm absence", () => {
  assert.throws(() => normalizeFeed(company, { jobs: [] }), /Empty/);
  assert.throws(() => normalizeFeed(company, { jobs: [{}] }), /Incomplete/);
  assert.throws(() => normalizeFeed(company, { jobs: [{ ...feedJob, jobUrl: "https://jobs.ashbyhq.com/another/one" }] }), /Unexpected employer/);
  const greenhouse = { source: { type: "greenhouse", board: "anthropic" } };
  assert.throws(() => normalizeFeed(greenhouse, { jobs: [feedJob], meta: { total: 10 } }), /Incomplete Greenhouse/);
  const unlisted = normalizeFeed(company, { jobs: [{ ...feedJob, isListed: false }] })[0];
  assert.equal(unlisted.sourceId, "one");
  assert.equal(candidateScore(unlisted), 0);
  for (const title of ["Robot Operator", "Frontend Engineer, Inference", "Finance Systems Engineer", "Robotics Technician"]) {
    assert.equal(candidateScore({ ...unlisted, listed: true, title }), 0);
  }
});

test("Google soft-404 detection requires the exact canonical role, not stale search titles", () => {
  const canonical = '<link rel="canonical" href="https://www.google.com/about/careers/applications/jobs/results/123-test">';
  assert.equal(inspectGooglePage(`${canonical}<h2>Job not found.</h2>`, "123").outcome, "closed");
  assert.equal(inspectGooglePage(`${canonical}<h2>Job not found.</h2>`, "456").outcome, "error");
  assert.equal(inspectGooglePage(`${canonical}<title>Inference Engineer — Google Careers</title>Minimum qualifications:`, "123").outcome, "error");
  assert.equal(inspectGooglePage(`${canonical}<title>Inference Engineer — Google Careers</title>Minimum qualifications: <a href="./apply?jobId=abc">Apply</a>`, "123").outcome, "open");
  assert.equal(inspectGooglePage("<title>Access denied</title>", "123").outcome, "error");
  assert.deepEqual(googleLinks('<a href="jobs/results/123-test?q=foo">Job</a><a href="jobs/results/123-test">Job</a>'), ["https://www.google.com/about/careers/applications/jobs/results/123-test"]);
});

test("collector checks archived roles, proposes candidates without adding them, and isolates failed sources", async () => {
  const broken = { ...company, id: "other", source: { ...company.source, url: "https://example.org/broken" } };
  const otherJob = { ...job, id: "other:two", companyId: "other", sourceId: "two" };
  const input = [applyObservation(job, observation("closed")), otherJob];
  const before = structuredClone(input);
  const result = await runCheck({ companies: [company, broken], listings: input, now: new Date("2026-09-01T16:00:00Z"), fetchPage: async (url) => {
    if (url.includes("broken")) throw new Error("HTTP 503");
    return JSON.stringify({ jobs: [feedJob, { ...feedJob, id: "three", jobUrl: "https://jobs.ashbyhq.com/modal/three" }] });
  } });
  assert.equal(result.outcome, "partial");
  assert.equal(result.candidates.length, 1);
  assert.equal(result.suggestedListings.length, 2);
  assert.equal(result.suggestedListings[0].status, "open");
  assert.equal(result.suggestedListings[1].status, "unverified");
  assert.deepEqual(input, before);
});

test("archive filtering is separate from active results and composes with other filters", () => {
  const archived = applyObservation(job, observation("closed"));
  assert.equal(filterJobs([archived], [company]).length, 0);
  assert.equal(filterJobs([archived], [company], { status: "archived", query: "modal", track: "inference" }).length, 1);
  assert.equal(filterJobs([archived], [company], { status: "archived", companyId: "google" }).length, 0);
});
