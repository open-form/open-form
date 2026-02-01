/**
 * OpenForm Project Manifest Schema
 *
 * Defines the schema for `open-form.json` files that identify
 * a directory as an OpenForm project.
 */

import { Type } from '@sinclair/typebox'

/**
 * Registry entry with authentication options
 */
const RegistryEntryObjectSchema = Type.Object(
  {
    url: Type.String({
      format: 'uri',
      description: 'Registry base URL',
    }),
    headers: Type.Optional(
      Type.Record(
        Type.String(),
        Type.String(),
        { description: 'HTTP headers for authentication (supports ${ENV_VAR} expansion)' }
      )
    ),
    params: Type.Optional(
      Type.Record(
        Type.String(),
        Type.String(),
        { description: 'Query parameters to include in requests' }
      )
    ),
  },
  {
    description: 'Registry configuration with authentication options',
  }
)

/**
 * Registry entry - either a simple URL string or an object with auth
 */
const RegistryEntrySchema = Type.Union(
  [
    Type.String({
      format: 'uri',
      description: 'Simple registry URL',
    }),
    RegistryEntryObjectSchema,
  ],
  {
    description: 'Registry configuration - URL string or object with authentication',
  }
)

/**
 * Artifact configuration for the project
 */
const ArtifactConfigSchema = Type.Object(
  {
    dir: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 256,
        description: 'Directory for installed artifacts (default: "artifacts")',
        default: 'artifacts',
      })
    ),
    format: Type.Optional(
      Type.Unsafe<'json' | 'yaml'>({
        type: 'string',
        enum: ['json', 'yaml'],
        description: 'Default output format for artifacts (default: "yaml")',
        default: 'yaml',
      })
    ),
  },
  {
    description: 'Configuration for artifact management',
  }
)

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
    registries: Type.Optional(
      Type.Record(
        Type.String({
          pattern: '^@[a-zA-Z0-9][a-zA-Z0-9-_]*$',
          description: 'Registry namespace (must start with @)',
        }),
        RegistryEntrySchema,
        {
          description: 'Custom registries for this project (overrides global config)',
        }
      )
    ),
    artifacts: Type.Optional(ArtifactConfigSchema),
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
 * Manifest registry entry type
 */
export type ManifestRegistryEntry =
  | string
  | {
      url: string
      headers?: Record<string, string>
      params?: Record<string, string>
    }

/**
 * Manifest artifact configuration type
 */
export interface ManifestArtifactConfig {
  dir?: string
  format?: 'json' | 'yaml'
}

/**
 * TypeScript interface for Manifest (for better DX)
 */
export interface Manifest {
  $schema?: string
  name: string
  title: string
  description?: string
  visibility: 'public' | 'private'
  registries?: Record<string, ManifestRegistryEntry>
  artifacts?: ManifestArtifactConfig
}
