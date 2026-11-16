/**
 * storybook-dev.mjs
 *
 * Starts Storybook next to `astro dev` and proxies /dev/ to it, including
 * the HMR websocket. The dev server keeps the manager at `/`; this proxy
 * strips that prefix and rewrites HTML so the browser stays under `/dev/`.
 *
 * The dev server calls `startStorybookProxy` from astro.config.mjs. Stopping
 * Astro stops Storybook.
 */
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const STORYBOOK_PORT = 6006;
const STORYBOOK_HOST = "127.0.0.1";

/**
 * The dev server serves the manager at `/`. The production build uses `/dev/`.
 * Strip `/dev` when forwarding, and rewrite root-absolute URLs in HTML so the
 * browser stays on the Astro server's `/dev/` path.
 *
 * @param {string} url
 */
function upstreamPath(url) {
  const query = url.indexOf("?");
  const path = query === -1 ? url : url.slice(0, query);
  const search = query === -1 ? "" : url.slice(query);
  if (path === "/dev") return `/${search}`;
  if (path.startsWith("/dev/")) return path.slice("/dev".length) + search;
  return url;
}

/** @param {string} html */
function rewriteHtml(html) {
  return html
    .replaceAll('="/dev/', '="\u0000')
    .replaceAll('="/', '="/dev/')
    .replaceAll('="\u0000', '="/dev/');
}

/**
 * @param {import("node:http").IncomingMessage} req
 * @param {import("node:http").ServerResponse} res
 */
function proxyRequest(req, res) {
  const headers = {
    ...req.headers,
    host: `${STORYBOOK_HOST}:${STORYBOOK_PORT}`,
  };
  // HTML is rewritten below. A gzipped body would be rewritten as text and
  // then fail in the browser with ERR_CONTENT_DECODING_FAILED.
  delete headers["accept-encoding"];
  const upstream = http.request(
    {
      hostname: STORYBOOK_HOST,
      port: STORYBOOK_PORT,
      path: upstreamPath(req.url ?? "/"),
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      const type = String(upstreamRes.headers["content-type"] ?? "");
      if (!type.includes("text/html")) {
        res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
        upstreamRes.pipe(res);
        return;
      }
      /** @type {Buffer[]} */
      const chunks = [];
      upstreamRes.on("data", (chunk) => chunks.push(chunk));
      upstreamRes.on("end", () => {
        const html = rewriteHtml(Buffer.concat(chunks).toString("utf8"));
        const responseHeaders = { ...upstreamRes.headers };
        delete responseHeaders["content-length"];
        delete responseHeaders["content-encoding"];
        res.writeHead(upstreamRes.statusCode ?? 200, responseHeaders);
        res.end(html);
      });
    },
  );
  upstream.on("error", () => {
    if (res.headersSent) return;
    res.statusCode = 502;
    res.end("Storybook is still starting.");
  });
  req.pipe(upstream);
}

/**
 * @param {import("node:http").IncomingMessage} req
 * @param {import("node:stream").Duplex} socket
 * @param {Buffer} head
 */
function proxyUpgrade(req, socket, head) {
  const headers = {
    ...req.headers,
    host: `${STORYBOOK_HOST}:${STORYBOOK_PORT}`,
  };
  const upstream = http.request({
    hostname: STORYBOOK_HOST,
    port: STORYBOOK_PORT,
    path: upstreamPath(req.url ?? "/"),
    method: req.method,
    headers,
  });
  upstream.on("upgrade", (upstreamRes, upstreamSocket, upstreamHead) => {
    const headerLines = Object.entries(upstreamRes.headers).flatMap(
      ([name, value]) => {
        const values = Array.isArray(value) ? value : [value ?? ""];
        return values.map((item) => `${name}: ${item}`);
      },
    );
    socket.write(
      `HTTP/1.1 ${upstreamRes.statusCode ?? 101} ${upstreamRes.statusMessage ?? "Switching Protocols"}\r\n` +
        headerLines.join("\r\n") +
        "\r\n\r\n",
    );
    if (upstreamHead.length > 0) socket.write(upstreamHead);
    if (head.length > 0) upstreamSocket.write(head);
    upstreamSocket.pipe(socket);
    socket.pipe(upstreamSocket);
  });
  upstream.on("error", () => socket.destroy());
  upstream.end();
}

