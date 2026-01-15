#!/usr/bin/env tsx
/**
 * Comprehensive demo of all serialization functions
 *
 * This demo showcases:
 * - JSON serialization (toJSON, fromJSON, isJSON)
 * - YAML serialization (toYAML, fromYAML, isYAML)
 * - Format detection (detectFormat)
 * - Auto-parsing (parse, parseAs)
 * - Format conversion (convert, jsonToYaml, yamlToJson)
 * - Generic serialization (serialize)
 * - Direct YAML utilities (stringifyYaml, parseYaml)
 */

import {
  toJSON,
  fromJSON,
  isJSON,
  toYAML,
  fromYAML,
  isYAML,
  parse,
  parseAs,
  detectFormat,
  serialize,
  convert,
  jsonToYaml,
  yamlToJson,
  stringifyYaml,
  parseYaml,
} from "../../src/serialization";

// Sample data for demonstrations
const sampleData = {
  name: "John Doe",
  age: 30,
  email: "john@example.com",
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
  },
  tags: ["developer", "typescript", "open-source"],
  active: true,
};

console.log("=".repeat(80));
console.log("Serialization Functions Demo");
console.log("=".repeat(80));
console.log();

// ============================================================================
// JSON Functions
// ============================================================================
console.log("📄 JSON Functions");
console.log("-".repeat(80));

// toJSON - Serialize to JSON
const jsonString = toJSON(sampleData);
console.log("1. toJSON() - Serialize object to JSON:");
console.log(jsonString);
console.log();

// toJSON with options
const jsonSorted = toJSON(sampleData, { sortKeys: true, indent: 4 });
console.log("2. toJSON() with options (sorted keys, 4-space indent):");
console.log(jsonSorted);
console.log();

// fromJSON - Parse JSON string
const parsedFromJson = fromJSON<typeof sampleData>(jsonString);
console.log("3. fromJSON() - Parse JSON string:");
console.log("   Parsed name:", parsedFromJson.name);
console.log("   Parsed age:", parsedFromJson.age);
console.log();

// isJSON - Check if string is valid JSON
console.log("4. isJSON() - Validate JSON strings:");
console.log('   isJSON(\'{"key": "value"}\'):', isJSON('{"key": "value"}'));
console.log("   isJSON('invalid json'):", isJSON("invalid json"));
console.log("   isJSON('---\nkey: value'):", isJSON("---\nkey: value"));
console.log();

// ============================================================================
// YAML Functions
// ============================================================================
console.log("📝 YAML Functions");
console.log("-".repeat(80));

// toYAML - Serialize to YAML
const yamlString = toYAML(sampleData);
console.log("5. toYAML() - Serialize object to YAML:");
console.log(yamlString);
console.log();

// toYAML with options
const yamlSorted = toYAML(sampleData, { sortKeys: true, yamlIndent: 4 });
console.log("6. toYAML() with options (sorted keys, 4-space indent):");
console.log(yamlSorted);
console.log();

// fromYAML - Parse YAML string
const parsedFromYaml = fromYAML<typeof sampleData>(yamlString);
console.log("7. fromYAML() - Parse YAML string:");
console.log("   Parsed name:", parsedFromYaml.name);
console.log("   Parsed email:", parsedFromYaml.email);
console.log();

// isYAML - Check if string is valid YAML
console.log("8. isYAML() - Validate YAML strings:");
console.log("   isYAML('key: value'):", isYAML("key: value"));
console.log('   isYAML(\'{"key": "value"}\'):', isYAML('{"key": "value"}'));
console.log("   isYAML('invalid'):", isYAML("invalid"));
console.log();

// ============================================================================
// Format Detection
// ============================================================================
console.log("🔍 Format Detection");
console.log("-".repeat(80));

// detectFormat - Auto-detect format
console.log("9. detectFormat() - Auto-detect format:");
console.log(
  '   detectFormat(\'{"key": "value"}\'):',
  detectFormat('{"key": "value"}')
);
console.log("   detectFormat('key: value'):", detectFormat("key: value"));
console.log("   detectFormat(''):", detectFormat(""));
console.log();

// ============================================================================
// Auto-Parsing
// ============================================================================
console.log("🔄 Auto-Parsing");
console.log("-".repeat(80));

// parse - Auto-detect and parse
const autoParsedJson = parse<typeof sampleData>(jsonString);
console.log("10. parse() - Auto-detect and parse JSON:");
console.log("    Parsed name:", autoParsedJson.name);
console.log();

