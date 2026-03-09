import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PROJECTS, POSTS } from "./data.js";
import PostPage from "./components/PostPage.jsx";

const NAV_LINKS = [
  { href: "#projects", label: "Projects" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

function getRouteFromHash(hash) {
  const value = hash.replace(/^#/, "");

  if (value.startsWith("/posts/")) {
    return {
      type: "post",
      slug: decodeURIComponent(value.slice("/posts/".length)),
    };
  }

  return { type: "home", anchor: value || "home" };
}

function getPostHref(post) {
  return `#/posts/${encodeURIComponent(post.slug)}`;
}

function HomePage({
  activeTag,
  allTags,
  filteredPosts,
  filteredProjects,
  getPostLink,
  query,
  setActiveTag,
  setQuery,
}) {
  return (
    <>
      <section id="home" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-8 items-center md:grid-cols-12">
          <div className="md:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-semibold tracking-tight md:text-5xl"
            >
              Mohit Garg
            </motion.h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700 dark:text-zinc-300 md:text-lg">
              ML engineer (hardware roots) focused on reliable systems. I like building practical
              tools, keeping models grounded in measurements, and writing clearly about trade-offs.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-black/10 px-3 py-1 dark:border-white/10">
                Bengaluru -&gt; Bay Area
              </span>
              <span className="rounded-full border border-black/10 px-3 py-1 dark:border-white/10">
                LLMs • Systems • Power
              </span>
              <span className="rounded-full border border-black/10 px-3 py-1 dark:border-white/10">
                Clean design, no fuss
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              <a
                href="#projects"
                className="inline-flex items-center rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                See projects
              </a>
              <a
                href="#contact"
                className="inline-flex items-center rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                Get in touch
              </a>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative rounded-2xl border border-black/10 bg-gradient-to-b from-white to-zinc-50 p-6 dark:border-white/10 dark:from-zinc-900 dark:to-zinc-900/50">
              <h2 className="font-semibold">Focus</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-zinc-300">
                <li>• Local/offline assistants that respect privacy</li>
                <li>• Training small models with guardrails (mono, norm, constraints)</li>
                <li>• Practical ergonomics: editors, context, summaries</li>
              </ul>
              <div className="mt-4 text-xs text-slate-500 dark:text-zinc-400">
                Writing about: reasoning knobs in LLMs, evaluator design, and reproducibility.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            inputMode="search"
            placeholder="Search projects & posts…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400/60 dark:border-white/10 md:w-1/2"
            aria-label="Search content"
          />
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full px-3 py-1 text-xs border ${
                  activeTag === tag
                    ? "border-zinc-900 dark:border-zinc-100"
                    : "border-black/10 dark:border-white/10"
                }`}
                aria-pressed={activeTag === tag}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Projects</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-black/10 p-5 hover:shadow-sm dark:border-white/10"
            >
              <header className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold leading-snug">{project.title}</h3>
                <span className="whitespace-nowrap text-xs text-slate-500 dark:text-zinc-400">
                  {project.period}
                </span>
              </header>
              <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">{project.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 px-2 py-0.5 text-[11px] dark:border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {project.links?.length ? (
                <div className="mt-4 flex gap-3 text-sm">
                  {project.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="underline underline-offset-4 hover:no-underline"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </motion.article>
          ))}
        </div>
      </section>

      <section
        id="writing"
        className="mx-auto max-w-6xl border-t border-black/5 px-4 py-10 dark:border-white/5"
      >
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Writing</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <motion.a
              key={post.slug}
              href={getPostLink(post)}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="block rounded-2xl border border-black/10 p-5 hover:shadow-sm dark:border-white/10"
            >
              <div className="text-xs text-slate-500 dark:text-zinc-400">{post.date}</div>
              <h3 className="mt-1 text-lg font-semibold leading-snug">{post.title}</h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">{post.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 px-2 py-0.5 text-[11px] dark:border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto max-w-6xl border-t border-black/5 px-4 py-14 dark:border-white/5"
      >
        <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10 md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Contact</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-700 dark:text-zinc-300">
            The best emails are concrete: problem, constraints, desired outcome. I read everything.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <a
              href="mailto:hello@example.com"
              className="inline-flex items-center rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              Email
            </a>
            <a
              href="#"
              className="inline-flex items-center rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              GitHub
            </a>
            <a
              href="#"
              className="inline-flex items-center rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="inline-flex items-center rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              RSS
            </a>
          </div>
        </div>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Mohit Garg. Typeset with system UI and a monospace accent.
        </footer>
      </section>
    </>
  );
}

export default function Site() {
  const [theme, setTheme] = useState("dark");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (route.type === "post") {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    window.requestAnimationFrame(() => {
      const target = route.anchor ? document.getElementById(route.anchor) : null;
      if (target) {
        target.scrollIntoView();
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
  }, [route]);

  const allTags = useMemo(() => {
    const tagSet = new Set(["All"]);
    PROJECTS.forEach((project) => project.tags.forEach((tag) => tagSet.add(tag)));
    POSTS.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, []);

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((project) => {
      const matchesQuery = (project.title + " " + project.blurb + " " + project.tags.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTag = activeTag === "All" || project.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  const filteredPosts = useMemo(() => {
    return POSTS.filter((post) => {
      const matchesQuery = (post.title + " " + post.excerpt + " " + post.tags.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTag = activeTag === "All" || post.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  const activePost = useMemo(() => {
    if (route.type !== "post") return null;
    return POSTS.find((post) => post.slug === route.slug) ?? null;
  }, [route]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/5 dark:supports-[backdrop-filter]:bg-zinc-950/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a
              href="#home"
              className="select-none font-mono text-sm tracking-tight"
              style={{ fontFamily: "Berkeley Mono, ui-monospace, SFMono-Regular, Menlo, monospace" }}
            >
              leaky.dev
            </a>
            <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle theme"
                className="rounded-lg border border-black/10 px-3 py-1 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                onClick={() => setTheme((value) => (value === "light" ? "dark" : "light"))}
              >
                {theme === "light" ? "Dark" : "Light"}
              </button>
              <a
                href="/resume.pdf"
                className="rounded-lg border border-black/10 px-3 py-1 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                Resume
              </a>
            </div>
          </div>
        </header>

        {activePost ? (
          <PostPage post={activePost} />
        ) : route.type === "post" ? (
          <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-3xl font-semibold tracking-tight">Post not found</h1>
            <p className="mt-4 text-slate-700 dark:text-zinc-300">
              The URL does not match a post in <code>content/posts</code>.
            </p>
            <a
              href="#writing"
              className="mt-6 inline-flex items-center rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              Back to writing
            </a>
          </main>
        ) : (
          <HomePage
            activeTag={activeTag}
            allTags={allTags}
            filteredPosts={filteredPosts}
            filteredProjects={filteredProjects}
            getPostLink={getPostHref}
            query={query}
            setActiveTag={setActiveTag}
            setQuery={setQuery}
          />
        )}
      </div>
    </div>
  );
}
