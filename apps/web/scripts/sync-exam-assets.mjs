// Copies exam images from content/exams (the source of truth) into public/exams.
// Runs before `dev` and `build`; public/exams is gitignored.
import { cpSync, existsSync, rmSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(webRoot, "..", "..", "content", "exams");
const target = join(webRoot, "public", "exams");

if (!existsSync(source)) {
  throw new Error(`Exam content not found at ${source}. Run from inside the monorepo.`);
}

rmSync(target, { recursive: true, force: true });
// Only the images are served; exam.json stays out of the public folder, as before.
cpSync(source, target, {
  recursive: true,
  filter: (path) => basename(path) !== "exam.json",
});
