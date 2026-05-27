import fs from "fs";
import path from "path";

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (p.endsWith(".tsx")) files.push(p);
  }
  return files;
}

let fixed = 0;
for (const file of walk(path.resolve("app"))) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes('"use client"') && !src.includes("'use client'")) continue;
  const match = src.match(/^([\s\S]*?)(["']use client["'];?\s*\n)([\s\S]*)$/);
  if (!match) continue;
  const before = match[1];
  const directive = match[2];
  const after = match[3];
  if (!before.trim()) continue;
  const next = directive + before + after;
  if (next !== src) {
    fs.writeFileSync(file, next);
    fixed++;
  }
}
console.log("Fixed", fixed, "files");
