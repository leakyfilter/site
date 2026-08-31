const assert = require("node:assert/strict");

function isDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

function checkUrl(value) {
  const url = new URL(value);
  assert.equal(url.protocol, "https:", "External links must use HTTPS");
  assert.ok(!url.username && !url.password, "External links must not contain credentials");
}

function validateJobBoard({ profile, companies, listings }) {
  assert.ok(profile.positioning?.trim(), "Positioning statement is required");
  assert.ok(Array.isArray(profile.tracks) && profile.tracks.length > 0, "Career tracks are required");
  const tracks = new Set(profile.tracks.map((track) => track.id));
  assert.equal(tracks.size, profile.tracks.length, "Track IDs must be unique");
  assert.ok(Array.isArray(companies) && Array.isArray(listings), "Companies and listings must be arrays");
  const companyIds = new Set();
  for (const company of companies) {
    assert.ok(company.id && !companyIds.has(company.id), "Company IDs must be present and unique");
    companyIds.add(company.id);
    assert.ok(company.name?.trim(), "Company name is required");
    assert.ok(["requested", "proposed"].includes(company.selection), "Company selection must be explicit");
    assert.equal(typeof company.monitorEnabled, "boolean", "Monitoring state must be explicit");
    assert.ok(["ashby", "careers"].includes(company.source.type), "Unsupported company source");
    if (company.source.type === "ashby") assert.ok(/^[a-z0-9-]+$/.test(company.source.board), "Invalid Ashby board");
    checkUrl(company.careersUrl);
    checkUrl(company.source.url);
    checkUrl(company.funding.sourceUrl);
    assert.ok(isDate(company.funding.checkedAt), "Funding context needs a check date");
  }

  const ids = new Set();
  const urls = new Set();
  for (const job of listings) {
    assert.ok(companyIds.has(job.companyId), `Unknown company: ${job.companyId}`);
    assert.ok(tracks.has(job.track), `Unknown track: ${job.track}`);
    assert.equal(job.id, `${job.companyId}:${job.sourceId}`, "Use a stable company/source identity");
    assert.ok(!ids.has(job.id), `Duplicate job: ${job.id}`);
    ids.add(job.id);
    assert.ok(!urls.has(job.url), `Duplicate listing URL: ${job.url}`);
    urls.add(job.url);
    checkUrl(job.url);
    for (const key of ["sourceId", "title", "location", "workplace", "level", "summary", "fit", "stretch", "watchFor", "verification"]) {
      assert.ok(typeof job[key] === "string" && job[key].trim(), `Missing ${key} for ${job.id}`);
    }
    assert.ok(job.salary === null || (typeof job.salary === "string" && job.salary.trim()), "Unknown salary must be null");
    assert.ok(Array.isArray(job.skills) && job.skills.every((skill) => typeof skill === "string"), "Skills must be text");
    assert.ok([1, 2, 3].includes(job.priority), "Priority must be 1, 2, or 3");
    assert.ok(["open", "closed", "unverified"].includes(job.status), "Unknown job status");
    assert.ok(isDate(job.firstSeenAt) && isDate(job.lastVerifiedAt), "Valid observation dates required");
    assert.ok(job.lastVerifiedAt >= job.firstSeenAt, "Verification cannot precede the first observation");
    assert.ok(job.sourcePublishedAt === null || isDate(job.sourcePublishedAt), "Unknown publication date must be null");
  }
  return true;
}

module.exports = { validateJobBoard };
