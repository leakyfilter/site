import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { POSTS } from "./data.js";
import PostPage from "./components/PostPage.jsx";

const FEATURED_POSTS = POSTS.filter((post) => !post.hidden).slice(0, 2);

function getPostKind(post) {
  const value = String(post.kind ?? post.type ?? post.category ?? "").toLowerCase();
  return value === "essay" || value === "essays" ? "essay" : "note";
}

function getRouteFromHash(hash) {
  const value = hash.replace(/^#/, "");

  if (value.startsWith("/posts/")) {
    return {
      type: "post",
      slug: decodeURIComponent(value.slice("/posts/".length)),
    };
  }

  return { type: "home", anchor: value || null };
}

function getPostHref(post) {
  return `#/posts/${encodeURIComponent(post.slug)}`;
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDisplayDate(post) {
  return post.lastUpdated ?? post.date;
}

function StoryCard({ index, post }) {
  const isNotionNote = post.renderMode === "notion";
  const href = isNotionNote ? post.externalUrl ?? post.notionPage ?? getPostHref(post) : getPostHref(post);
  const title = isNotionNote ? post.sourceTitle ?? post.title : post.title;
  const actionLabel = isNotionNote ? "Open in Notion →" : "Read note →";
  const displayDate = getDisplayDate(post);

  return (
    <motion.a
      href={href}
      target={isNotionNote ? "_blank" : undefined}
      rel={isNotionNote ? "noreferrer" : undefined}
      className={`story-card${isNotionNote ? " story-card--notion" : ""}`}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.16) }}
    >
      <div className="story-meta">
        <time dateTime={displayDate}>{formatDate(displayDate)}</time>
      </div>
      <div className="story-copy">
        <div className="story-kicker">{post.tags.join(" · ")}</div>
        <h3>{title}</h3>
        <p>{post.excerpt}</p>
      </div>
      <span className="story-link">{actionLabel}</span>
    </motion.a>
  );
}

function AvatarSocialLinks() {
  return (
    <div className="avatar-socials" aria-label="Social links">
      <a className="avatar-social" href="https://x.com/leakyfilter" aria-label="Twitter / X">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.9 2.5h3.3l-7.2 8.3 8.5 10.7h-6.7l-5.2-6.6-6 6.6H2.3l7.7-8.8L1.8 2.5h6.8l4.7 5.9 5.6-5.9Zm-1.2 17.1h1.8L7.6 4.3H5.7l12 15.3Z" />
        </svg>
        <span className="sr-only">Twitter / X</span>
      </a>
      <a className="avatar-social" href="https://github.com/leakyfilter" aria-label="GitHub">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.2.8-.6v-2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.6-1.4-5.6-6A4.7 4.7 0 0 1 5.9 7.5c-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2A4.7 4.7 0 0 1 20 10.7c0 4.7-2.9 5.7-5.6 6 .4.3.8 1 .8 2.1V22c0 .3.2.7.8.6A11.2 11.2 0 0 0 12 .8Z" />
        </svg>
        <span className="sr-only">GitHub</span>
      </a>
    </div>
  );
}

function HomePage({ activeTag, allTags, filteredPosts, query, setActiveTag, setQuery }) {
  const essayPosts = filteredPosts.filter((post) => getPostKind(post) === "essay");
  const notePosts = filteredPosts.filter((post) => getPostKind(post) === "note");

  return (
    <>
      <main>
        <section id="home" className="page-shell hero">
          <div className="hero-copy">
            <p className="eyebrow">ML Systems Architect · NVIDIA</p>
            <div className="hero-main">
              <motion.h1
                aria-label="I think a lot about Amdahl’s law."
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span aria-hidden="true">I think a lot about</span>
                <span aria-hidden="true">Amdahl’s law.</span>
              </motion.h1>
              <div className="hero-dek">
                <figure className="avatar-mark">
                  <img
                    src="./assets/leakyfilter.jpg"
                    alt="Abstract funnel illustration used as Mohit Garg's avatar"
                  />
                  <figcaption>leakyfilter · mark 01</figcaption>
                  <AvatarSocialLinks />
                </figure>
                <p>
                  I'm <strong>Mohit Garg</strong>. I try to understand how hardware and software
                  can be co-designed to make gpus go brrr.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="writing" className="page-shell writing-section">
          <header className="section-heading">
            <div>
              <h2>Writing</h2>
            </div>
            <span>{filteredPosts.length} entries</span>
          </header>

          <div className="filter-bar" aria-label="Writing filters">
            <input
              type="search"
              inputMode="search"
              placeholder="Search the archive"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search writing"
            />
            <div className="tag-list">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={activeTag === tag ? "active" : ""}
                  onClick={() => setActiveTag(tag)}
                  aria-pressed={activeTag === tag}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="writing-groups">
            <section className="writing-group" aria-labelledby="essays-heading">
              <div className="writing-group-heading">
                <div>
                  <h3 id="essays-heading">Essays</h3>
                  <small>
                    Arguments and project-shaped ideas from work I’ve done and patterns I’m trying
                    to understand.
                  </small>
                </div>
                <span>{essayPosts.length} entries</span>
              </div>

              {essayPosts.length ? (
                <div className="story-grid">
                  {essayPosts.map((post, index) => (
                    <StoryCard key={post.slug} index={index} post={post} />
                  ))}
                </div>
              ) : (
                <div className="empty-state empty-state--quiet">
                  <p>Essays will live here once they’re ready.</p>
                </div>
              )}
            </section>

            <section className="writing-group" aria-labelledby="notes-heading">
              <div className="writing-group-heading">
                <div>
                  <h3 id="notes-heading">Notes</h3>
                  <small>
                    Summaries of what I learned from a paper, post, codebase, talk, or technical
                    artifact.
                  </small>
                </div>
                <span>{notePosts.length} entries</span>
              </div>

              {notePosts.length ? (
                <div className="story-grid">
                  {notePosts.map((post, index) => (
                    <StoryCard key={post.slug} index={index} post={post} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No notes match this search.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveTag("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <footer className="page-shell site-footer">
        <span>© {new Date().getFullYear()} Mohit Garg</span>
        <span>San Francisco, CA</span>
      </footer>
    </>
  );
}

export default function Site() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromHash(window.location.hash));
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("leaky-theme", theme);
  }, [theme]);

  useLayoutEffect(() => {
    if (route.type === "post") {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    window.requestAnimationFrame(() => {
      if (!route.anchor || route.anchor === "home") {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      const target = route.anchor ? document.getElementById(route.anchor) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [route]);

  const allTags = useMemo(() => {
    const tags = new Set(["All"]);
    FEATURED_POSTS.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return FEATURED_POSTS.filter((post) => {
      const searchable = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesTag = activeTag === "All" || post.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  const activePost = useMemo(() => {
    if (route.type !== "post") return null;
    return POSTS.find((post) => post.slug === route.slug) ?? null;
  }, [route]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="page-shell header-inner">
          <a href="#home" className="brand">
            leaky.dev
          </a>
          <div className="header-tools">
            <button
              type="button"
              className="theme-toggle"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      {activePost ? (
        <PostPage post={activePost} />
      ) : route.type === "post" ? (
        <main className="page-shell not-found">
          <p className="eyebrow">404 · Missing note</p>
          <h1>Post not found.</h1>
          <a href="#writing">Return to writing →</a>
        </main>
      ) : (
        <HomePage
          activeTag={activeTag}
          allTags={allTags}
          filteredPosts={filteredPosts}
          query={query}
          setActiveTag={setActiveTag}
          setQuery={setQuery}
        />
      )}
    </div>
  );
}
