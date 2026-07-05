import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const blocked = [/\bISO\b/i, /\bISO\s+\d+(?:\.\d+)+\b/i];
const root = join(process.cwd(), "engine");
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(path)) files.push(path);
  }
}

walk(root);

const hits = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const pattern of blocked) {
    if (pattern.test(content)) hits.push(`${file}: ${pattern}`);
  }
}

if (hits.length > 0) {
  console.error("Engine contains standard-specific literals:");
  console.error(hits.join("\n"));
  process.exit(1);
}
