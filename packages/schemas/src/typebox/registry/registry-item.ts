/**
 * Registry Item Schema
 *
 * Defines the schema for r/{name}.json
 * Individual artifact served from a registry.
 *
 * This extends the standard layer schema with a `url` field
 * for file-backed layers to enable downloading.
 */

import { Type, type Static } from '@sinclair/typebox';

/**
 * Common fields shared by all layer types (registry version)
 */
const RegistryLayerBaseSchema = Type.Object({
  mimeType: Type.String({
    description: 'MIME type of the layer content',
    minLength: 1,
    maxLength: 100,
  }),
  title: Type.Optional(
    Type.String({
      description: 'Human-readable title for this layer',
      minLength: 1,
      maxLength: 200,
    })
  ),
  description: Type.Optional(
    Type.String({
      description: 'Description of what this layer represents',
      minLength: 1,
      maxLength: 2000,
    })
  ),
  checksum: Type.Optional(
    Type.String({
      description: 'SHA-256 checksum for integrity verification',
      pattern: '^sha256:[a-f0-9]{64}$',
    })
  ),
  bindings: Type.Optional(
    Type.Record(
      Type.String(),
      Type.String(),
      { description: 'Mapping from form field names to template identifiers' }
    )
  ),
});

/**
 * Inline layer for registry items
 */
export const RegistryInlineLayerSchema = Type.Intersect(
  [
    RegistryLayerBaseSchema,
    Type.Object({
      kind: Type.Literal('inline'),
      text: Type.String({
        description: 'Layer content with interpolation placeholders',
        minLength: 1,
        maxLength: 1000000,
      }),
    }),
  ],
  {
    title: 'RegistryInlineLayer',
    description: 'Inline layer with embedded content',
  }
);

/**
 * File layer for registry items - includes URL for downloading
 */
export const RegistryFileLayerSchema = Type.Intersect(
  [
    RegistryLayerBaseSchema,
    Type.Object({
      kind: Type.Literal('file'),
      path: Type.String({
        description: 'Relative path for the layer file when installed',
        minLength: 1,
        maxLength: 1000,
      }),
      url: Type.String({
        format: 'uri',
        description: 'URL to download the layer file from',
      }),
    }),
  ],
  {
    title: 'RegistryFileLayer',
    description: 'File-backed layer with download URL',
  }
);

/**
 * Registry layer union
 */
export const RegistryLayerSchema = Type.Union(
  [RegistryInlineLayerSchema, RegistryFileLayerSchema],
  {
    title: 'RegistryLayer',
    description: 'Layer in a registry item - inline or file with URL',
  }
);

/**
 * Registry item schema - the full artifact served from registry
 *
 * Note: This is intentionally loose to accommodate all artifact kinds.
 * The CLI validates against the full artifact schema after fetching.
 */
export const RegistryItemSchema = Type.Object(
  {
    $schema: Type.Optional(
      Type.String({
        format: 'uri',
        description: 'JSON Schema URI for validation',
      })
    ),
    kind: Type.Union(
      [
        Type.Literal('form'),
        Type.Literal('document'),
        Type.Literal('checklist'),
        Type.Literal('bundle'),
      ],
      { description: 'Artifact kind' }
    ),
    name: Type.String({
      pattern: '^[a-zA-Z0-9][a-zA-Z0-9-_]*$',
      minLength: 1,
      maxLength: 128,
      description: 'Artifact name',
    }),
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
        description: 'Artifact description',
      })
    ),
    // Layers with registry-specific URL field
    layers: Type.Optional(
      Type.Record(
        Type.String({ description: 'Layer key' }),
        RegistryLayerSchema,
        { description: 'Available layers' }
      )
    ),
    defaultLayer: Type.Optional(
      Type.String({
        description: 'Default layer key',
      })
    ),
    // Allow additional properties for artifact-specific fields (fields, items, etc.)
  },
  {
    $id: 'https://schema.open-form.dev/registry-item.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'OpenForm Registry Item',
    description: 'Schema for registry item files (r/{name}.json)',
    additionalProperties: true, // Allow fields, items, parties, etc.
  }
);

/**
 * TypeScript types
 */
export type RegistryInlineLayer = Static<typeof RegistryInlineLayerSchema>;
export type RegistryFileLayer = Static<typeof RegistryFileLayerSchema>;
export type RegistryLayer = Static<typeof RegistryLayerSchema>;
export type RegistryItem = Static<typeof RegistryItemSchema>;
