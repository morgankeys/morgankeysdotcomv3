// Output helpers: a file tree is a plain { "relative/path": string | Buffer }
// map, so targets stay pure functions and the CLI owns all disk access.
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { deflateRawSync, gzipSync, crc32 } from "node:zlib";

export function writeTree(root, files) {
  rmSync(root, { recursive: true, force: true });
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

/** Re-root a file map under a folder. */
export function prefixTree(prefix, files) {
  return Object.fromEntries(
    Object.entries(files).map(([path, content]) => [`${prefix}/${path}`, content]),
  );
}

/**
 * Zip a file map. Most of the platforms only take a folder as a .zip upload,
 * and Node has no zip writer, so this is the small subset of the format they
 * need: deflate, no zip64, a fixed timestamp so output is reproducible.
 */
export function zip(files) {
  const local = [];
  const central = [];
  let offset = 0;
  const DOS_TIME = 0;
  const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;

  for (const path of Object.keys(files).sort()) {
    const name = Buffer.from(path);
    const data = Buffer.from(files[path]);
    const body = deflateRawSync(data, { level: 9 });
    const sum = crc32(data);

    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(8, 8);
    header.writeUInt16LE(DOS_TIME, 10);
    header.writeUInt16LE(DOS_DATE, 12);
    header.writeUInt32LE(sum, 14);
    header.writeUInt32LE(body.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, body);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(8, 10);
    entry.writeUInt16LE(DOS_TIME, 12);
    entry.writeUInt16LE(DOS_DATE, 14);
    entry.writeUInt32LE(sum, 16);
    entry.writeUInt32LE(body.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, name);

    offset += header.length + name.length + body.length;
  }

  const directory = Buffer.concat(central);
  const count = central.length / 2;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

/** Markdown table from a header row and body rows. */
export function table(head, rows) {
  const cell = (v) => String(v ?? "").replace(/\|/g, "\\|");
  return [
    `| ${head.map(cell).join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`),
  ].join("\n");
}

/** YAML for the plain string/number/object trees the front matter needs. */
export function yaml(value, depth = 0) {
  const pad = "  ".repeat(depth);
  return Object.entries(value)
    .map(([key, v]) => {
      if (v && typeof v === "object") {
        const body = yaml(v, depth + 1);
        return body ? `${pad}${key}:\n${body}` : `${pad}${key}: {}`;
      }
      return `${pad}${key}: ${scalar(v)}`;
    })
    .join("\n");
}

function scalar(v) {
  if (typeof v === "number") return String(v);
  const s = String(v);
  return /^[A-Za-z][\w .-]*$/.test(s) && !/^(true|false|null|yes|no)$/i.test(s)
    ? s
    : JSON.stringify(s);
}

export const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

export const GENERATED_NOTE = (model) =>
  `Generated from the ${model.name} design system by the design-system-export skill. Do not edit by hand; change the source kit and re-run the export.`;

/**
 * A gzipped tarball in the layout `npm pack` produces (everything under
 * `package/`), so platforms that accept a .tgz can install the package without
 * it being published first.
 */
export function npmTarball(files) {
  const blocks = [];
  for (const path of Object.keys(files).sort()) {
    const data = Buffer.from(files[path]);
    const header = Buffer.alloc(512);
    header.write(`package/${path}`, 0, 100);
    header.write("0000644\0", 100);
    header.write("0000000\0", 108);
    header.write("0000000\0", 116);
    header.write(data.length.toString(8).padStart(11, "0") + "\0", 124);
    header.write("00000000000\0", 136); // fixed mtime: reproducible output
    header.write("        ", 148);
    header.write("0", 156);
    header.write("ustar\0", 257);
    header.write("00", 263);
    let sum = 0;
    for (const byte of header) sum += byte;
    header.write(sum.toString(8).padStart(6, "0") + "\0 ", 148);
    const padding = Buffer.alloc((512 - (data.length % 512)) % 512);
    blocks.push(header, data, padding);
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks), { level: 9, mtime: 0 });
}
