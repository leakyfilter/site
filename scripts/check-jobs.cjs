const fs = require("node:fs/promises");
const path = require("node:path");
const { normalizeFeed, candidateScore, googleLinks, inspectGooglePage, applyObservation } = require("../lib/jobChecking.js");

const root = path.resolve(__dirname, "..");
const googleQueries = ["performance co-design", "inference performance", "ML compiler", "on-device machine learning"];

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { Accept: "application/json,text/html" } });
  if (!response.ok) throw new Error(`Employer returned HTTP ${response.status}; availability not inferred.`);
  const text = await response.text();
  if (text.length > 50_000_000) throw new Error("Unexpectedly large response; needs review.");
  return text;
}

async function runCheck({ companies, listings, fetchPage = fetchText, now = new Date() }) {
  const checkedAt = now.toISOString();
  const date = checkedAt.slice(0, 10);
  const report = { checkedAt, outcome: "complete", companyChecks: [], observations: [], candidates: [], discoveryNotes: [] };
  const known = new Set(listings.map((job) => `${job.companyId}:${job.sourceId}`));
  for (const company of companies.filter((item) => item.monitorEnabled)) {
    const existing = listings.filter((job) => job.companyId === company.id);
    if (["ashby", "greenhouse"].includes(company.source.type)) {
      try {
        const feed = normalizeFeed(company, JSON.parse(await fetchPage(company.source.url)));
        const byId = new Map(feed.map((job) => [job.sourceId, job]));
        for (const job of existing) {
          const present = byId.get(job.sourceId);
          const outcome = present ? "open" : "missing";
          report.observations.push({ id: job.id, date, outcome, sourceUrl: company.source.url, detail: present ? "Present in the employer's current published-jobs feed." : "Not present in a successful, nonempty employer feed; requires a second day's absence or explicit closure." });
        }
        report.candidates.push(...feed.filter((job) => !known.has(`${company.id}:${job.sourceId}`) && candidateScore(job) >= 5).map((job) => ({ ...job, score: candidateScore(job), availability: "open", checkedAt: date })));
        report.companyChecks.push({ companyId: company.id, status: "complete", checkedAt, jobCount: feed.length, detail: "Complete published-jobs feed checked." });
      } catch (error) {
        report.companyChecks.push({ companyId: company.id, status: "error", checkedAt, detail: error.message });
        report.observations.push(...existing.map((job) => ({ id: job.id, date, outcome: "error", sourceUrl: company.source.url, detail: error.message })));
      }
    } else if (company.id === "google") {
      let failed = 0;
      for (const job of existing) {
        try {
          const result = inspectGooglePage(await fetchPage(job.url), job.sourceId);
          if (result.outcome === "error") failed += 1;
          report.observations.push({ id: job.id, date, sourceUrl: job.url, ...result });
        } catch (error) {
          failed += 1;
          report.observations.push({ id: job.id, date, outcome: "error", sourceUrl: job.url, detail: error.message });
        }
      }
      const discovered = new Set();
      for (const query of googleQueries) {
        for (const page of [1, 2]) {
          const url = `${company.careersUrl}?q=${encodeURIComponent(query)}&sort_by=date&page=${page}`;
          try {
            const html = await fetchPage(url);
            const links = googleLinks(html);
            if (!links.length && !/0\s*<\/span>\s*jobs matched|No jobs found|No matching jobs/i.test(html)) throw new Error("Google search returned no recognizable results; needs review.");
            for (const link of links) discovered.add(link);
          } catch (error) { failed += 1; report.discoveryNotes.push({ companyId: company.id, url, detail: error.message }); }
        }
      }
      for (const url of discovered) {
        const [, sourceId, slug] = url.match(/\/results\/(\d+)-(.+)$/) || [];
        if (!sourceId || known.has(`google:${sourceId}`)) continue;
        const job = { companyId: company.id, sourceId, title: slug.replaceAll("-", " "), url, listed: true, description: "" };
        const score = candidateScore(job);
        if (score >= 5) report.candidates.push({ ...job, score, availability: "needs-detail-check" });
      }
      report.companyChecks.push({ companyId: company.id, status: failed ? "partial" : "complete", checkedAt, jobCount: discovered.size, detail: `All ${existing.length} saved roles checked individually; discovery covers the two newest result pages for each of four relevant searches, not Google's entire board.` });
    } else {
      report.companyChecks.push({ companyId: company.id, status: "error", checkedAt, detail: "No verified adapter for this company." });
    }
  }
  report.outcome = report.companyChecks.some((check) => check.status !== "complete") ? "partial" : "complete";
  report.candidates.sort((a, b) => b.score - a.score || (b.sourcePublishedAt || "").localeCompare(a.sourcePublishedAt || ""));
  const observations = new Map(report.observations.map((item) => [item.id, item]));
  report.suggestedListings = listings.map((job) => observations.has(job.id) ? applyObservation(job, observations.get(job.id)) : job);
  return report;
}

async function main() {
  const companies = JSON.parse(await fs.readFile(path.join(root, "content/jobs/companies.json"), "utf8"));
  const listings = JSON.parse(await fs.readFile(path.join(root, "content/jobs/listings.json"), "utf8"));
  const report = await runCheck({ companies, listings });
  const directory = path.join(root, ".job-check");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, "latest.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ checkedAt: report.checkedAt, outcome: report.outcome, companies: report.companyChecks, savedRoles: report.observations.length, candidatesForReview: report.candidates.length, report: ".job-check/latest.json", note: "Report only: source records are unchanged. Review candidates and apply verified observations before publishing." }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { runCheck, fetchText };
