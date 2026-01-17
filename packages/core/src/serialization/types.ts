// Re-export types from centralized types.ts
export type { SerializationFormat, SerializationOptions } from '@/types'

/** Default schema URL for OpenForm artifacts */
export const OPENFORM_SCHEMA_URL = "https://schema.open-form.dev/schema.json";

// Import for internal use
import type { SerializationFormat } from '@/types'

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
