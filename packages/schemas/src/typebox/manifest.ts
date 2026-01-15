/**
 * OpenForm Project Manifest Schema
 *
 * Defines the schema for `open-form.json` files that identify
 * a directory as an OpenForm project.
 */

import { Type, type Static } from '@sinclair/typebox'

/**
 * Manifest schema for open-form.json project files
 */
export const ManifestSchema = Type.Object(
  {
    $schema: Type.Optional(
      Type.String({
        format: 'uri',
        description: 'JSON Schema URI for validation',
      })
    ),
    name: Type.String({
      pattern: '^@[a-z0-9-]+/[a-z0-9-]+$',
      minLength: 3,
      maxLength: 214,
      description: 'Scoped package name (@org/repo-name)',
    }),
    title: Type.String({
      minLength: 1,
      maxLength: 200,
      description: 'Human-readable project title',
    }),
    description: Type.Optional(
      Type.String({
        maxLength: 1000,
        description: 'Project description',
      })
    ),
    visibility: Type.Unsafe<'public' | 'private'>({
      type: 'string',
      enum: ['public', 'private'],
      default: 'private',
      description: 'Project visibility',
    }),
  },
  {
    $id: 'https://schema.open-form.dev/manifest.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'OpenForm Project Manifest',
    description: 'Schema for open-form.json project manifest files',
    additionalProperties: false,
  }
)

/**
 * Raw TypeBox static type for Manifest
 */
export type ManifestRaw = Static<typeof ManifestSchema>

/**
 * TypeScript interface for Manifest (for better DX)
 */
export interface Manifest {
  $schema?: string
  name: string
  title: string
  description?: string
  visibility: 'public' | 'private'
}
