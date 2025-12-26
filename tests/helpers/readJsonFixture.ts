import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readJsonFixture<T = unknown>(relativePath: string): T {
  const fixturePath = join(process.cwd(), "tests", "fixtures", relativePath);
  const raw = readFileSync(fixturePath, "utf-8");
  return JSON.parse(raw) as T;
}
