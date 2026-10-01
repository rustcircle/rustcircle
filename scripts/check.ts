/**
 * make check — validates the post structure before a build:
 *   content/posts/NNNNN-title/ or NNNNN_title/   (00001 … 99999, unique numbers)
 *     index.md   exactly one Markdown file at the folder's top level
 *     assets/    media for that post
 * and the front matter: title, subtitle, date (ISO 8601 date + time + offset),
 * author, slug (= folder name without the number).
 * Exit 1 on errors; warnings do not fail.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const postsDir = join(root, "content", "posts");
const DIR = /^(\d{5})[-_]([a-z0-9]+(?:[-_][a-z0-9]+)*)$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/;
const REQUIRED = ["title", "subtitle", "date", "author", "slug"] as const;

const errors: string[] = [];
const warnings: string[] = [];
const seen = new Map<string, string>();

/** Minimal YAML front matter reader: top-level `key: value` scalars only. */
export function frontMatter(src: string): Map<string, string> | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(src);
  if (!m?.[1]) return null;
  const out = new Map<string, string>();
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv?.[1]) continue;
    out.set(kv[1], (kv[2] ?? "").trim().replace(/^(["'])(.*)\1$/, "$2"));
  }
  return out;
}

for (const name of existsSync(postsDir) ? readdirSync(postsDir).sort() : []) {
  if (name === "_index.md" || name.startsWith(".")) continue;
  const path = join(postsDir, name);
  const where = `content/posts/${name}`;
  if (!statSync(path).isDirectory()) {
    errors.push(`${where}: posts must be folders (NNNNN-title/index.md), not loose files`);
    continue;
  }
  const m = DIR.exec(name);
  if (!m?.[1] || !m[2]) {
    errors.push(`${where}: folder must be NNNNN-title or NNNNN_title (5 digits, lowercase a-z 0-9, - or _)`);
    continue;
  }
  const [num, rest] = [m[1], m[2]];
  if (num === "00000") errors.push(`${where}: numbers start at 00001`);
  const dup = seen.get(num);
  if (dup) errors.push(`${where}: number ${num} already used by ${dup}`);
  seen.set(num, name);

  const mds = readdirSync(path).filter((f) => f.toLowerCase().endsWith(".md"));
  if (mds.length !== 1 || mds[0] !== "index.md") {
    errors.push(`${where}: needs exactly one Markdown file, named index.md (found: ${mds.join(", ") || "none"})`);
    continue;
  }
  if (!existsSync(join(path, "assets"))) warnings.push(`${where}: no assets/ folder`);

  const fm = frontMatter(readFileSync(join(path, "index.md"), "utf8"));
  if (!fm) {
    errors.push(`${where}/index.md: missing YAML front matter between --- lines`);
    continue;
  }
  for (const key of REQUIRED) {
    if (!fm.has(key)) errors.push(`${where}/index.md: missing "${key}:"`);
  }
  const date = fm.get("date");
  if (date !== undefined && !DATE.test(date)) {
    errors.push(`${where}/index.md: date must be ISO 8601 with time and offset, e.g. 2026-10-01T14:30:00+01:00 (got "${date}")`);
  } else if (date !== undefined && Date.parse(date) > Date.now()) {
    warnings.push(`${where}: date ${date} is in the future — hidden until then (make dev shows it)`);
  }
  const slug = fm.get("slug");
  const want = rest.replaceAll("_", "-");
  if (slug !== undefined && slug !== want) warnings.push(`${where}/index.md: slug "${slug}" differs from folder ("${want}")`);
  if (fm.get("title") === "") errors.push(`${where}/index.md: empty title`);
  if (fm.get("draft") === "true") warnings.push(`${where}: draft (not published by make build)`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`check: ${seen.size} post(s), ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
