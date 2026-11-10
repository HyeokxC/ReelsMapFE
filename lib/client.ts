import { stateSchema } from "./types";
import type { AppState, Command } from "./types";

async function request(path: string, command?: Command): Promise<AppState> {
  const response = await fetch(`/api/${path}`, {
    method: command ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    ...(command ? { body: JSON.stringify(command) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`예시 API 요청 실패 (${response.status})`);
  return stateSchema.parse(await response.json());
}

export const api = { load: () => request("state"), mutate: (command: Command) => request(command.action, command) };
