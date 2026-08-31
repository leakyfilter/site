import React, { useState } from "react";
import MarkdownContent from "./MarkdownContent.jsx";
import profile from "../content/jobs/profile.json";
import companies from "../content/jobs/companies.json";
import logos from "../content/jobs/logos.json";
import listings from "../content/jobs/listings.json";
import reference from "../docs/career-direction.md";
import { filterJobs, getFreshness, formatDate } from "../lib/jobBoard.js";
import "./JobBoard.css";

const companyById = Object.fromEntries(companies.map((company) => [company.id, company]));
const trackById = Object.fromEntries(profile.tracks.map((track) => [track.id, track]));
const priorities = { 1: "Start here", 2: "Explore", 3: "Stretch" };
const openListings = listings.filter((job) => job.status !== "closed");

function CompanyLogo({ company, small = false }) {
  return (
    <span className={`company-logo${small ? " company-logo--small" : ""}`}>
      <img src={`../assets/companies/${logos[company.id]}`} alt="" width="40" height="40" decoding="async" />
    </span>
  );
}

function CompanySidebar({ companyId, onSelect }) {
  return (
    <aside className="jobs-sidebar" aria-label="Company filters and workspace navigation">
      <a className="jobs-workspace-name" href="#top"><span className="jobs-workspace-icon" aria-hidden="true">↗</span> Next chapter</a>
      <div className="jobs-company-filters" role="group" aria-label="Filter by company">
        <button className="jobs-company-button jobs-all-companies" type="button" aria-pressed={companyId === "all"} onClick={() => onSelect("all")}>
          <span className="jobs-all-icon" aria-hidden="true">▦</span><span>All companies</span><span className="jobs-company-count">{openListings.length}</span>
        </button>
        {[{ id: "requested", label: "Your companies" }, { id: "proposed", label: "Worth exploring" }].map((group) => (
          <div className="jobs-company-group" key={group.id}>
            <h2>{group.label}</h2>
            {companies.filter((company) => company.selection === group.id).map((company) => (
              <button className="jobs-company-button" key={company.id} type="button" aria-pressed={companyId === company.id} onClick={() => onSelect(company.id)}>
                <CompanyLogo company={company} small /><span>{company.name}</span><span className="jobs-company-count">{openListings.filter((job) => job.companyId === company.id).length}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="jobs-sidebar-bottom">
        <a href="#reference">Career reference <span aria-hidden="true">↗</span></a>
        <p><span className="jobs-status-dot" aria-hidden="true" />Manual snapshot · scan off</p>
        <span>Unlisted personal workspace</span>
      </div>
    </aside>
  );
}

function JobCard({ job }) {
  const company = companyById[job.companyId];
  const freshness = getFreshness(job);

  return (
    <article className="job-card" aria-labelledby={`job-${job.sourceId}`}>
      <div className="job-card-top">
        <CompanyLogo company={company} />
        <div className="job-company-heading"><span className="job-company">{company.name}</span><span className="job-track">{trackById[job.track].label}</span></div>
        <span className={`job-priority job-priority--${job.priority}`}>{priorities[job.priority]}</span>
      </div>
      <h3 id={`job-${job.sourceId}`}><a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a></h3>
      <p className="job-facts">{job.location}<span className="job-facts-divider" aria-hidden="true">·</span><span>{job.workplace}</span></p>
      <p className="job-salary">{job.salary || "Compensation not listed"}</p>
      {freshness === "Needs recheck" && <p className="job-warning">Needs recheck · last verified {formatDate(job.lastVerifiedAt)}</p>}
      <div className="job-card-actions">
        <details className="job-details">
          <summary>Why it fits & role details<span aria-hidden="true">+</span></summary>
          <div className="job-details-content">
            <div className="job-fit"><h4>Why consider it</h4><p>{job.fit}</p></div>
            <dl>
              <dt>The work</dt><dd>{job.summary}</dd>
              <dt>What would be new</dt><dd>{job.stretch}</dd>
              <dt>What to clarify</dt><dd>{job.watchFor}</dd>
              <dt>Level</dt><dd>{job.level}</dd>
              <dt>Skills in the listing</dt><dd><div className="job-skills">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></dd>
              <dt>Funding context</dt><dd>{company.funding.summary} <a href={company.funding.sourceUrl} target="_blank" rel="noopener noreferrer">{company.funding.sourceLabel} ↗</a></dd>
              <dt>Source & freshness</dt><dd>{freshness}. {job.verification} on <time dateTime={job.lastVerifiedAt}>{formatDate(job.lastVerifiedAt)}</time>. First saved {formatDate(job.firstSeenAt)}.{job.sourcePublishedAt ? ` Employer publish date: ${formatDate(job.sourcePublishedAt)}; this may reflect an older or republished requisition.` : " Employer publish date not provided."}</dd>
            </dl>
            <p className="job-disclaimer">Fit and stretch are personal assessments, not employer claims. Compensation is the published range, not an offer; geography and level may change it.</p>
          </div>
        </details>
        <a className="job-listing-link" href={job.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${job.title} at ${company.name}`}>View listing <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  );
}

export default function JobBoard({ theme = "light", onToggleTheme }) {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("all");
  const [companyId, setCompanyId] = useState("all");
  const [sort, setSort] = useState("priority");
  const jobs = filterJobs(listings, companies, { query, track, companyId, sort });
  const latestCheck = listings.map((job) => job.lastVerifiedAt).sort().at(-1);
  const hasFilters = query || track !== "all" || companyId !== "all";

  function clearFilters() {
    setQuery("");
    setTrack("all");
    setCompanyId("all");
    setSort("priority");
  }

  return (
    <div className="jobs-workspace" id="top">
      <a className="jobs-skip-link" href="#opportunities-heading">Skip to opportunities</a>
      <CompanySidebar companyId={companyId} onSelect={setCompanyId} />
      <main className="jobs-page">
        <header className="jobs-heading">
          <div className="jobs-heading-top"><span className="jobs-eyebrow">{profile.name} / Career workspace</span><button className="jobs-theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? "Light mode" : "Dark mode"}</button></div>
          <h1>Find your next chapter.</h1>
          <p className="jobs-intro">{profile.principle}</p>
          <div className="jobs-positioning-card"><p className="jobs-eyebrow">Your positioning</p><blockquote>{profile.positioning}</blockquote></div>
        </header>

        <section className="jobs-results" aria-labelledby="opportunities-heading">
          <div className="jobs-section-heading"><h2 id="opportunities-heading" tabIndex="-1">{companyId === "all" ? "Opportunities" : companyById[companyId].name}<span className="jobs-result-count" aria-live="polite" role="status">{jobs.length}<span className="sr-only"> of {openListings.length} listings</span></span></h2>{hasFilters && <button className="jobs-clear-filters" type="button" onClick={clearFilters}>Clear filters</button>}</div>
          <div className="jobs-track-filters" role="group" aria-label="Filter by career direction">
            <button type="button" aria-pressed={track === "all"} onClick={() => setTrack("all")}>All directions</button>
            {profile.tracks.map((item) => <button type="button" key={item.id} aria-pressed={track === item.id} onClick={() => setTrack(item.id)}>{item.label}</button>)}
          </div>
          <div className="jobs-filter-row">
            <label className="jobs-search"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.75" cy="10.75" r="6.25" /><path d="m16 16 4 4" /></svg><span className="sr-only">Search jobs</span><input type="search" placeholder="Search roles, skills, or locations…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <label className="jobs-mobile-companies"><span className="sr-only">Company</span><select value={companyId} onChange={(event) => setCompanyId(event.target.value)}><option value="all">All companies</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
            <label className="jobs-sort"><span className="sr-only">Sort jobs</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="priority">Suggested priority</option><option value="published">Employer publish date</option><option value="verified">Recently checked</option></select></label>
          </div>
          <p className="jobs-snapshot-note"><span className="jobs-mobile-status">Manual snapshot · scan off</span>Checked {formatDate(latestCheck)} <span aria-hidden="true">·</span> Confirm availability on the employer’s page.</p>
          <div className="jobs-list">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            {!jobs.length && <div className="jobs-empty"><h3>No matching roles.</h3><p>Try another company, direction, or search.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
          </div>
          <p className="jobs-priority-note">“Start here” means promising fit, not confirmed qualifications.</p>
        </section>

        <section className="jobs-resources" aria-label="Watchlist and career reference">
          <details className="jobs-resource">
            <summary><span><span className="jobs-resource-title">Company watchlist</span><span className="jobs-resource-description">{companies.length} companies · sources & funding context</span></span><span className="jobs-expand-icon" aria-hidden="true">+</span></summary>
            <div className="jobs-resource-body">
              <p>{profile.scan.note} Funding context is sourced, but runway and financial health have not been verified.</p>
              <div className="jobs-watchlist-companies">{companies.map((company) => <div className="jobs-watchlist-company" key={company.id}><CompanyLogo company={company} /><div><a href={company.careersUrl} target="_blank" rel="noopener noreferrer">{company.name} ↗</a><span className="jobs-watchlist-selection">{company.selection === "requested" ? "Requested" : "Proposed addition"}{company.id === "google" ? " · larger company" : ""}</span><p>{company.funding.summary} <a href={company.funding.sourceUrl} target="_blank" rel="noopener noreferrer">Source ↗</a></p></div></div>)}</div>
            </div>
          </details>
          <details id="reference" className="jobs-resource">
            <summary><span><span className="jobs-resource-title">Career reference</span><span className="jobs-resource-description">Your saved direction & decision criteria</span></span><span className="jobs-expand-icon" aria-hidden="true">+</span></summary>
            <div className="jobs-resource-body">
              <a className="jobs-reference-download" href={`data:text/markdown;charset=utf-8,${encodeURIComponent(reference)}`} download="career-direction.md">Download Markdown ↓</a>
              <p className="jobs-reference-question">“What would I be uniquely useful at on day one, and what would I become good at over the next two years?”</p>
              <MarkdownContent content={reference} />
            </div>
          </details>
        </section>
        <footer className="jobs-footer"><p>Unlisted, not access-controlled. No homepage link. Anyone with this URL—or access to the published source—can find this page.</p><a href="../">← leaky.dev</a></footer>
      </main>
    </div>
  );
}
