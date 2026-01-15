/**
 * Tests for renderText function
 */

import { describe, test, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderText } from "../src/render";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("renderText", () => {
  const testData = {
    name: "Fluffy",
    species: "cat",
    weight: 12,
    hasVaccination: true,
  };

  test("renders markdown template with pet data", () => {
    const templatePath = path.join(__dirname, "fixtures", "pet-addendum.md");
    const template = fs.readFileSync(templatePath, "utf-8");

    const output = renderText(template, testData);
    console.log(output);

    expect(output).toBeDefined();
    expect(output).toContain("Fluffy");
    expect(output).toContain("cat");
    expect(output).toContain("12");
    expect(output).toContain("true");
  });

  test("renders HTML template with pet data", () => {
    const templatePath = path.join(__dirname, "fixtures", "pet-addendum.html");
    const template = fs.readFileSync(templatePath, "utf-8");

    const output = renderText(template, testData);

    expect(output).toBeDefined();
    expect(output).toContain("Fluffy");
    expect(output).toContain("cat");
    expect(output).toContain("12");
    expect(output).toContain("true");
  });

  test("renders plain text template with pet data", () => {
    const templatePath = path.join(__dirname, "fixtures", "pet-addendum.txt");
    const template = fs.readFileSync(templatePath, "utf-8");

    const output = renderText(template, testData);
    console.log(output);

    expect(output).toBeDefined();
    expect(output).toContain("Fluffy");
    expect(output).toContain("cat");
    expect(output).toContain("12");
    expect(output).toContain("true");
  });
});
