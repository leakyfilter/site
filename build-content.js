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
  
  return files.sort((a, b) => {
    const aTime = a.date ? Date.parse(a.date) : 0;
    const bTime = b.date ? Date.parse(b.date) : 0;
    return bTime - aTime;
  });
}

function generateData() {
  const projects = readMarkdownFiles(path.join(CONTENT_DIR, 'projects'));
  const posts = readMarkdownFiles(path.join(CONTENT_DIR, 'posts'));

  const output = `// Auto-generated from content/ directory. Do not edit manually.
export const PROJECTS = ${JSON.stringify(projects, null, 2)};

export const POSTS = ${JSON.stringify(posts, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`✓ Generated ${OUTPUT_FILE}`);
  console.log(`  - ${projects.length} projects`);
  console.log(`  - ${posts.length} posts`);
}

function watchContent() {
  const watchDirs = [
    path.join(CONTENT_DIR, 'posts'),
    path.join(CONTENT_DIR, 'projects'),
  ].filter((dir) => fs.existsSync(dir));

  let timeoutId = null;

  const rebuild = (eventType, filename) => {
    const label = filename ? `${eventType}: ${filename}` : eventType;
    console.log(`↻ Content change detected (${label})`);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      try {
        generateData();
      } catch (error) {
        console.error('Failed to regenerate data.js');
        console.error(error);
      }
    }, 50);
  };

  watchDirs.forEach((dir) => {
    fs.watch(dir, (eventType, filename) => rebuild(eventType, filename));
    console.log(`Watching ${path.relative(__dirname, dir)}`);
  });
}

generateData();

if (process.argv.includes('--watch')) {
  watchContent();
}
