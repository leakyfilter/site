# Content Management

This site uses markdown files with frontmatter for content management. All content lives in the `content/` directory.

## Directory Structure

```
content/
├── projects/      # Project entries
├── posts/         # Blog posts
└── pages/         # Static pages (about.md, now.md)
```

## Adding Content

### Projects
Create a new file in `content/projects/`:
```markdown
---
title: "Project Name"
period: "2024 → present"
tags: ["Tag1", "Tag2"]
blurb: "Short description"
links:
  - label: "Link Text"
    href: "#"
---

Optional longer description in markdown here.
```

### Posts
Create a new file in `content/posts/`:
```markdown
---
title: "Post Title"
date: "2025-01-01"
tags: ["Tag1", "Tag2"]
excerpt: "Brief summary"
---

Post content in markdown...
```

### Pages
Edit `content/pages/about.md` or `content/pages/now.md`

## Building

```bash
# Build content only
npm run build:content

# Full build (content + bundle)
npm run build

# Watch mode (rebuilds on changes)
npm run dev
```

## Frontmatter Reference

### Projects
- `title`: Project name
- `period`: Time period shown on project card
- `tags`: Array of tags for filtering
- `blurb`: Short description
- `links`: Array of `{ label, href }` objects

### Posts
- `title`: Post title
- `date`: ISO date string (2025-01-01)
- `tags`: Array of tags for filtering
- `excerpt`: Short summary for the homepage card and post intro
- body markdown: The full post, rendered on `#/posts/<filename>` via the filename slug

### Pages
Use yaml arrays/strings for structured data that maps to your React components.
