import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

// ------------------------------------------------------------
// Mohit – Personal Website (single‑file React)
// - TailwindCSS for styling (no external UI kit required)
// - Minimal, clean aesthetic with grid-based layout
// - Search + tag filters across Projects & Writing
// - Light/Dark toggle, responsive, accessible
// - Monospace stack prefers local "Berkeley Mono" if installed
//   (If you later purchase a web license, add a @font-face)
// ------------------------------------------------------------

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#writing", label: "Writing" },
  { href: "#now", label: "Now" },
  { href: "#reads", label: "Reads" },
  { href: "#uses", label: "Uses" },
  { href: "#travel", label: "Travel" },
  { href: "#contact", label: "Contact" },
];

const PROJECTS = [
  {
    title: "Local Research Assistant (Offline)",
    period: "2024 → present",
    tags: ["LLMs", "Retrieval", "On‑device"],
    blurb:
      "Designing an offline, privacy‑first research assistant for macOS that indexes PDFs, notes, and papers; query planning + semantic search running locally.",
    links: [
      { href: "#", label: "Write‑up (soon)" },
    ],
  },
  {
    title: "CPU/SoC Power Model",
    period: "2025",
    tags: ["ML", "Regression", "Energy"],
    blurb:
      "Built and validated a telemetry‑driven model for CPU power across operating points; emphasized monotonic constraints, min/max and spectral normalization variants.",
    links: [
      { href: "#", label: "Notes" },
    ],
  },
  {
    title: "Context Window Triage for Editors",
    period: "2025",
    tags: ["Tooling", "Cursor", "Productivity"],
    blurb:
      "Heuristics to summarize active buffers, shrink tokens, and preserve intent so LLM copilots stay useful in long sessions.",
    links: [
      { href: "#", label: "Gist" },
    ],
  },
  {
    title: "Audio Quality Deep‑Dive",
    period: "2024",
    tags: ["Audio", "Apple Music", "Codecs"],
    blurb:
      "Compared AAC vs ALAC on Apple devices; looked at Bluetooth transport, device DSP, and perceptual thresholds.",
    links: [
      { href: "#", label: "Summary" },
    ],
  },
];

const POSTS = [
  {
    title: "Spectral Norm, Lipschitz Hints, and Stable Training",
    date: "Aug 2025",
    tags: ["Deep Learning", "Regularization"],
    excerpt:
      "A quick tour of spectral normalization trade‑offs for small MLPs used in systems modeling.",
    href: "#",
  },
  {
    title: "Reasoning Effort Knobs in LLMs: What Actually Changes?",
    date: "Aug 2025",
    tags: ["LLMs", "Inference"],
    excerpt:
      "Notes on how reasoning‑effort settings interact with planning depth, sampling, and verifier passes.",
    href: "#",
  },
  {
    title: "Notes on Big Sur → Yosemite Weekenders",
    date: "Jul 2025",
    tags: ["Travel", "California"],
    excerpt: "Packing lists, fuel/time math, and favorite overlooks.",
    href: "#",
  },
];

const READS = {
  current: [
    { title: "Kafka on the Shore", author: "Haruki Murakami" },
  ],
  recent: [
    { title: "Norwegian Wood", author: "Haruki Murakami" },
  ],
  wishlist: [
    { title: "Clear Thinking" , author: "Shane Parrish" },
  ],
};

const USES = [
  { group: "Hardware", items: [
    "Mac (Apple Silicon)",
    "iPhone 14 Pro",
    "Logitech MX Master 3",
  ]},
  { group: "Audio & Media", items: [
    "Apple Music",
  ]},
  { group: "Fonts", items: [
    "Berkeley Mono (local install for editor)",
  ]},
  { group: "Dev", items: [
    "Python, TensorFlow",
    "VS Code / Cursor",
    "Git, P4 when needed",
  ]},
];

