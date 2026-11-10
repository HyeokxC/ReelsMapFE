import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";

const directory = "/private/var/folders/2s/vlbvvq0s2jl_r_x00lp9rqlm0000gn/T/opencode";
const log = openSync(`${directory}/reelsmap-web.log`, "a");
const child = spawn("bun", ["run", "dev"], { cwd: new URL("..", import.meta.url), stdio: ["ignore", log, log] });
writeFileSync(`${directory}/reelsmap-web.pid`, String(child.pid));
console.log(`Dev server PID ${child.pid}`);
child.on("exit", code => process.exit(code ?? 1));
