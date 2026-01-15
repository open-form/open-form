/**
 * Tests for filesystem resolver
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createFsResolver } from "../src/fs/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, "fixtures");

describe("createFsResolver", () => {
  beforeAll(() => {
    // Create fixtures directory
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create test files
    fs.writeFileSync(path.join(fixturesDir, "test.txt"), "Hello, World!");
    fs.writeFileSync(
      path.join(fixturesDir, "test.json"),
      JSON.stringify({ foo: "bar" })
    );

    // Create subdirectory with file
    const subDir = path.join(fixturesDir, "subdir");
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    fs.writeFileSync(path.join(subDir, "nested.txt"), "Nested content");
  });

  afterAll(() => {
    // Cleanup fixtures
    fs.rmSync(fixturesDir, { recursive: true, force: true });
  });

  test("reads a text file from root", async () => {
    const resolver = createFsResolver({ root: fixturesDir });
    const bytes = await resolver.read("/test.txt");

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(bytes)).toBe("Hello, World!");
  });

  test("reads a JSON file and returns Uint8Array", async () => {
    const resolver = createFsResolver({ root: fixturesDir });
    const bytes = await resolver.read("/test.json");

    expect(bytes).toBeInstanceOf(Uint8Array);
    const content = new TextDecoder().decode(bytes);
    expect(JSON.parse(content)).toEqual({ foo: "bar" });
  });

  test("reads a nested file from subdirectory", async () => {
    const resolver = createFsResolver({ root: fixturesDir });
    const bytes = await resolver.read("/subdir/nested.txt");

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(bytes)).toBe("Nested content");
  });

  test("throws error for non-existent file", async () => {
    const resolver = createFsResolver({ root: fixturesDir });

    await expect(resolver.read("/nonexistent.txt")).rejects.toThrow();
  });

  test("respects root directory boundary", async () => {
    const resolver = createFsResolver({ root: fixturesDir });

    // Try to read outside the root (should fail or read from a different location)
    // This depends on the OS and path resolution
    await expect(
      resolver.read("/../../../etc/passwd")
    ).rejects.toThrow();
  });
});