/** @returns {Promise<boolean>} */
function portOpen() {
  return new Promise((resolve) => {
    const socket = net.connect(STORYBOOK_PORT, STORYBOOK_HOST, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/** @returns {Promise<void>} */
function waitForPort() {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const attempt = () => {
      const socket = net.connect(STORYBOOK_PORT, STORYBOOK_HOST, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - started > 60_000) {
          reject(new Error("Storybook did not start on port 6006."));
          return;
        }
        setTimeout(attempt, 200);
      });
    };
    attempt();
  });
}

/** @type {import("node:child_process").ChildProcess | null} */
let storybookChild = null;

/**
 * Astro's dev handler is registered after integration middleware and answers
 * every unknown URL itself, including /dev/. The proxy has to sit at the front
 * of the stack, and again after that handler is installed.
 *
 * @param {import("node:http").IncomingMessage} req
 * @param {import("node:http").ServerResponse} res
 * @param {() => void} next
 */
function storybookDevProxy(req, res, next) {
  const url = req.url ?? "";
  const query = url.indexOf("?");
  const path = query === -1 ? url : url.slice(0, query);
  const search = query === -1 ? "" : url.slice(query);
  if (path === "/dev") {
    res.statusCode = 308;
    res.setHeader("Location", `/dev/${search}`);
    res.end();
    return;
  }
  if (path.startsWith("/dev/")) {
    proxyRequest(req, res);
    return;
  }
  next();
}

/**
 * @param {{ middlewares: { stack: { route: string, handle: Function }[] }, httpServer: import("node:net").Server | null }} server
 */
function installProxy(server) {
  const stack = server.middlewares.stack;
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (stack[index].handle === storybookDevProxy) stack.splice(index, 1);
  }
  stack.unshift({ route: "", handle: storybookDevProxy });
}

/**
 * @param {import("node:http").IncomingMessage} req
 * @param {import("node:stream").Duplex} socket
 * @param {Buffer} head
 */
function upgradeListener(req, socket, head) {
  const url = req.url ?? "";
  if (url === "/dev" || url.startsWith("/dev/") || url.startsWith("/dev?")) {
    proxyUpgrade(req, socket, head);
  }
}

/**
 * @param {{ middlewares: { stack: { route: string, handle: Function }[] }, httpServer: import("node:net").Server | null }} server
 * @returns {Promise<() => void>}
 */
export async function startStorybookProxy(server) {
  if (!(await portOpen())) {
    const child = spawn(
      process.execPath,
      [
        join(root, "node_modules/storybook/dist/bin/dispatcher.js"),
        "dev",
        "--port",
        String(STORYBOOK_PORT),
        "--host",
        STORYBOOK_HOST,
        "--ci",
        "--no-open",
        "--disable-telemetry",
      ],
      {
        cwd: root,
        stdio: "inherit",
        env: { ...process.env, STORYBOOK_DISABLE_DEV_PROXY: "1" },
      },
    );
    storybookChild = child;
    child.on("exit", (code) => {
      if (code && code !== 0 && !child.killed) {
        console.error(`Storybook exited with code ${code}.`);
      }
      if (storybookChild === child) storybookChild = null;
    });
    await waitForPort();
  }

  const attach = () => {
    installProxy(server);
    server.httpServer?.off("upgrade", upgradeListener);
    server.httpServer?.on("upgrade", upgradeListener);
  };
  attach();
  // Astro appends its own catch-all after this hook returns. Re-install once
  // that has happened so /dev/ is not rendered as the site 404.
  setTimeout(attach, 0);

  console.log("Storybook catalog ready at /dev/");

  return () => {
    if (storybookChild && !storybookChild.killed)
      storybookChild.kill("SIGTERM");
  };
}
