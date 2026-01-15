export type SerializationFormat = "json" | "yaml";

/** Default schema URL for OpenForm artifacts */
export const OPENFORM_SCHEMA_URL = "https://schema.open-form.dev/schema.json";

export interface SerializationOptions {
  /** Number of spaces for JSON indentation (default: 2) */
  indent?: number;
  /** YAML indentation (default: 2) */
  yamlIndent?: number;
  /** Sort object keys alphabetically */
  sortKeys?: boolean;
  /** Include $schema reference for IDE validation (default: true) */
  includeSchema?: boolean;
}

export class SerializationError extends Error {
  constructor(
    message: string,
    public readonly format: SerializationFormat | "unknown",
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "SerializationError";
  }
}
