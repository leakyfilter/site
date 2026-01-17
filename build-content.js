const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, 'content');
const OUTPUT_FILE = path.join(__dirname, 'data.js');

function readMarkdownFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const filePath = path.join(dir, entry.name);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      files.push({
        ...data,
        content,
        slug: entry.name.replace('.md', '')
      });
    }
  }
  
  return files.sort((a, b) => (b.date || 0) - (a.date || 0));
}

function readPageContent(dir, filename) {
  const filePath = path.join(dir, filename);
  
  if (!fs.existsSync(filePath)) return null;
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  return {
    ...data,
    content
  };
}

function generateData() {
  const projects = readMarkdownFiles(path.join(CONTENT_DIR, 'projects'));
  const posts = readMarkdownFiles(path.join(CONTENT_DIR, 'posts'));
  const about = readPageContent(path.join(CONTENT_DIR, 'pages'), 'about.md');
  const now = readPageContent(path.join(CONTENT_DIR, 'pages'), 'now.md');
  
  const output = `// Auto-generated from content/ directory. Do not edit manually.
export const PROJECTS = ${JSON.stringify(projects, null, 2)};

export const POSTS = ${JSON.stringify(posts, null, 2)};

export const ABOUT = ${JSON.stringify(about, null, 2)};

export const NOW = ${JSON.stringify(now, null, 2)};
`;
  
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`✓ Generated ${OUTPUT_FILE}`);
  console.log(`  - ${projects.length} projects`);
  console.log(`  - ${posts.length} posts`);
}

generateData();
