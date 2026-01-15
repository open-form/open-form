import type { SerializationOptions } from "./types";
import { SerializationError, OPENFORM_SCHEMA_URL } from "./types";

/**
 * Serialize object to JSON string
 *
 * @param data - Object to serialize
 * @param options - Serialization options
 * @returns JSON string, optionally with $schema property for IDE validation
 */
export function toJSON(
  data: unknown,
  options: SerializationOptions = {}
): string {
  const { indent = 2, sortKeys = false, includeSchema = true } = options;

  try {
    let output = data;

    // Add $schema property if requested and data is an object
    if (includeSchema && data !== null && typeof data === "object" && !Array.isArray(data)) {
      output = { $schema: OPENFORM_SCHEMA_URL, ...data };
    }

    if (sortKeys) {
      return JSON.stringify(sortObjectKeys(output), null, indent);
    }
    return JSON.stringify(output, null, indent);
  } catch (error) {
    throw new SerializationError(
      "Failed to serialize to JSON",
      "json",
      error as Error
    );
  }
}

/**
 * Parse JSON string to object
 */
export function fromJSON<T = unknown>(content: string): T {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new SerializationError(
      "Failed to parse JSON",
      "json",
      error as Error
    );
  }
}

/**
 * Check if string is valid JSON
 */
export function isJSON(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively sort object keys
 */
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
          return result;
        },
        {} as Record<string, unknown>
      );
  }

  return obj;
}
