function formatDate(value) {
  if (!value) return "Not recorded";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function getFreshness(job, now = new Date()) {
  if (job.status === "closed") return "Closed";
  const checkedAt = Date.parse(`${job.lastVerifiedAt}T00:00:00Z`);
  if (job.status !== "open" || !Number.isFinite(checkedAt) || now.getTime() - checkedAt > 14 * 86400000) return "Needs recheck";
  return "Open when checked";
}

function filterJobs(listings, companies, { query = "", track = "all", companyId = "all", sort = "priority" } = {}) {
  const companyNames = Object.fromEntries(companies.map((company) => [company.id, company.name]));
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return listings.filter((job) => {
    const searchable = [job.title, companyNames[job.companyId], job.location, job.summary, job.fit, ...job.skills].join(" ").toLowerCase();
    return job.status !== "closed" && (track === "all" || job.track === track)
      && (companyId === "all" || job.companyId === companyId)
      && terms.every((term) => searchable.includes(term));
  }).sort((left, right) => {
    if (sort === "published") return (right.sourcePublishedAt || "").localeCompare(left.sourcePublishedAt || "") || left.priority - right.priority;
    if (sort === "verified") return right.lastVerifiedAt.localeCompare(left.lastVerifiedAt) || left.priority - right.priority;
    return left.priority - right.priority;
  });
}

module.exports = { filterJobs, getFreshness, formatDate };
