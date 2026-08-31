const assert = require("node:assert/strict");

function plainText(value = "") {
  return String(value).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&#(?:39|x27);/gi, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}

function normalizeFeed(company, data) {
  assert.ok(Array.isArray(data.jobs) && data.jobs.length > 0, "Empty or malformed feed; do not infer closures");
  if (company.source.type === "greenhouse") assert.equal(data.meta?.total, data.jobs.length, "Incomplete Greenhouse feed");
  const jobs = data.jobs.map((job) => {
    const greenhouse = company.source.type === "greenhouse";
    const url = greenhouse ? job.absolute_url : job.jobUrl;
    const sourceId = String(job.id || "");
    assert.ok(sourceId && job.title && url, "Incomplete record in employer feed");
    const parsed = new URL(url);
    assert.equal(parsed.protocol, "https:");
    assert.equal(parsed.hostname, greenhouse ? "job-boards.greenhouse.io" : "jobs.ashbyhq.com");
    assert.ok(parsed.pathname.startsWith(`/${company.source.board}/`), "Unexpected employer board");
    return {
      sourceId, companyId: company.id, title: job.title, url,
      listed: job.isListed !== false,
      location: greenhouse ? job.location?.name : [job.location, ...(job.secondaryLocations || []).map((item) => item.location)].filter(Boolean).join("; "),
      workplace: greenhouse ? job.metadata?.find((item) => item.name === "Location Type")?.value || null : job.workplaceType || null,
      salary: job.compensation?.scrapeableCompensationSalarySummary || null,
      sourcePublishedAt: (job.publishedAt || job.first_published || "").slice(0, 10) || null,
      description: plainText(job.descriptionPlain || job.descriptionHtml || job.content || ""),
    };
  });
  assert.equal(new Set(jobs.map((job) => job.sourceId)).size, jobs.length, "Duplicate source IDs in feed");
  return jobs;
}

function candidateScore(job) {
  if (!job.listed || /\b(intern|internship|recruiter|sales|account executive|product manager|technical program manager|frontend|finance|procurement|technician|operator|security)\b/i.test(job.title)) return 0;
  if (!/engineer|architect|research|technical staff|compiler/i.test(job.title)) return 0;
  const title = job.title.toLowerCase();
  const context = `${title} ${job.description}`.toLowerCase();
  let score = 0;
  if (/inference|performance|kernel|compiler|co.?design|onboard|ml systems|hardware architect/.test(title)) score += 5;
  if (/systems|infrastructure|robot|deployment|accelerator|scheduling/.test(title)) score += 2;
  if (/gpu|cuda|tpu|llm|machine learning|deep learning|robot/.test(context)) score += 2;
  if (/memory|latency|throughput|power|profiling|runtime|resource allocation/.test(context)) score += 2;
  if (/staff|principal|manager|lead\b/.test(title)) score -= 2;
  return score;
}

function googleLinks(html) {
  return [...new Set([...html.matchAll(/href="(?:https:\/\/www\.google\.com\/about\/careers\/applications\/)?(jobs\/results\/(\d+)-[^"?]+)[^"]*"/g)]
    .map((match) => `https://www.google.com/about/careers/applications/${match[1]}`))];
}

function inspectGooglePage(html, sourceId) {
  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
  if (!canonical?.includes(`/results/${sourceId}-`)) return { outcome: "error", detail: "Unexpected redirect or missing role identity; needs recheck." };
  if (/<h2[^>]*>\s*Job not found\.\s*<\/h2>/i.test(html)) return { outcome: "closed", detail: "Google Careers explicitly says: Job not found. This job may have been taken down." };
  const title = plainText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/ — Google Careers$/, "");
  if (title && title !== "Jobs search" && /Minimum qualifications:/.test(html) && /href="\.\/apply\?jobId=/i.test(html)) {
    return { outcome: "open", detail: "Matching Google Careers role page with qualifications and an application link.", title };
  }
  return { outcome: "error", detail: "Could not confirm an active Google role and application link; needs recheck." };
}

function applyObservation(job, observation) {
  assert.ok(["open", "closed", "missing", "error"].includes(observation.outcome));
  assert.match(observation.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(observation.sourceUrl && observation.detail);
  const previous = job.availabilityHistory || [];
  assert.ok(!previous.some((entry) => entry.date > observation.date), "Cannot apply an older observation");
  const { date, outcome, sourceUrl, detail } = observation;
  const history = [...previous.filter((entry) => entry.date !== date), { date, outcome, sourceUrl, detail }].slice(-30);
  const result = { ...job, lastCheckedAt: observation.date, lastCheckOutcome: observation.outcome, availabilityHistory: history };
  if (observation.outcome === "open") {
    return { ...result, status: "open", lastVerifiedAt: observation.date, verification: observation.detail, archivedAt: null, archiveReason: null };
  }
  if (job.status === "closed") return result;
  const previousSuccessful = previous.filter((entry) => entry.outcome !== "error").at(-1);
  const repeatedMissing = observation.outcome === "missing" && previousSuccessful?.outcome === "missing" && previousSuccessful.date < observation.date;
  if (observation.outcome === "closed" || repeatedMissing) {
    return { ...result, status: "closed", archivedAt: observation.date, archiveReason: repeatedMissing ? "Absent from two successful, nonempty employer feeds on separate days." : observation.detail };
  }
  return { ...result, status: "unverified" };
}

module.exports = { plainText, normalizeFeed, candidateScore, googleLinks, inspectGooglePage, applyObservation };
