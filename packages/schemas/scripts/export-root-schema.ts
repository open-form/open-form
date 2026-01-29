#!/usr/bin/env tsx
/**
 * Export the root OpenForm schema to JSON Schema 2020-12 compliant format
 *
 * This script:
 * 1. Generates both "latest" and "versioned" bundles
 * 2. Outputs to schemas/ folder for upload to schema.open-form.dev
 *
 * Output structure (for schema.open-form.dev):
 * - schema.json ($id: https://schema.open-form.dev/schema.json)
 * - {version}.json ($id: https://schema.open-form.dev/{version}.json)
 */

import { writeFile, mkdir, cp } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SCHEMA_VERSION,
  SCHEMA_ROOT_ID,
  SCHEMA_VERSIONED_ID,
} from "../src/typebox/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHEMAS_PKG_DIR = join(__dirname, "..");
const MONOREPO_ROOT = join(SCHEMAS_PKG_DIR, "..", "..");
const TYPEBOX_SRC_DIR = join(SCHEMAS_PKG_DIR, "src", "typebox");
const OUTPUT_DIR = join(SCHEMAS_PKG_DIR, "schemas");
const BUNDLE_SCHEMA_PATH = join(TYPEBOX_SRC_DIR, "module.ts");

// No longer copying to app public folders - schemas will be uploaded to R2

/**
 * Extract schemas with $id from nested locations and collect them for hoisting
 * Returns a map of $id -> schema definition
 */
function extractNestedDefinitions(
  obj: unknown,
  collected: Map<string, Record<string, unknown>>
): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj))
    return obj.map((item) => extractNestedDefinitions(item, collected));

  const record = obj as Record<string, unknown>;

  // Check if this object has an $id that should be hoisted
  // Skip TypeBox internal $ids (T0, T1, etc.) - those are handled separately
  if (
    typeof record.$id === "string" &&
    !/^T\d+$/.test(record.$id) &&
    record.type !== undefined // Must be a schema, not just metadata
  ) {
    const id = record.$id;
    // Clone the schema without the $id (it will be implicit from its $defs key)
    const { $id, ...schemaWithoutId } = record;
    // Recursively process nested definitions
    const processedSchema = extractNestedDefinitions(
      schemaWithoutId,
      collected
    ) as Record<string, unknown>;
    collected.set(id, processedSchema);
    // Replace with a $ref to the hoisted definition
    return { $ref: id };
  }

  // Recursively process all properties
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = extractNestedDefinitions(value, collected);
  }
  return result;
}

/**
 * Transform bare $ref values to JSON Pointer format (#/$defs/Name)
 * Also transforms TypeBox internal anchors (T0, T1, etc.) to proper JSON Schema anchors
 */
function transformRefs(obj: unknown, defsNames: Set<string>): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj))
    return obj.map((item) => transformRefs(item, defsNames));

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "$ref" && typeof value === "string") {
      if (defsNames.has(value)) {
        // Transform bare ref to JSON Pointer format
        result[key] = `#/$defs/${value}`;
      } else if (/^T\d+$/.test(value)) {
        // Transform TypeBox internal anchor refs (T0, T1, etc.) to URI fragment
        result[key] = `#${value}`;
      } else {
        result[key] = value;
      }
    } else if (key === "$id" && typeof value === "string" && /^T\d+$/.test(value)) {
      // Transform TypeBox internal $id anchors to $anchor format
      result["$anchor"] = value;
    } else {
      result[key] = transformRefs(value, defsNames);
    }
  }
  return result;
}

/**
 * Clean $schema and $id declarations from $defs entries
 * (They should only be at root level)
 */
function cleanDefsEntries(
  defs: Record<string, unknown>
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [name, schema] of Object.entries(defs)) {
    if (typeof schema === "object" && schema !== null) {
      const { $schema, $id, ...rest } = schema as Record<string, unknown>;
      cleaned[name] = rest;
    } else {
      cleaned[name] = schema;
    }
  }
  return cleaned;
}

/**
 * Transform TypeBox output to JSON Schema 2020-12 compliant format
 */
function transformToCompliant(
  schema: Record<string, unknown>,
  schemaId: string,
  isLatest: boolean
): Record<string, unknown> {
  const $defs = schema.$defs as Record<string, unknown> | undefined;
  if (!$defs) {
    throw new Error("Schema must have $defs");
  }

  // Clean $schema and $id from $defs entries
  const cleanedDefs = cleanDefsEntries($defs);

  // Extract nested definitions (e.g., FieldsetField) and hoist them to $defs
  const hoistedDefs = new Map<string, Record<string, unknown>>();
  const processedDefs = extractNestedDefinitions(
    cleanedDefs,
    hoistedDefs
  ) as Record<string, unknown>;

  // Merge hoisted definitions into $defs
  const mergedDefs = { ...processedDefs };
  for (const [name, def] of hoistedDefs) {
    mergedDefs[name] = def;
  }

  // Get all definition names for $ref transformation (including hoisted ones)
  const defsNames = new Set(Object.keys(mergedDefs));

  // Transform all $refs to JSON Pointer format
  const transformedDefs = transformRefs(mergedDefs, defsNames) as Record<
    string,
    unknown
  >;

  // Get the root $ref and transform it
  const rootRef = schema.$ref as string | undefined;
  if (!rootRef || !defsNames.has(rootRef)) {
    throw new Error("Schema must have a valid root $ref");
  }

  // Build compliant schema with proper ordering
  const description = isLatest
    ? "OpenForm JSON Schema specification (latest version)"
    : `OpenForm JSON Schema specification version ${SCHEMA_VERSION}`;

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: schemaId,
    title: "OpenForm Schema",
    description,
    $ref: `#/$defs/${rootRef}`,
    $defs: transformedDefs,
  };
}

/**
 * Main export function
 */
async function main() {
  console.log("Exporting OpenForm schemas to JSON Schema 2020-12...\n");

  try {
    // Import the OpenForm schema from bundle.ts
    const module = await import(BUNDLE_SCHEMA_PATH);
    const OpenForm = module.OpenForm;

    if (!OpenForm) {
      throw new Error("OpenForm schema not found in bundle.ts");
    }

    // Parse TypeBox schema to plain object
    const rawSchema = JSON.parse(JSON.stringify(OpenForm));

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Generate latest bundle (schema.json)
    const latestSchema = transformToCompliant(rawSchema, SCHEMA_ROOT_ID, true);
    const latestPath = join(OUTPUT_DIR, "schema.json");
    await writeFile(latestPath, JSON.stringify(latestSchema, null, 2), "utf-8");
    console.log(`Done: Latest bundle -> schema.json`);
    console.log(`  $id: ${SCHEMA_ROOT_ID}`);

    // Generate versioned bundle ({version}.json)
    const versionedSchema = transformToCompliant(
      rawSchema,
      SCHEMA_VERSIONED_ID,
      false
    );
    const versionedPath = join(OUTPUT_DIR, `${SCHEMA_VERSION}.json`);
    await writeFile(
      versionedPath,
      JSON.stringify(versionedSchema, null, 2),
      "utf-8"
    );
    console.log(`Done: Versioned bundle -> ${SCHEMA_VERSION}.json`);
    console.log(`  $id: ${SCHEMA_VERSIONED_ID}`);

    console.log("\nBundle export complete!");
    console.log(`\nUpload contents of ${relative(SCHEMAS_PKG_DIR, OUTPUT_DIR)}/ to schema.open-form.dev`);
  } catch (error) {
    console.error("Failed to export OpenForm schema:", error);
    process.exit(1);
  }
}

main().catch(console.error);
