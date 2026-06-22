import React from "react";
import { motion } from "framer-motion";
import { POSTS } from "../data.js";
import MarkdownContent from "./MarkdownContent.jsx";

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getDisplayDate(post) {
  return post.lastUpdated ?? post.date;
}

function getPostUrl(post) {
  return `#/posts/${post.slug}`;
}

function getStatusLabel(post) {
  const status = String(post.status ?? "").toLowerCase();

  if (post.renderMode === "notion") return "Notion source";
  if (status === "done") return "Done note";
  return "Working note";
}

function NotionSourceCard({ post }) {
  const notionUrl = post.externalUrl ?? post.notionPage;

  return (
    <div className="notion-note">
      <p className="notion-note-context">
        This version keeps the evolving source material in Notion instead of converting it into a
        polished local article. Notion links often cannot be framed reliably, so the website treats
        it as a live source card with a direct handoff.
      </p>
      <a href={notionUrl} target="_blank" rel="noreferrer" className="notion-source-card">
        <span className="notion-source-label">Live Notion note</span>
        <strong>{post.sourceTitle ?? post.title}</strong>
        <span className="notion-open-link">Open in Notion →</span>
      </a>
    </div>
  );
}

export default function PostPage({ post }) {
  const displayDate = getDisplayDate(post);
  const relatedPosts = POSTS.filter((candidate) => candidate.slug !== post.slug)
    .filter((candidate) => !candidate.hidden)
    .filter((candidate) => candidate.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  return (
    <main className="article-page">
      <motion.article
        className="article-shell"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <a href="#writing" className="back-link">
          ← Back to writing
        </a>

        <header className="article-header">
          <p className="article-date">
            <time dateTime={displayDate}>{formatDate(displayDate)}</time> · {getStatusLabel(post)}
          </p>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.excerpt}</p>
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </header>

        <div className="article-body">
          {post.renderMode === "notion" ? (
            <NotionSourceCard post={post} />
          ) : (
            <MarkdownContent content={post.content} />
          )}
        </div>
      </motion.article>

      {relatedPosts.length ? (
        <section className="related-writing" aria-labelledby="related-writing-title">
          <h2 id="related-writing-title">More writing</h2>
          <div className="related-list">
            {relatedPosts.map((related) => (
              <a key={related.slug} href={getPostUrl(related)} className="related-item">
                <time dateTime={getDisplayDate(related)}>{formatDate(getDisplayDate(related))}</time>
                <h3>{related.title}</h3>
                <span className="related-link">Read →</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
