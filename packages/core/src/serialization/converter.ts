import { toJSON, fromJSON } from "./json";
import { toYAML, fromYAML } from "./yaml";
import type { SerializationFormat, SerializationOptions } from "./types";
import { SerializationError } from "./types";

/**
 * Convert between formats
 */
export function convert(
  content: string,
  fromFormat: SerializationFormat,
  toFormat: SerializationFormat,
  options?: SerializationOptions
): string {
  // No conversion needed
  if (fromFormat === toFormat) {
    return content;
  }

  try {
    // Parse from source format
    const data = fromFormat === "json" ? fromJSON(content) : fromYAML(content);

    // Serialize to target format
    return toFormat === "json" ? toJSON(data, options) : toYAML(data, options);
  } catch (error) {
    throw new SerializationError(
      `Failed to convert from ${fromFormat} to ${toFormat}`,
      fromFormat,
      error as Error
    );
  }
}

/**
 * Convert JSON string to YAML
 */
export function jsonToYaml(
  jsonString: string,
  options?: SerializationOptions
): string {
  return convert(jsonString, "json", "yaml", options);
}

/**
 * Convert YAML string to JSON
 */
export function yamlToJson(
  yamlString: string,
  options?: SerializationOptions
): string {
  return convert(yamlString, "yaml", "json", options);
}

/**
 * Convert object to specific format
 */
export function serialize(
  data: unknown,
  format: SerializationFormat,
  options?: SerializationOptions
): string {
  return format === "json" ? toJSON(data, options) : toYAML(data, options);
}
