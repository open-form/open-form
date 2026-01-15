#!/usr/bin/env tsx
/**
 * Export the OpenForm manifest schema to JSON Schema 2020-12 compliant format
 *
 * This script:
 * 1. Exports the ManifestSchema to schemas/manifest.json
 * 2. Outputs to schemas/ folder for upload to schema.open-form.dev
 *
 * Output:
 * - manifest.json ($id: https://schema.open-form.dev/manifest.json)
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCHEMAS_PKG_DIR = join(__dirname, '..')
const OUTPUT_DIR = join(SCHEMAS_PKG_DIR, 'schemas')
const OUTPUT_FILE = join(OUTPUT_DIR, 'manifest.json')

/**
 * Main export function
 */
async function main() {
  console.log('Exporting OpenForm manifest schema to JSON Schema 2020-12...\n')

  try {
    // Import the ManifestSchema
    const { ManifestSchema } = await import('../src/typebox/manifest.js')

    // Parse TypeBox schema to plain JSON object
    // TypeBox schemas are already JSON-serializable
    const jsonSchema = JSON.parse(JSON.stringify(ManifestSchema))

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true })

    // Write the schema
    await writeFile(OUTPUT_FILE, JSON.stringify(jsonSchema, null, 2), 'utf-8')

    console.log('Done: manifest.json')
    console.log(`  $id: ${jsonSchema.$id}`)
    console.log(`\nManifest schema export complete!`)
    console.log(`\nUpload schemas/manifest.json to schema.open-form.dev/manifest.json`)
  } catch (error) {
    console.error('Failed to export manifest schema:', error)
    process.exit(1)
  }
}

main().catch(console.error)
