import React, { useState } from "react";
import MarkdownContent from "./MarkdownContent.jsx";
import profile from "../content/jobs/profile.json";
import companies from "../content/jobs/companies.json";
import listings from "../content/jobs/listings.json";
import reference from "../docs/career-direction.md";
import { filterJobs, getFreshness, formatDate } from "../lib/jobBoard.js";
import "./JobBoard.css";

const companyById = Object.fromEntries(companies.map((company) => [company.id, company]));
const trackById = Object.fromEntries(profile.tracks.map((track) => [track.id, track]));
const priorities = { 1: "Start here", 2: "Worth exploring", 3: "Stretch / confirm scope" };

function JobCard({ job }) {
  const company = companyById[job.companyId];
  const freshness = getFreshness(job);

  return (
    <article className="job-card" aria-labelledby={`job-${job.sourceId}`}>
      <div className="job-card-meta">
        <span className="job-company">{company.name}</span>
        <span className="job-track">{trackById[job.track].label}</span>
        <span className={`job-priority job-priority--${job.priority}`}>{priorities[job.priority]}</span>
        <span className="job-date">Checked <time dateTime={job.lastVerifiedAt}>{formatDate(job.lastVerifiedAt)}</time></span>
        <span className={freshness === "Needs recheck" ? "job-warning" : "job-freshness"}>{freshness}</span>
      </div>
      <div className="job-card-body">
        <div className="job-card-heading">
          <h3 id={`job-${job.sourceId}`}><a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a></h3>
          <a className="job-listing-link" href={job.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${job.title} at ${company.name}`}>View listing ↗</a>
        </div>
        <p className="job-facts">{job.location} <span>·</span> {job.workplace}</p>
        <p className="job-salary">{job.salary || "Compensation not listed"} <span>· {job.level}</span></p>
        <p className="job-summary">{job.summary}</p>
        <div className="job-fit"><span>Why consider it</span><p>{job.fit}</p></div>
        <details className="job-details">
          <summary>Fit, stretch & listing details</summary>
          <dl>
            <dt>What would be new</dt><dd>{job.stretch}</dd>
            <dt>What to clarify</dt><dd>{job.watchFor}</dd>
            <dt>Skills in the listing</dt><dd>{job.skills.join(" · ")}</dd>
            <dt>Funding context</dt><dd>{company.funding.summary} <a href={company.funding.sourceUrl} target="_blank" rel="noopener noreferrer">{company.funding.sourceLabel} ↗</a></dd>
            <dt>Source & freshness</dt><dd>{job.verification} on {formatDate(job.lastVerifiedAt)}. First saved {formatDate(job.firstSeenAt)}.{job.sourcePublishedAt ? ` Employer publish date: ${formatDate(job.sourcePublishedAt)}; this may reflect an older or republished requisition.` : " Employer publish date not provided."}</dd>
          </dl>
          <p className="job-disclaimer">Fit and stretch are personal assessments, not employer claims. Compensation is the published range, not an offer; geography and level may change it.</p>
        </details>
      </div>
    </article>
  );
}

export default function JobBoard() {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("all");
  const [companyId, setCompanyId] = useState("all");
  const [sort, setSort] = useState("priority");
  const jobs = filterJobs(listings, companies, { query, track, companyId, sort });
  const latestCheck = listings.map((job) => job.lastVerifiedAt).sort().at(-1);

  function clearFilters() {
    setQuery("");
    setTrack("all");
    setCompanyId("all");
    setSort("priority");
  }

  return (
    <main className="page-shell jobs-page">
      <header className="jobs-heading">
        <p className="eyebrow">Career fieldnotes · {profile.name}</p>
        <div className="jobs-title-row"><h1>Job board.</h1><span className="jobs-status">Manual snapshot · scan off</span></div>
        <blockquote className="jobs-positioning">{profile.positioning}</blockquote>
        <div className="jobs-heading-footer"><p>{profile.principle}</p><a href="#reference">Career reference ↓</a></div>
      </header>

      <section className="jobs-results" aria-labelledby="opportunities-heading">
        <div className="jobs-section-heading"><h2 id="opportunities-heading">Opportunities</h2><span aria-live="polite" role="status">{jobs.length} of {listings.filter((job) => job.status !== "closed").length} listings</span></div>
        <div className="jobs-track-filters" role="group" aria-label="Filter by career direction">
          <button type="button" aria-pressed={track === "all"} onClick={() => setTrack("all")}>All directions</button>
          {profile.tracks.map((item) => <button type="button" key={item.id} aria-pressed={track === item.id} onClick={() => setTrack(item.id)}>{item.label}</button>)}
        </div>
        <div className="jobs-filter-row">
          <label className="jobs-search"><span className="sr-only">Search jobs</span><input type="search" placeholder="Search roles, companies, skills…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label><span className="sr-only">Company</span><select value={companyId} onChange={(event) => setCompanyId(event.target.value)}><option value="all">All companies</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
          <label><span className="sr-only">Sort jobs</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="priority">Suggested priority</option><option value="published">Employer publish date</option><option value="verified">Recently checked</option></select></label>
        </div>
        <p className="jobs-snapshot-note">Last verification: {formatDate(latestCheck)}. Listings can change; confirm on the employer’s page. “Start here” means promising fit, not confirmed qualifications.</p>
        <div className="jobs-list">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          {!jobs.length && <div className="jobs-empty"><h3>No listings match these filters.</h3><p>Try a broader search or another direction.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
        </div>
      </section>

      <section className="jobs-watchlist" aria-labelledby="watchlist-heading">
        <div className="jobs-section-heading"><h2 id="watchlist-heading">Company watchlist</h2><span>{companies.length} companies · monitoring off</span></div>
        <p>{profile.scan.note} Requested companies and proposed additions are labeled below. Funding context is sourced, but runway and financial health have not been verified.</p>
        <div className="jobs-company-grid">{companies.map((company) => <div key={company.id}><a href={company.careersUrl} target="_blank" rel="noopener noreferrer">{company.name} ↗</a><span>{company.selection === "requested" ? "Requested" : "Proposed addition"}{company.id === "google" ? " · larger company" : ""}</span></div>)}</div>
      </section>

      <section id="reference" className="jobs-reference" aria-labelledby="reference-heading">
        <div className="jobs-section-heading"><h2 id="reference-heading">Career reference</h2><a href={`data:text/markdown;charset=utf-8,${encodeURIComponent(reference)}`} download="career-direction.md">Download Markdown ↓</a></div>
        <p className="jobs-reference-question">“What would I be uniquely useful at on day one, and what would I become good at over the next two years?”</p>
        <details><summary>Read the saved direction & decision criteria</summary><MarkdownContent content={reference} /></details>
      </section>
      <footer className="jobs-footer"><p>Unlisted, not access-controlled. No homepage link. Anyone with this URL—or access to the published source—can find this page.</p><a href="../">← leaky.dev</a></footer>
    </main>
  );
}
