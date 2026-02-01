/**
 * Registry Index Schema
 *
 * Defines the schema for registry.json
 * The index file listing all artifacts available in a registry.
 */

import { Type, type Static } from '@sinclair/typebox';

/**
 * Summary of a registry item (for the index)
 */
export const RegistryItemSummarySchema = Type.Object(
  {
    name: Type.String({
      pattern: '^[a-zA-Z0-9][a-zA-Z0-9-_]*$',
      minLength: 1,
      maxLength: 128,
      description: 'Artifact name (unique within registry)',
    }),
    kind: Type.Union(
      [
        Type.Literal('form'),
        Type.Literal('document'),
        Type.Literal('checklist'),
        Type.Literal('bundle'),
      ],
      { description: 'Artifact kind' }
    ),
    version: Type.String({
      pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+',
      description: 'Semantic version',
    }),
    title: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 200,
        description: 'Human-readable title',
      })
    ),
    description: Type.Optional(
      Type.String({
        maxLength: 2000,
        description: 'Brief description of the artifact',
      })
    ),
    layers: Type.Optional(
      Type.Array(
        Type.String({ description: 'Layer key' }),
        { description: 'Available layer keys' }
      )
    ),
    tags: Type.Optional(
      Type.Array(
        Type.String({
          minLength: 1,
          maxLength: 50,
          description: 'Tag for categorization',
        }),
        { description: 'Tags for search and filtering' }
      )
    ),
  },
  {
    title: 'RegistryItemSummary',
    description: 'Summary information about an artifact in the registry',
  }
);

/**
 * Registry index schema for registry.json
 */
export const RegistryIndexSchema = Type.Object(
  {
    $schema: Type.Optional(
      Type.String({
        format: 'uri',
        description: 'JSON Schema URI for validation',
      })
    ),
    name: Type.String({
      minLength: 1,
      maxLength: 100,
      description: 'Registry name/identifier',
    }),
    homepage: Type.Optional(
      Type.String({
        format: 'uri',
        description: 'Homepage URL for the registry',
      })
    ),
    description: Type.Optional(
      Type.String({
        maxLength: 2000,
        description: 'Description of the registry',
      })
    ),
    artifactsPath: Type.Optional(
      Type.String({
        pattern: '^/[a-zA-Z0-9/_-]*$',
        maxLength: 100,
        description: 'Path prefix for artifact files (e.g., "/r" or "/artifacts"). Defaults to "/r" if not specified.',
        default: '/r',
      })
    ),
    items: Type.Array(RegistryItemSummarySchema, {
      description: 'List of all artifacts in the registry',
    }),
  },
  {
    $id: 'https://schema.open-form.dev/registry.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'OpenForm Registry Index',
    description: 'Schema for registry.json index file',
    additionalProperties: false,
  }
);

/**
 * TypeScript types
 */
export type RegistryItemSummary = Static<typeof RegistryItemSummarySchema>;
export type RegistryIndex = Static<typeof RegistryIndexSchema>;
