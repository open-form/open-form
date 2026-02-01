/**
 * Global Config Schema
 *
 * Defines the schema for ~/.open-form/config.json
 * Used to configure registries and default settings at the user level.
 */

import { Type, type Static } from '@sinclair/typebox';

/**
 * Registry entry with authentication
 */
export const RegistryEntryObjectSchema = Type.Object(
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
    title: 'RegistryEntryObject',
    description: 'Registry configuration with authentication options',
  }
);

/**
 * Registry entry - either a simple URL string or an object with auth
 */
export const RegistryEntrySchema = Type.Union(
  [
    Type.String({
      format: 'uri',
      description: 'Simple registry URL',
    }),
    RegistryEntryObjectSchema,
  ],
  {
    title: 'RegistryEntry',
    description: 'Registry configuration - URL string or object with authentication',
  }
);

/**
 * Default settings for artifact operations
 */
export const GlobalDefaultsSchema = Type.Object(
  {
    format: Type.Optional(
      Type.Union([Type.Literal('json'), Type.Literal('yaml')], {
        description: 'Default output format for artifacts',
        default: 'yaml',
      })
    ),
    artifactsDir: Type.Optional(
      Type.String({
        description: 'Default directory for installed artifacts',
        default: 'artifacts',
      })
    ),
  },
  {
    title: 'GlobalDefaults',
    description: 'Default settings for CLI operations',
  }
);

/**
 * Global config schema for ~/.open-form/config.json
 */
export const GlobalConfigSchema = Type.Object(
  {
    $schema: Type.Optional(
      Type.String({
        format: 'uri',
        description: 'JSON Schema URI for validation',
      })
    ),
    registries: Type.Optional(
      Type.Record(
        Type.String({
          pattern: '^@[a-zA-Z0-9][a-zA-Z0-9-_]*$',
          description: 'Registry namespace (must start with @)',
        }),
        RegistryEntrySchema,
        { description: 'Configured registries by namespace' }
      )
    ),
    defaults: Type.Optional(GlobalDefaultsSchema),
  },
  {
    $id: 'https://schema.open-form.dev/config.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'OpenForm Global Config',
    description: 'Schema for ~/.open-form/config.json global configuration file',
    additionalProperties: false,
  }
);

/**
 * TypeScript types
 */
export type RegistryEntryObject = Static<typeof RegistryEntryObjectSchema>;
export type RegistryEntry = Static<typeof RegistryEntrySchema>;
export type GlobalDefaults = Static<typeof GlobalDefaultsSchema>;
export type GlobalConfig = Static<typeof GlobalConfigSchema>;
