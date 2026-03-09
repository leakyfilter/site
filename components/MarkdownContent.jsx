import React from "react";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseInline(text) {
  const nodes = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={match[3]}
          className="underline decoration-slate-400/70 underline-offset-4 hover:decoration-slate-900 dark:decoration-zinc-500 dark:hover:decoration-zinc-100"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      nodes.push(
        <code
          key={`${match.index}-code`}
          className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/10"
        >
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      nodes.push(<strong key={`${match.index}-strong`}>{match[5]}</strong>);
    } else if (match[6]) {
      nodes.push(<em key={`${match.index}-em`}>{match[6]}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderParagraph(text, key) {
  if (!text) return null;
  return (
    <p key={key} className="text-base leading-8 text-slate-700 dark:text-zinc-300">
      {parseInline(text)}
    </p>
  );
}

export default function MarkdownContent({ content }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const elements = [];
  let paragraph = [];
  let listItems = [];
  let listType = null;
  let codeFence = null;
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    elements.push(renderParagraph(paragraph.join(" "), `p-${elements.length}`));
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    const listClassName =
      listType === "ol"
        ? "list-decimal space-y-2 pl-6 text-slate-700 dark:text-zinc-300"
        : "list-disc space-y-2 pl-6 text-slate-700 dark:text-zinc-300";

    elements.push(
      <Tag key={`list-${elements.length}`} className={listClassName}>
        {listItems.map((item, index) => (
          <li key={`${elements.length}-${index}`}>{parseInline(item)}</li>
        ))}
      </Tag>
    );

    listItems = [];
    listType = null;
  };

  const flushCodeBlock = () => {
    if (codeFence === null) return;
    elements.push(
      <pre
        key={`code-${elements.length}`}
        className="overflow-x-auto rounded-2xl border border-black/10 bg-zinc-950 p-4 text-sm text-zinc-100 dark:border-white/10"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
    codeFence = null;
    codeLines = [];
  };

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();
      if (codeFence === null) {
        codeFence = line.slice(3).trim();
      } else {
        flushCodeBlock();
      }
      return;
    }

    if (codeFence !== null) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const id = slugify(text);
      const headingClasses = {
        1: "text-4xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50",
        2: "text-2xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50",
        3: "text-xl font-semibold tracking-tight text-slate-950 dark:text-zinc-100",
      };
      const Tag = `h${level}`;
      elements.push(
        <Tag key={`h-${elements.length}`} id={id} className={headingClasses[level]}>
          {parseInline(text)}
        </Tag>
      );
      return;
    }

    const blockquoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className="border-l-2 border-slate-300 pl-4 text-base italic leading-8 text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
        >
          {parseInline(blockquoteMatch[1])}
        </blockquote>
      );
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType && listType !== "ul") {
        flushList();
      }
      listType = "ul";
      listItems.push(unorderedMatch[1]);
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType && listType !== "ol") {
        flushList();
      }
      listType = "ol";
      listItems.push(orderedMatch[1]);
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  flushCodeBlock();

  return <div className="space-y-6">{elements}</div>;
}
