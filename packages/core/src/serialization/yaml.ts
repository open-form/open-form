import { stringify as stringifyYaml, parse as parseYaml } from "yaml";
import type { SerializationOptions } from "./types";
import { SerializationError, OPENFORM_SCHEMA_URL } from "./types";

/**
 * Serialize object to YAML string
 *
 * @param data - Object to serialize
 * @param options - Serialization options
 * @returns YAML string, optionally with schema comment for IDE validation
 */
export function toYAML(
  data: unknown,
  options: SerializationOptions = {}
): string {
  const { yamlIndent = 2, sortKeys = false, includeSchema = true } = options;

  try {
    const yaml = stringifyYaml(data, {
      indent: yamlIndent,
      sortMapEntries: sortKeys,
    });

    if (includeSchema) {
      return `# yaml-language-server: $schema=${OPENFORM_SCHEMA_URL}\n${yaml}`;
    }

    return yaml;
  } catch (error) {
    throw new SerializationError(
      "Failed to serialize to YAML",
      "yaml",
      error as Error
    );
  }
}

/**
 * Parse YAML string to object
 */
export function fromYAML<T = unknown>(content: string): T {
  try {
    return parseYaml(content) as T;
  } catch (error) {
    throw new SerializationError(
      "Failed to parse YAML",
      "yaml",
      error as Error
    );
  }
}

/**
 * Check if string is valid YAML
 */
export function isYAML(content: string): boolean {
  try {
    parseYaml(content);
    return true;
  } catch {
    return false;
  }
}
