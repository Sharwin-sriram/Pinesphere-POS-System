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

let n = 0;
for (const file of walk(path.resolve("app"))) {
  let s = fs.readFileSync(file, "utf8");
  const orig = s;
  s = s.replace(
    /className="([^"]*)"\s+strokeWidth=\{1\.5\}\s+className="([^"]*)"/g,
    'className="$1 $2" strokeWidth={1.5}',
  );
  if (s !== orig) {
    fs.writeFileSync(file, s);
    n++;
  }
}
console.log("merged", n);