const TRAVEL = [
  {
    place: "Meghalaya",
    note: "for lush valleys, rain, calm.",
  },
  {
    place: "Big Sur",
    note: "fav quick coastal reset; bring layers.",
  },
  {
    place: "Yosemite",
    note: "spring and shoulder seasons shine.",
  },
  {
    place: "Tokyo (someday)",
    note: "drawn to craft, quiet, and detail.",
  },
];

export default function Site() {
  const [theme, setTheme] = useState("light");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const allTags = useMemo(() => {
    const set = new Set(["All"]);
    PROJECTS.forEach(p => p.tags.forEach(t => set.add(t)));
    POSTS.forEach(p => p.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, []);

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter(p => {
      const matchesQuery = (p.title + " " + p.blurb + " " + p.tags.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTag = activeTag === "All" || p.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  const filteredPosts = useMemo(() => {
    return POSTS.filter(p => {
      const matchesQuery = (p.title + " " + p.excerpt + " " + p.tags.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTag = activeTag === "All" || p.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
        {/* Top bar */}
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60 border-b border-black/5 dark:border-white/5">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <a href="#home" className="font-mono text-sm tracking-tight select-none" style={{fontFamily: 'Berkeley Mono, ui-monospace, SFMono-Regular, Menlo, monospace'}}>
              mohit.dev
            </a>
            <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm">
              {NAV_LINKS.map((n) => (
                <a key={n.href} href={n.href} className="hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 ring-offset-2 ring-zinc-400/60 rounded">
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle theme"
                className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              >
                {theme === "light" ? "Dark" : "Light"}
              </button>
              <a
                href="/resume.pdf"
                className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5"
              >
                Resume
              </a>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section id="home" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <motion.h1 initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6}} className="text-3xl md:text-5xl font-semibold tracking-tight">
                Mohit Garg
              </motion.h1>
              <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-700 dark:text-zinc-300">
                ML engineer (hardware roots) focused on reliable systems. I like building practical tools, keeping models grounded in measurements, and writing clearly about trade‑offs.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1">Bengaluru → Bay Area</span>
                <span className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1">LLMs • Systems • Power</span>
                <span className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1">Clean design, no fuss</span>
              </div>
              <div className="mt-6 flex gap-3">
                <a href="#projects" className="inline-flex items-center rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">See projects</a>
                <a href="#contact" className="inline-flex items-center rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">Get in touch</a>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="relative rounded-2xl p-6 border border-black/10 dark:border-white/10 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50">
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

        {/* Filters */}
        <section className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              type="search"
              inputMode="search"
              placeholder="Search projects & posts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full md:w-1/2 rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400/60"
              aria-label="Search content"
            />
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`rounded-full px-3 py-1 text-xs border ${
                    activeTag === t
                      ? "border-zinc-900 dark:border-zinc-100"
                      : "border-black/10 dark:border-white/10"
                  }`}
                  aria-pressed={activeTag === t}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Projects</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{opacity: 0, y: 8}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{ once: true, amount: 0.2 }}
                transition={{duration: 0.4, delay: i * 0.05}}
                className="rounded-2xl border border-black/10 dark:border-white/10 p-5 hover:shadow-sm"
              >
                <header className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">{p.period}</span>
                </header>
                <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">{p.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full border border-black/10 dark:border-white/10 px-2 py-0.5 text-[11px]">{t}</span>
                  ))}
                </div>
                {p.links?.length ? (
                  <div className="mt-4 flex gap-3 text-sm">
                    {p.links.map((l) => (
                      <a key={l.label} href={l.href} className="underline underline-offset-4 hover:no-underline">{l.label}</a>
                    ))}
                  </div>
                ) : null}
              </motion.article>
            ))}
          </div>
        </section>

        {/* Writing */}
        <section id="writing" className="mx-auto max-w-6xl px-4 py-10 border-t border-black/5 dark:border-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Writing</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPosts.map((post, i) => (
              <motion.a
                key={post.title}
                href={post.href}
                initial={{opacity: 0, y: 8}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{ once: true, amount: 0.2 }}
                transition={{duration: 0.4, delay: i * 0.05}}
                className="block rounded-2xl border border-black/10 dark:border-white/10 p-5 hover:shadow-sm"
              >
                <div className="text-xs text-slate-500 dark:text-zinc-400">{post.date}</div>
                <h3 className="mt-1 text-lg font-semibold leading-snug">{post.title}</h3>
                <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">{post.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span key={t} className="rounded-full border border-black/10 dark:border-white/10 px-2 py-0.5 text-[11px]">{t}</span>
                  ))}
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Now */}
        <section id="now" className="mx-auto max-w-6xl px-4 py-10 border-t border-black/5 dark:border-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Now</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
              <h3 className="font-semibold">Work</h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">Training small MLPs for telemetry → perf/power. Exploring verifier‑aided reasoning settings in LLMs. Tooling for editor context hygiene.</p>
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
              <h3 className="font-semibold">Life</h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">Moving back to the Bay Area; weighing SF vs South Bay. Keeping up with F1. Nurturing a peace lily.</p>
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
              <h3 className="font-semibold">Culture</h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">Reading Murakami; listening to Lou Reed's "Perfect Day"; learning about kintsugi and wabi‑sabi.</p>
            </div>
          </div>
        </section>

        {/* Reads */}
        <section id="reads" className="mx-auto max-w-6xl px-4 py-10 border-t border-black/5 dark:border-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Reading</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
              <h3 className="font-semibold">Current</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {READS.current.map((b) => (
                  <li key={b.title}><span className="font-medium">{b.title}</span> — {b.author}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
              <h3 className="font-semibold">Recent</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {READS.recent.map((b) => (
                  <li key={b.title}><span className="font-medium">{b.title}</span> — {b.author}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
              <h3 className="font-semibold">Wishlist</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {READS.wishlist.map((b) => (
                  <li key={b.title}><span className="font-medium">{b.title}</span> — {b.author}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Uses */}
        <section id="uses" className="mx-auto max-w-6xl px-4 py-10 border-t border-black/5 dark:border-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Uses</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {USES.map((group) => (
              <div key={group.group} className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
                <h3 className="font-semibold">{group.group}</h3>
                <ul className="mt-2 list-disc list-inside text-sm">
                  {group.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Travel */}
        <section id="travel" className="mx-auto max-w-6xl px-4 py-10 border-t border-black/5 dark:border-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Travel</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {TRAVEL.map((t) => (
              <div key={t.place} className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
                <h3 className="font-semibold">{t.place}</h3>
                <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">{t.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-6xl px-4 py-10 border-t border-black/5 dark:border-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">About</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 text-sm text-slate-700 dark:text-zinc-300 leading-7">
              <p>
                I’m a hardware‑trained engineer turned ML practitioner. I like models that stay close to physics and data, simple interfaces that get out of the way, and tools you can trust.
              </p>
              <p className="mt-3">
                Interests: AI systems, power/perf modeling, editor ergonomics, Japanese craft, and quiet weekends on twisty roads.
              </p>
            </div>
            <div className="md:col-span-1 rounded-2xl border border-black/10 dark:border-white/10 p-5">
              <h3 className="font-semibold">Fast facts</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li>Based in India for now; heading back to the Bay Area.</li>
                <li>Tracks F1; likes well‑made tools.</li>
                <li>Long‑distance relationship; Wordle is a ritual.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-6xl px-4 py-14 border-t border-black/5 dark:border-white/5">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Contact</h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-zinc-300 max-w-2xl">
              The best emails are concrete: problem, constraints, desired outcome. I read everything.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <a href="mailto:hello@example.com" className="inline-flex items-center rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">Email</a>
              <a href="#" className="inline-flex items-center rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">GitHub</a>
              <a href="#" className="inline-flex items-center rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">LinkedIn</a>
              <a href="#" className="inline-flex items-center rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">RSS</a>
            </div>
          </div>
          <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Mohit Garg. Typeset with system UI and a monospace accent.
          </footer>
        </section>
      </div>
    </div>
  );
}
