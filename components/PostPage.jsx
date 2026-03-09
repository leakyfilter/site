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

function getPostUrl(post) {
  return `#/posts/${post.slug}`;
}

export default function PostPage({ post }) {
  const relatedPosts = POSTS.filter((candidate) => candidate.slug !== post.slug)
    .filter((candidate) => candidate.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-3xl"
      >
        <a
          href="#writing"
          className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Back to writing
        </a>
        <header className="mt-6 border-b border-black/10 pb-8 dark:border-white/10">
          <div className="text-sm text-slate-500 dark:text-zinc-400">{formatDate(post.date)}</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-zinc-300">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/10 px-3 py-1 text-xs dark:border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-10">
          <MarkdownContent content={post.content} />
        </div>
      </motion.article>

      {relatedPosts.length ? (
        <section className="mx-auto mt-16 max-w-3xl border-t border-black/10 pt-8 dark:border-white/10">
          <h2 className="text-lg font-semibold tracking-tight">More writing</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {relatedPosts.map((related) => (
              <a
                key={related.slug}
                href={getPostUrl(related)}
                className="rounded-2xl border border-black/10 p-4 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <div className="text-xs text-slate-500 dark:text-zinc-400">
                  {formatDate(related.date)}
                </div>
                <h3 className="mt-2 text-base font-semibold leading-snug">{related.title}</h3>
                <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">{related.excerpt}</p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
