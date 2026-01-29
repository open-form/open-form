#!/usr/bin/env tsx
/**
 * Export individual TypeBox schemas to JSON Schema 2020-12 compliant files
 *
 * This script:
 * 1. Exports individual schemas to schemas/{version}/ folder
 * 2. Outputs to schemas/ folder for upload to schema.open-form.dev
 *
 * Output structure (for schema.open-form.dev):
 * - {version}/form.json ($id: https://schema.open-form.dev/{version}/form.json)
 * - {version}/document.json ($id: https://schema.open-form.dev/{version}/document.json)
 * - {version}/bundle.json ($id: https://schema.open-form.dev/{version}/bundle.json)
 * - etc.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { TSchema } from "@sinclair/typebox";
import {
  SCHEMA_VERSION,
  SCHEMA_VERSIONED_ID,
  schemaId,
} from "../src/typebox/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHEMAS_PKG_DIR = join(__dirname, "..");
const TYPEBOX_SRC_DIR = join(SCHEMAS_PKG_DIR, "src", "typebox");
const OUTPUT_DIR = join(SCHEMAS_PKG_DIR, "schemas", SCHEMA_VERSION);

// No longer copying to app public folders - schemas will be uploaded to R2

interface SchemaExport {
  name: string;
  schema: TSchema;
  category: string; // artifacts, blocks, primitives
}

// Known schema names from the module (for $ref transformation)
const KNOWN_SCHEMA_NAMES = new Set([
  "CondExpr",
  "LogicExpression",
  "LogicSection",
  "Form",
  "Document",
  "Bundle",
  "BundleContentItem",
  "Checklist",
  "ChecklistItem",
  // Form blocks (design-time) - renamed with Form prefix
  "FormField",
  "FieldsetField",
  "FormFieldset",
  "FormAnnex",
  "FormParty",
  // Note: FormSignature is intentionally NOT here - it's inlined in FormParty
  // Shared
  "Layer",
  // Primitives
  "Signature",
  "Attachment",
  "Address",
  "Bbox",
  "Coordinate",
  "Duration",
  "Identification",
  "Money",
  "Metadata",
  "Organization",
  "Person",
  "Phone",
  "OpenForm",
]);

/**
 * Import and extract schemas from a module
 */
async function extractSchemas(
  modulePath: string,
  category: string
): Promise<SchemaExport[]> {
  try {
    const module = await import(modulePath);
    const schemas: SchemaExport[] = [];

    for (const [exportName, exportValue] of Object.entries(module)) {
      // Look for TypeBox schema objects (they have $id, type, etc.)
      if (isTypeBoxSchema(exportValue)) {
        schemas.push({
          name: exportName,
          schema: exportValue as TSchema,
          category,
        });
      }
    }

    return schemas;
  } catch (error) {
    console.error(`Failed to import ${modulePath}:`, error);
    return [];
  }
}

/**
 * Check if an object is a TypeBox schema
 */
function isTypeBoxSchema(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string | symbol, unknown>;
  // TypeBox schemas have these properties
  const typeBoxKind = Symbol.for("TypeBox.Kind");
  return (
    typeof obj.type === "string" ||
    (typeBoxKind in obj && obj[typeBoxKind] !== undefined)
  );
}

/**
 * Convert TypeBox schema name to filename
 * e.g., "FormSchema" -> "form.json"
 */
function toFilename(name: string): string {
  // Remove "Schema" suffix if present
  const baseName = name.replace(/Schema$/, "");
  return (
    baseName
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/, "") + ".json"
  );
}

/**
 * Get the base schema name from export name
 * e.g., "FormSchema" -> "Form", "AddressSchema" -> "Address"
 */
function toSchemaName(exportName: string): string {
  return exportName.replace(/Schema$/, "");
}

/**
 * Transform bare $ref values to point to the bundle
 */
function transformRefs(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map((item) => transformRefs(item));

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "$ref" && typeof value === "string") {
      // Check if it's a bare reference to a known schema
      if (KNOWN_SCHEMA_NAMES.has(value)) {
        // Transform to bundle reference
        result[key] = `${SCHEMA_VERSIONED_ID}#/$defs/${value}`;
      } else if (value.startsWith("#/$defs/")) {
        // Already a local pointer, transform to bundle reference
        const refName = value.replace("#/$defs/", "");
        if (KNOWN_SCHEMA_NAMES.has(refName)) {
          result[key] = `${SCHEMA_VERSIONED_ID}#/$defs/${refName}`;
        } else {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    } else {
      result[key] = transformRefs(value);
    }
  }
  return result;
}

/**
 * Clean and transform a schema for individual export
 */
function transformIndividualSchema(
  schema: Record<string, unknown>,
  schemaName: string
): Record<string, unknown> {
  // Remove $schema and $id from the original (we'll add our own)
  const { $schema, $id, ...rest } = schema;

  // Transform all $refs to point to bundle
  const transformed = transformRefs(rest) as Record<string, unknown>;

  // Get title from schema or use schema name
  const title = (transformed.title as string) || schemaName;

  // Build compliant individual schema
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: schemaId(schemaName.toLowerCase()),
    title,
    ...transformed,
  };
}

/**
 * Main export function
 */
async function main() {
  console.log(
    "Exporting individual TypeBox schemas to JSON Schema 2020-12...\n"
  );

  const categories = ["artifacts", "primitives"];
  const allSchemas: SchemaExport[] = [];

  // Import schemas from each category
  for (const category of categories) {
    const indexPath = join(TYPEBOX_SRC_DIR, category, "index.ts");
    console.log(`Processing ${category}...`);

    try {
      const schemas = await extractSchemas(indexPath, category);
      allSchemas.push(...schemas);
      console.log(`  Found ${schemas.length} schemas`);
    } catch {
      console.log(`  Skipping ${category} (no index found)`);
    }
  }

  console.log(`\nTotal schemas found: ${allSchemas.length}\n`);

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Export each schema
  let exported = 0;
  let skipped = 0;
  const exportedFiles: string[] = [];

  for (const { name, schema } of allSchemas) {
    try {
      const schemaName = toSchemaName(name);
      const filename = toFilename(name);
      const outputPath = join(OUTPUT_DIR, filename);

      // Parse to plain object and transform
      const rawSchema = JSON.parse(JSON.stringify(schema));
      const compliantSchema = transformIndividualSchema(rawSchema, schemaName);

      // Write output
      const jsonSchema = JSON.stringify(compliantSchema, null, 2);
      await writeFile(outputPath, jsonSchema, "utf-8");

      console.log(`Done: ${name} -> ${SCHEMA_VERSION}/${filename}`);
      exportedFiles.push(filename);
      exported++;
    } catch (error) {
      console.error(`Failed to export ${name}:`, error);
      skipped++;
    }
  }

  console.log(`\nIndividual schema export complete!`);
  console.log(`  Exported: ${exported}`);
  if (skipped > 0) {
    console.log(`  Skipped: ${skipped}`);
  }
  console.log(`\nUpload contents of ${relative(SCHEMAS_PKG_DIR, OUTPUT_DIR)}/ to schema.open-form.dev/${SCHEMA_VERSION}/`);
}

main().catch(console.error);
