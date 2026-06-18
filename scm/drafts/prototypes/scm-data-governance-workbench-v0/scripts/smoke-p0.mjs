import { copyFileSync, mkdirSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const tmpDir = resolve(root, "tmp");
const sourceDb = resolve(root, "data/governance_workbench.sqlite");
const tempDb = resolve(tmpDir, `governance_workbench-p0-smoke-${Date.now()}.sqlite`);
const publicUrl = process.env.SCM_BROWSER_SMOKE_URL || "https://scm.lute-tlz-dddd.top/";
const skipPublicBrowserSmoke = process.env.SCM_SKIP_PUBLIC_BROWSER_SMOKE === "1";

mkdirSync(tmpDir, { recursive: true });
copyFileSync(sourceDb, tempDb);

function runCommand(command, args, options = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: false,
      env: { ...process.env, ...(options.env || {}) }
    });
    child.on("exit", (code) => {
      if (code === 0) resolveRun();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 5184;
      server.close(() => resolvePort(port));
    });
    server.on("error", reject);
  });
}

async function waitForHealth(baseUrl, attempts = 40) {
  let lastError = null;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/deploy/health`);
      if (response.ok) {
        const payload = await response.json();
        if (payload.ok) return payload;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error(`Timed out waiting for ${baseUrl}/api/deploy/health: ${lastError?.message || "no response"}`);
}

await runCommand("npm", ["run", "migrate"], { env: { SCM_DB_PATH: tempDb } });

const port = await getFreePort();
const localUrl = `http://127.0.0.1:${port}`;
const apiServer = spawn("npm", ["run", "start"], {
  cwd: root,
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    SCM_DB_PATH: tempDb,
    PORT: String(port)
  }
});

try {
  await waitForHealth(localUrl);
  await runCommand("npm", ["run", "smoke:workflows"], { env: { SCM_WORKBENCH_URL: localUrl } });
  await runCommand("npm", ["run", "smoke:browser"], { env: { SCM_WORKBENCH_URL: localUrl } });
  if (!skipPublicBrowserSmoke) {
    await runCommand("npm", ["run", "smoke:browser"], { env: { SCM_WORKBENCH_URL: publicUrl } });
  }
  console.log(JSON.stringify({ ok: true, tempDb, localUrl, publicUrl: skipPublicBrowserSmoke ? null : publicUrl }, null, 2));
} finally {
  apiServer.kill("SIGTERM");
}
