const fs   = require('fs');
const path = require('path');

// ── Read content.md ──────────────────────────────────────────────────────────
const contentPath = path.join(__dirname, '..', 'content.md');
if (!fs.existsSync(contentPath)) {
  console.error('❌  content.md not found. Copy content.md and fill in your values first.');
  process.exit(1);
}

const raw = fs.readFileSync(contentPath, 'utf-8');

// Parse KEY: value lines (skip comments and blank lines)
const placeholders = {};
raw.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+):\s*(.+)$/);
  if (match) placeholders[match[1]] = match[2].trim();
});

const count = Object.keys(placeholders).length;
if (count === 0) {
  console.error('❌  No placeholders found in content.md. Check the format (KEY: value).');
  process.exit(1);
}
console.log(`✔  Loaded ${count} placeholders from content.md\n`);

// ── File targets ─────────────────────────────────────────────────────────────
const TARGET_DIRS  = ['app', 'components', 'lib', 'data', 'public'];
const TARGET_FILES = ['style.css', 'tailwind.config.js', 'next.config.js'];
const EXTENSIONS   = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.html', '.md'];
const IGNORE_DIRS  = new Set(['node_modules', '.next', '.git', 'scripts']);

// ── Replace in a single file ──────────────────────────────────────────────────
function processFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  for (const [key, value] of Object.entries(placeholders)) {
    const token = `{{${key}}}`;
    if (src.includes(token)) {
      src = src.split(token).join(value); // replaceAll without regex
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, src, 'utf-8');
    console.log(`  ✔  ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
}

// ── Recursively scan a directory ─────────────────────────────────────────────
function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (IGNORE_DIRS.has(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (EXTENSIONS.some(ext => item.endsWith(ext))) {
      processFile(full);
    }
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────
const root = path.join(__dirname, '..');
console.log('Scanning project files...\n');

TARGET_DIRS.forEach(d => scanDir(path.join(root, d)));
TARGET_FILES.forEach(f => {
  const fp = path.join(root, f);
  if (fs.existsSync(fp)) processFile(fp);
});

console.log('\n✅  Setup complete! All placeholders replaced.');
console.log('   Run  npm run dev  to start the project.\n');
