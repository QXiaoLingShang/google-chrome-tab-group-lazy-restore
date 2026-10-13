/** Ensure each CI job really runs the toolchain selected by its matrix row. */
import { spawnSync } from "node:child_process";

const expectedNode = process.env.EXPECTED_NODE;
const expectedPnpm = process.env.EXPECTED_PNPM;
if (!expectedNode || !expectedPnpm) {
  throw new Error("EXPECTED_NODE and EXPECTED_PNPM are required.");
}

const actualNode = process.versions.node;
const nodeMatches = expectedNode.endsWith(".x")
  ? actualNode.startsWith(expectedNode.slice(0, -1))
  : actualNode === expectedNode;
if (!nodeMatches) {
  throw new Error(`Expected Node ${expectedNode}, got ${actualNode}.`);
}

// Resolve a .cmd shim on Windows through cmd.exe. The command is constant;
// expected versions are compared below and never interpolated into the shell.
const result =
  process.platform === "win32"
    ? spawnSync(
        process.env.ComSpec ?? "cmd.exe",
        ["/d", "/s", "/c", "pnpm --version"],
        { encoding: "utf8" }
      )
    : spawnSync("pnpm", ["--version"], { encoding: "utf8" });
if (result.error || result.status !== 0) {
  throw new Error("Unable to read pnpm version.", { cause: result.error });
}
const actualPnpm = result.stdout.trim();
if (actualPnpm !== expectedPnpm) {
  throw new Error(`Expected pnpm ${expectedPnpm}, got ${actualPnpm}.`);
}
console.log(`Verified Node ${actualNode}, pnpm ${actualPnpm}`);
