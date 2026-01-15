import { fromJSON, isJSON } from "./json";
import { fromYAML } from "./yaml";
import type { SerializationFormat } from "./types";
import { SerializationError } from "./types";

/**
 * Auto-detect format and parse string
 */
export function parse<T = unknown>(content: string): T {
  const format = detectFormat(content);

  if (format === "json") {
    return fromJSON<T>(content);
  }

  if (format === "yaml") {
    return fromYAML<T>(content);
  }

  throw new SerializationError(
    "Unable to detect format - content is neither valid JSON nor YAML",
    "unknown"
  );
}

/**
 * Detect whether string is JSON or YAML
 */
export function detectFormat(content: string): SerializationFormat | null {
  const trimmed = content.trim();

  // Empty content
  if (!trimmed) {
    return null;
  }

  // Try JSON first (stricter format)
  if (isJSON(trimmed)) {
    return "json";
  }

  // Try YAML (more permissive)
  try {
    fromYAML(trimmed);
    return "yaml";
  } catch {
    return null;
  }
}

/**
 * Parse with explicit format
 */
export function parseAs<T = unknown>(
  content: string,
  format: SerializationFormat
): T {
  if (format === "json") {
    return fromJSON<T>(content);
  }

  if (format === "yaml") {
    return fromYAML<T>(content);
  }

  throw new SerializationError(`Unknown format: ${format}`, format);
}
