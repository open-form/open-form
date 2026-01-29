// TypeBox is dev-only for authoring schemas
// The bundled schema file (schemas/open-form.schema.json) is the source of truth
// This file is kept for development purposes but exports are minimal
// Consumers should use the bundled schema via "./schema.json" export

// Export schema extraction utilities
export { extractSchema, getAllSchemas } from './extract'

// Export schema URL constant
/** Default schema URL for OpenForm artifacts */
export const OPENFORM_SCHEMA_URL = "https://schema.open-form.dev/schema.json"
