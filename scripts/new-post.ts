/**
 * make new TITLE="Título do post" [SUBTITLE="…"] [SEP=_]
 * Creates content/posts/NNNNN-titulo-do-post/{index.md,assets/} from
 * archetypes/post with the next free number (00001 … 99999).
 * Runs on Node ≥ 23.6 (native TypeScript type stripping), no dependencies.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const postsDir = join(root, "content", "posts");
const PREFIX = /^(\d{5})[-_]/;

const title = (process.env.TITLE ?? process.argv[2] ?? "").trim();
const subtitle = (process.env.SUBTITLE ?? process.argv[3] ?? "").trim();
const sep = process.env.SEP === "_" ? "_" : "-";
if (!title) {
  console.error('usage: make new TITLE="Post title" [SUBTITLE="…"] [SEP=_]');
  process.exit(2);
}

export function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

const used = existsSync(postsDir)
  ? readdirSync(postsDir).map((d) => PREFIX.exec(d)?.[1]).filter((n): n is string => n !== undefined).map(Number)
  : [];
const next = (used.length ? Math.max(...used) : 0) + 1;
if (next > 99_999) {
  console.error("post numbers exhausted (99999)");
  process.exit(1);
}

const dir = `${String(next).padStart(5, "0")}${sep}${slugify(title)}`;
const hugo = process.env.HUGO ?? join(root, "node_modules", ".bin", "hugo");
execFileSync(hugo, ["new", "content", "--kind", "post", `posts/${dir}`], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, HUGO_POST_TITLE: title, HUGO_POST_SUBTITLE: subtitle },
});
console.log(`\n  edit: content/posts/${dir}/index.md\n  media: content/posts/${dir}/assets/\n`);
