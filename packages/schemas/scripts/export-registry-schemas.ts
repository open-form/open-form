#!/usr/bin/env tsx
/**
 * Export the OpenForm registry schemas to JSON Schema 2020-12 compliant format
 *
 * This script:
 * 1. Exports registry-related schemas to schemas/ folder
 * 2. These schemas are NOT included in npm distribution
 * 3. They are uploaded to schema.open-form.dev separately
 *
 * Output:
 * - registry.json ($id: https://schema.open-form.dev/registry.json)
 * - registry-item.json ($id: https://schema.open-form.dev/registry-item.json)
 * - config.json ($id: https://schema.open-form.dev/config.json)
 * - lock.json ($id: https://schema.open-form.dev/lock.json)
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCHEMAS_PKG_DIR = join(__dirname, '..')
const OUTPUT_DIR = join(SCHEMAS_PKG_DIR, 'schemas')

interface SchemaExport {
  name: string
  outputFile: string
  importPath: string
  schemaName: string
}

const SCHEMAS_TO_EXPORT: SchemaExport[] = [
  {
    name: 'Registry Index',
    outputFile: 'registry.json',
    importPath: '../src/typebox/registry/registry-index.js',
    schemaName: 'RegistryIndexSchema',
  },
  {
    name: 'Registry Item',
    outputFile: 'registry-item.json',
    importPath: '../src/typebox/registry/registry-item.js',
    schemaName: 'RegistryItemSchema',
  },
  {
    name: 'Global Config',
    outputFile: 'config.json',
    importPath: '../src/typebox/registry/global-config.js',
    schemaName: 'GlobalConfigSchema',
  },
  {
    name: 'Lock File',
    outputFile: 'lock.json',
    importPath: '../src/typebox/registry/lock.js',
    schemaName: 'LockFileSchema',
  },
]

/**
 * Main export function
 */
async function main() {
  console.log('Exporting OpenForm registry schemas to JSON Schema 2020-12...\n')

  try {
    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true })

    for (const schema of SCHEMAS_TO_EXPORT) {
      // Dynamically import the schema module
      const module = await import(schema.importPath)
      const schemaDefinition = module[schema.schemaName]

      if (!schemaDefinition) {
        throw new Error(`${schema.schemaName} not found in ${schema.importPath}`)
      }

      // Parse TypeBox schema to plain JSON object
      const jsonSchema = JSON.parse(JSON.stringify(schemaDefinition))

      // Write the schema
      const outputPath = join(OUTPUT_DIR, schema.outputFile)
      await writeFile(outputPath, JSON.stringify(jsonSchema, null, 2), 'utf-8')

      console.log(`Done: ${schema.name} -> ${schema.outputFile}`)
      console.log(`  $id: ${jsonSchema.$id}`)
    }

    console.log('\nRegistry schema export complete!')
    console.log('\nUpload these files to schema.open-form.dev:')
    for (const schema of SCHEMAS_TO_EXPORT) {
      console.log(`  - ${schema.outputFile}`)
    }
  } catch (error) {
    console.error('Failed to export registry schemas:', error)
    process.exit(1)
  }
}

main().catch(console.error)
