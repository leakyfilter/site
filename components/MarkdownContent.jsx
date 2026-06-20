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
          className="markdown-link"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      nodes.push(
        <code
          key={`${match.index}-code`}
          className="inline-code"
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
    <p key={key} className="markdown-paragraph">
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
    const listClassName = `markdown-list ${listType === "ol" ? "markdown-list--ordered" : "markdown-list--unordered"}`;

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
        className="markdown-code-block"
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
      const Tag = `h${level}`;
      elements.push(
        <Tag key={`h-${elements.length}`} id={id}>
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
          className="markdown-quote"
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

  return <div className="markdown-content">{elements}</div>;
}
