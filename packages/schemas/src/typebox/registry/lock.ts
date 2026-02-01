/**
 * Lock File Schema
 *
 * Defines the schema for .open-form/lock.json
 * Tracks installed artifacts for reproducibility.
 */

import { Type, type Static } from '@sinclair/typebox';

/**
 * Locked layer information
 */
export const LockedLayerSchema = Type.Object(
  {
    integrity: Type.String({
      pattern: '^sha256:[a-f0-9]{64}$',
      description: 'SHA-256 integrity hash of the layer file',
    }),
    path: Type.String({
      description: 'Relative path to the layer file from project root',
    }),
  },
  {
    title: 'LockedLayer',
    description: 'Information about an installed layer file',
  }
);

/**
 * Locked artifact information
 */
export const LockedArtifactSchema = Type.Object(
  {
    version: Type.String({
      description: 'Installed artifact version',
    }),
    resolved: Type.String({
      format: 'uri',
      description: 'Full URL used to fetch the artifact',
    }),
    integrity: Type.String({
      pattern: '^sha256:[a-f0-9]{64}$',
      description: 'SHA-256 integrity hash of the artifact JSON',
    }),
    installedAt: Type.String({
      format: 'date-time',
      description: 'ISO 8601 timestamp when artifact was installed',
    }),
    format: Type.Union([Type.Literal('json'), Type.Literal('yaml')], {
      description: 'Format the artifact was saved in',
    }),
    path: Type.String({
      description: 'Relative path to the artifact file from project root',
    }),
    layers: Type.Record(
      Type.String({ description: 'Layer key' }),
      LockedLayerSchema,
      { description: 'Installed layers and their metadata' }
    ),
  },
  {
    title: 'LockedArtifact',
    description: 'Information about an installed artifact',
  }
);

/**
 * Lock file schema for .open-form/lock.json
 */
export const LockFileSchema = Type.Object(
  {
    $schema: Type.Optional(
      Type.String({
        format: 'uri',
        description: 'JSON Schema URI for validation',
      })
    ),
    version: Type.Number({
      description: 'Lock file format version',
      default: 1,
    }),
    artifacts: Type.Record(
      Type.String({
        pattern: '^@[a-zA-Z0-9][a-zA-Z0-9-_]*/[a-zA-Z0-9][a-zA-Z0-9-_]*$',
        description: 'Artifact reference (@namespace/name)',
      }),
      LockedArtifactSchema,
      { description: 'Installed artifacts by reference' }
    ),
  },
  {
    $id: 'https://schema.open-form.dev/lock.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'OpenForm Lock File',
    description: 'Schema for .open-form/lock.json lock file',
    additionalProperties: false,
  }
);

/**
 * TypeScript types
 */
export type LockedLayer = Static<typeof LockedLayerSchema>;
export type LockedArtifact = Static<typeof LockedArtifactSchema>;
export type LockFile = Static<typeof LockFileSchema>;