const autoParsedYaml = parse<typeof sampleData>(yamlString);
console.log("11. parse() - Auto-detect and parse YAML:");
console.log("    Parsed email:", autoParsedYaml.email);
console.log();

// parseAs - Parse with explicit format
const explicitJson = parseAs<typeof sampleData>(jsonString, "json");
console.log("12. parseAs() - Parse with explicit format (JSON):");
console.log("    Parsed age:", explicitJson.age);
console.log();

const explicitYaml = parseAs<typeof sampleData>(yamlString, "yaml");
console.log("13. parseAs() - Parse with explicit format (YAML):");
console.log("    Parsed active:", explicitYaml.active);
console.log();

// ============================================================================
// Format Conversion
// ============================================================================
console.log("🔄 Format Conversion");
console.log("-".repeat(80));

// convert - Convert between formats
const jsonToYamlConverted = convert(jsonString, "json", "yaml");
console.log("14. convert() - Convert JSON to YAML:");
console.log(jsonToYamlConverted);
console.log();

const yamlToJsonConverted = convert(yamlString, "yaml", "json", {
  indent: 2,
});
console.log("15. convert() - Convert YAML to JSON:");
console.log(yamlToJsonConverted);
console.log();

// jsonToYaml - Convenience function
const jsonToYamlResult = jsonToYaml(jsonString);
console.log("16. jsonToYaml() - Convert JSON string to YAML:");
console.log(jsonToYamlResult.substring(0, 100) + "...");
console.log();

// yamlToJson - Convenience function
const yamlToJsonResult = yamlToJson(yamlString);
console.log("17. yamlToJson() - Convert YAML string to JSON:");
console.log(yamlToJsonResult.substring(0, 100) + "...");
console.log();

// ============================================================================
// Generic Serialization
// ============================================================================
console.log("📦 Generic Serialization");
console.log("-".repeat(80));

// serialize - Serialize to specific format
const serializedJson = serialize(sampleData, "json");
console.log("18. serialize() - Serialize to JSON format:");
console.log(serializedJson.substring(0, 100) + "...");
console.log();

const serializedYaml = serialize(sampleData, "yaml");
console.log("19. serialize() - Serialize to YAML format:");
console.log(serializedYaml.substring(0, 100) + "...");
console.log();

// serialize with options
const serializedWithOptions = serialize(sampleData, "json", {
  sortKeys: true,
  indent: 4,
});
console.log("20. serialize() with options (sorted, 4-space indent):");
console.log(serializedWithOptions.substring(0, 100) + "...");
console.log();

// ============================================================================
// Direct YAML Utilities
// ============================================================================
console.log("🔧 Direct YAML Utilities");
console.log("-".repeat(80));

// stringifyYaml - Direct YAML stringify
const directYaml = stringifyYaml(sampleData);
console.log("21. stringifyYaml() - Direct YAML stringify:");
console.log(directYaml.substring(0, 100) + "...");
console.log();

// parseYaml - Direct YAML parse
const directParsed = parseYaml(directYaml);
console.log("22. parseYaml() - Direct YAML parse:");
console.log("    Parsed name:", (directParsed as typeof sampleData).name);
console.log();

// ============================================================================
// Error Handling
// ============================================================================
console.log("⚠️  Error Handling");
console.log("-".repeat(80));

try {
  fromJSON("invalid json {");
} catch (error) {
  console.log("23. Error handling - Invalid JSON:");
  console.log("    Error:", error instanceof Error ? error.message : error);
  console.log();
}

try {
  fromYAML("invalid: yaml: : :");
} catch (error) {
  console.log("24. Error handling - Invalid YAML:");
  console.log("    Error:", error instanceof Error ? error.message : error);
  console.log();
}

// ============================================================================
// Summary
// ============================================================================
console.log("=".repeat(80));
console.log("✅ Demo Complete!");
console.log("=".repeat(80));
console.log();
console.log("Functions demonstrated:");
console.log("  JSON:     toJSON, fromJSON, isJSON");
console.log("  YAML:     toYAML, fromYAML, isYAML");
console.log("  Parser:   parse, parseAs, detectFormat");
console.log("  Converter: serialize, convert, jsonToYaml, yamlToJson");
console.log("  Direct:   stringifyYaml, parseYaml");
console.log();
