// tokens:unpack — unzip the Figma DTCG token exports into a tracked source dir.
//
// Source of truth lives in Docs (the zips exported from Figma's Material Theme
// Builder). We expand them into `Docs/Design system/Figma tokens/unpacked/<Set>/`
// so Style Dictionary has plain JSON to read. Each zip goes into its own
// subdirectory because several sets share the filename `Baseline.tokens.json`.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, basename } from "node:path";
import { readdirSync, rmSync, mkdirSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = resolve(__dirname, "../../Docs/Design system/Figma tokens");
const UNPACKED_DIR = resolve(TOKENS_DIR, "unpacked");

if (!existsSync(TOKENS_DIR)) {
  console.error(`[tokens:unpack] token directory not found: ${TOKENS_DIR}`);
  process.exit(1);
}

const zips = readdirSync(TOKENS_DIR).filter((f) =>
  f.toLowerCase().endsWith(".zip"),
);
if (zips.length === 0) {
  console.error(`[tokens:unpack] no .zip files found in ${TOKENS_DIR}`);
  process.exit(1);
}

// Start clean so removed/renamed tokens never linger.
rmSync(UNPACKED_DIR, { recursive: true, force: true });
mkdirSync(UNPACKED_DIR, { recursive: true });

for (const zip of zips) {
  const setName = basename(zip, ".zip");
  const dest = resolve(UNPACKED_DIR, setName);
  mkdirSync(dest, { recursive: true });
  execFileSync("unzip", ["-o", "-q", resolve(TOKENS_DIR, zip), "-d", dest], {
    stdio: "inherit",
  });
  console.log(`[tokens:unpack] ${zip} -> unpacked/${setName}/`);
}

console.log(`[tokens:unpack] done (${zips.length} set(s))`);
