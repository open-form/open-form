import { describe, test, expect } from "vitest";
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
	SerializationError,
} from "../../src/serialization";

// Test data
const sampleObject = {
	name: "John Doe",
	age: 30,
	email: "john@example.com",
	address: {
		street: "123 Main St",
		city: "San Francisco",
		state: "CA",
		zip: "94102",
	},
	tags: ["developer", "typescript"],
	active: true,
	metadata: null,
};

const sampleArray = [1, 2, 3, { nested: "value" }];
const samplePrimitive = "simple string";
const sampleNumber = 42;
const sampleBoolean = true;
const sampleNull = null;

describe("Serialization - JSON Functions", () => {
	describe("toJSON", () => {
		test("serializes object to JSON string", () => {
			const result = toJSON(sampleObject, { includeSchema: false });
			expect(result).toBeTypeOf("string");
			expect(JSON.parse(result)).toEqual(sampleObject);
		});

		test("includes $schema by default", () => {
			const result = toJSON(sampleObject);
			const parsed = JSON.parse(result);
			expect(parsed.$schema).toBe("https://schema.open-form.dev/schema.json");
		});

		test("serializes array to JSON string", () => {
			const result = toJSON(sampleArray);
			expect(result).toBeTypeOf("string");
			expect(JSON.parse(result)).toEqual(sampleArray);
		});

		test("serializes primitive values", () => {
			expect(toJSON(samplePrimitive)).toBe('"simple string"');
			expect(toJSON(sampleNumber)).toBe("42");
			expect(toJSON(sampleBoolean)).toBe("true");
			expect(toJSON(sampleNull)).toBe("null");
		});

		test("uses custom indentation", () => {
			const result = toJSON(sampleObject, { indent: 4 });
			const lines = result.split("\n");
			expect(lines[1]?.startsWith("    ")).toBe(true);
		});

		test("sorts keys when sortKeys is true", () => {
			const result = toJSON(sampleObject, { sortKeys: true, includeSchema: false });
			const parsed = JSON.parse(result);
			const keys = Object.keys(parsed);
			expect(keys).toEqual([...keys].sort());
		});

		test("handles zero indentation", () => {
			const result = toJSON(sampleObject, { indent: 0 });
			expect(result).not.toContain("\n");
		});

		test("throws SerializationError on circular reference", () => {
			const circular: any = { a: 1 };
			circular.b = circular;

			expect(() => toJSON(circular)).toThrow(SerializationError);
		});
	});

	describe("fromJSON", () => {
		test("parses valid JSON string to object", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = fromJSON(jsonString);
			expect(result).toEqual(sampleObject);
		});

		test("parses JSON array", () => {
			const jsonString = JSON.stringify(sampleArray);
			const result = fromJSON(jsonString);
			expect(result).toEqual(sampleArray);
		});

		test("parses primitive values", () => {
			expect(fromJSON('"string"')).toBe("string");
			expect(fromJSON("42")).toBe(42);
			expect(fromJSON("true")).toBe(true);
			expect(fromJSON("null")).toBeNull();
		});

		test("supports generic type parameter", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = fromJSON<typeof sampleObject>(jsonString);
			expect(result.name).toBe("John Doe");
		});

		test("throws SerializationError on invalid JSON", () => {
			expect(() => fromJSON("invalid json")).toThrow(SerializationError);
			expect(() => fromJSON("{ invalid }")).toThrow(SerializationError);
			expect(() => fromJSON('{"key": "value"')).toThrow(SerializationError);
		});

		test("throws SerializationError on empty string", () => {
			expect(() => fromJSON("")).toThrow(SerializationError);
		});

		test("throws SerializationError on malformed JSON", () => {
			expect(() => fromJSON('{"key": }')).toThrow(SerializationError);
			expect(() => fromJSON("[1, 2, ]")).toThrow(SerializationError);
		});
	});

	describe("isJSON", () => {
		test("returns true for valid JSON", () => {
			expect(isJSON('{"key": "value"}')).toBe(true);
			expect(isJSON("[1, 2, 3]")).toBe(true);
			expect(isJSON('"string"')).toBe(true);
			expect(isJSON("42")).toBe(true);
			expect(isJSON("true")).toBe(true);
			expect(isJSON("null")).toBe(true);
		});

		test("returns false for invalid JSON", () => {
			expect(isJSON("invalid")).toBe(false);
			expect(isJSON("{ invalid }")).toBe(false);
			expect(isJSON('{"key": "value"')).toBe(false);
			expect(isJSON("key: value")).toBe(false);
		});

		test("returns false for empty string", () => {
			expect(isJSON("")).toBe(false);
		});

		test("returns false for YAML", () => {
			expect(isJSON("key: value")).toBe(false);
			expect(isJSON("---\nkey: value")).toBe(false);
		});
	});
});

describe("Serialization - YAML Functions", () => {
	describe("toYAML", () => {
		test("serializes object to YAML string", () => {
			const result = toYAML(sampleObject);
			expect(result).toBeTypeOf("string");
			expect(result).toContain("name: John Doe");
			expect(result).toContain("age: 30");
		});

		test("serializes array to YAML string", () => {
			const result = toYAML(sampleArray);
			expect(result).toBeTypeOf("string");
			expect(result).toContain("- 1");
		});

		test("serializes primitive values", () => {
			expect(toYAML(samplePrimitive, { includeSchema: false })).toBe("simple string\n");
			expect(toYAML(sampleNumber, { includeSchema: false })).toBe("42\n");
			expect(toYAML(sampleBoolean, { includeSchema: false })).toBe("true\n");
			expect(toYAML(sampleNull, { includeSchema: false })).toBe("null\n");
		});

		test("includes schema comment by default", () => {
			const result = toYAML(sampleObject);
			expect(result).toContain("# yaml-language-server: $schema=https://schema.open-form.dev/schema.json");
		});

		test("uses custom YAML indentation", () => {
			const result = toYAML(sampleObject, { yamlIndent: 4 });
			expect(result).toContain("    street:");
		});

		test("sorts keys when sortKeys is true", () => {
			const result = toYAML(sampleObject, { sortKeys: true });
			// Filter out schema comment, empty lines, and indented lines
			const lines = result.split("\n").filter((l) => l.trim() && !l.startsWith(" ") && !l.startsWith("#"));
			const firstKey = lines[0]?.split(":")[0];
			expect(firstKey).toBeDefined();
			expect(["active", "address", "age"]).toContain(firstKey);
		});

		test("handles nested objects", () => {
			const result = toYAML(sampleObject);
			expect(result).toContain("address:");
			expect(result).toContain("  street:");
		});

		test("handles arrays", () => {
			const result = toYAML(sampleObject);
			expect(result).toContain("tags:");
			expect(result).toContain("- developer");
		});
	});

	describe("fromYAML", () => {
		test("parses valid YAML string to object", () => {
			const yamlString = "name: John Doe\nage: 30";
			const result = fromYAML(yamlString);
			expect(result).toEqual({ name: "John Doe", age: 30 });
		});

		test("parses YAML array", () => {
			const yamlString = "- 1\n- 2\n- 3";
			const result = fromYAML(yamlString);
			expect(result).toEqual([1, 2, 3]);
		});

		test("parses nested YAML structures", () => {
			const yamlString = "address:\n  street: 123 Main St\n  city: San Francisco";
			const result = fromYAML(yamlString);
			expect(result).toEqual({
				address: {
					street: "123 Main St",
					city: "San Francisco",
				},
			});
		});

		test("supports generic type parameter", () => {
			const yamlString = "name: John Doe\nage: 30";
			const result = fromYAML<{ name: string; age: number }>(yamlString);
			expect(result.name).toBe("John Doe");
			expect(result.age).toBe(30);
		});

		test("throws SerializationError on invalid YAML", () => {
			expect(() => fromYAML("invalid: yaml: : :")).toThrow(SerializationError);
			expect(() => fromYAML("key: value: extra: invalid")).toThrow(SerializationError);
		});

		test("throws SerializationError on malformed YAML", () => {
			expect(() => fromYAML("key: [invalid")).toThrow(SerializationError);
		});
	});

	describe("isYAML", () => {
		test("returns true for valid YAML", () => {
			expect(isYAML("key: value")).toBe(true);
			expect(isYAML("---\nkey: value")).toBe(true);
			expect(isYAML("- item1\n- item2")).toBe(true);
			expect(isYAML("name: John\nage: 30")).toBe(true);
		});

		test("returns true for JSON (valid YAML subset)", () => {
			expect(isYAML('{"key": "value"}')).toBe(true);
			expect(isYAML("[1, 2, 3]")).toBe(true);
		});

		test("returns false for invalid YAML", () => {
			expect(isYAML("invalid: yaml: : :")).toBe(false);
			expect(isYAML("key: value: extra: invalid")).toBe(false);
		});

		test("returns true for empty string (YAML parser accepts it)", () => {
			// YAML parser is permissive and accepts empty strings
			expect(isYAML("")).toBe(true);
		});
	});
});

describe("Serialization - Format Detection", () => {
	describe("detectFormat", () => {
		test("detects JSON format", () => {
			expect(detectFormat('{"key": "value"}')).toBe("json");
			expect(detectFormat("[1, 2, 3]")).toBe("json");
			expect(detectFormat('"string"')).toBe("json");
		});

		test("detects YAML format", () => {
			expect(detectFormat("key: value")).toBe("yaml");
			expect(detectFormat("---\nkey: value")).toBe("yaml");
			expect(detectFormat("- item1\n- item2")).toBe("yaml");
		});

		test("returns null for empty string", () => {
			expect(detectFormat("")).toBeNull();
			expect(detectFormat("   ")).toBeNull();
		});

		test("returns yaml for plain text (YAML parser is permissive)", () => {
			// YAML parser accepts plain text as valid YAML
			expect(detectFormat("invalid content")).toBe("yaml");
			expect(detectFormat("not json or yaml")).toBe("yaml");
		});

		test("prefers JSON over YAML when both are valid", () => {
			// JSON is a subset of YAML, so valid JSON should be detected as JSON
			expect(detectFormat('{"key": "value"}')).toBe("json");
		});
	});
});

describe("Serialization - Auto-Parsing", () => {
	describe("parse", () => {
		test("auto-detects and parses JSON", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = parse(jsonString);
			expect(result).toEqual(sampleObject);
		});

		test("auto-detects and parses YAML", () => {
			const yamlString = "name: John Doe\nage: 30";
			const result = parse(yamlString);
			expect(result).toEqual({ name: "John Doe", age: 30 });
		});

		test("supports generic type parameter", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = parse<typeof sampleObject>(jsonString);
			expect(result.name).toBe("John Doe");
		});

		test("handles empty string (returns null)", () => {
			// Empty string returns null from detectFormat, which throws
			expect(() => parse("")).toThrow(SerializationError);
		});

		test("parses plain text as YAML (YAML parser is permissive)", () => {
			// YAML parser accepts plain text, so this succeeds
			const result = parse("invalid content");
			expect(result).toBe("invalid content");
		});
	});

	describe("parseAs", () => {
		test("parses JSON with explicit format", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = parseAs(jsonString, "json");
			expect(result).toEqual(sampleObject);
		});

		test("parses YAML with explicit format", () => {
			const yamlString = "name: John Doe\nage: 30";
			const result = parseAs(yamlString, "yaml");
			expect(result).toEqual({ name: "John Doe", age: 30 });
		});

		test("supports generic type parameter", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = parseAs<typeof sampleObject>(jsonString, "json");
			expect(result.name).toBe("John Doe");
		});

		test("throws SerializationError on invalid JSON when format is json", () => {
			expect(() => parseAs("invalid json", "json")).toThrow(SerializationError);
		});

		test("throws SerializationError on invalid YAML when format is yaml", () => {
			expect(() => parseAs("invalid: yaml: : :", "yaml")).toThrow(SerializationError);
		});
	});
});

describe("Serialization - Format Conversion", () => {
	describe("convert", () => {
		test("converts JSON to YAML", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = convert(jsonString, "json", "yaml");
			expect(result).toBeTypeOf("string");
			expect(result).toContain("name:");
			expect(result).toContain("John Doe");
		});

		test("converts YAML to JSON", () => {
			const yamlString = "name: John Doe\nage: 30";
			const result = convert(yamlString, "yaml", "json");
			expect(result).toBeTypeOf("string");
			const parsed = JSON.parse(result);
			expect(parsed.name).toBe("John Doe");
			expect(parsed.age).toBe(30);
		});

		test("returns same content when formats are identical", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = convert(jsonString, "json", "json");
			expect(result).toBe(jsonString);
		});

		test("applies options when converting", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = convert(jsonString, "json", "yaml", { sortKeys: true });
			expect(result).toBeTypeOf("string");
		});

		test("throws SerializationError on invalid source format", () => {
			expect(() => convert("invalid json", "json", "yaml")).toThrow(SerializationError);
			expect(() => convert("invalid: yaml: : :", "yaml", "json")).toThrow(SerializationError);
		});
	});

	describe("jsonToYaml", () => {
		test("converts JSON string to YAML", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = jsonToYaml(jsonString);
			expect(result).toBeTypeOf("string");
			expect(result).toContain("name:");
		});

		test("applies options", () => {
			const jsonString = JSON.stringify(sampleObject);
			const result = jsonToYaml(jsonString, { sortKeys: true });
			expect(result).toBeTypeOf("string");
		});

		test("throws SerializationError on invalid JSON", () => {
			expect(() => jsonToYaml("invalid json")).toThrow(SerializationError);
		});
	});

	describe("yamlToJson", () => {
		test("converts YAML string to JSON", () => {
			const yamlString = "name: John Doe\nage: 30";
			const result = yamlToJson(yamlString);
			expect(result).toBeTypeOf("string");
			const parsed = JSON.parse(result);
			expect(parsed.name).toBe("John Doe");
		});

		test("applies options", () => {
			const yamlString = "name: John Doe\nage: 30";
			const result = yamlToJson(yamlString, { indent: 4 });
			expect(result).toBeTypeOf("string");
		});

		test("throws SerializationError on invalid YAML", () => {
			expect(() => yamlToJson("invalid: yaml: : :")).toThrow(SerializationError);
		});
	});
});

describe("Serialization - Generic Serialization", () => {
	describe("serialize", () => {
		test("serializes object to JSON format", () => {
			const result = serialize(sampleObject, "json", { includeSchema: false });
			expect(result).toBeTypeOf("string");
			expect(JSON.parse(result)).toEqual(sampleObject);
		});

		test("serializes object to YAML format", () => {
			const result = serialize(sampleObject, "yaml");
			expect(result).toBeTypeOf("string");
			expect(result).toContain("name:");
		});

		test("applies options for JSON", () => {
			const result = serialize(sampleObject, "json", { indent: 4, sortKeys: true, includeSchema: false });
			expect(result).toBeTypeOf("string");
			const parsed = JSON.parse(result);
			expect(Object.keys(parsed)[0]).toBe("active");
		});

		test("applies options for YAML", () => {
			const result = serialize(sampleObject, "yaml", { sortKeys: true, yamlIndent: 4 });
			expect(result).toBeTypeOf("string");
		});

		test("serializes arrays", () => {
			const jsonResult = serialize(sampleArray, "json");
			expect(JSON.parse(jsonResult)).toEqual(sampleArray);

			const yamlResult = serialize(sampleArray, "yaml");
			expect(yamlResult).toContain("- 1");
		});

		test("serializes primitive values", () => {
			expect(serialize(samplePrimitive, "json")).toBe('"simple string"');
			expect(serialize(sampleNumber, "json")).toBe("42");
			expect(serialize(sampleBoolean, "json")).toBe("true");
			expect(serialize(sampleNull, "json")).toBe("null");
		});
	});
});

describe("Serialization - Direct YAML Utilities", () => {
	describe("stringifyYaml", () => {
		test("stringifies object to YAML", () => {
			const result = stringifyYaml(sampleObject);
			expect(result).toBeTypeOf("string");
			expect(result).toContain("name:");
		});

		test("stringifies array to YAML", () => {
			const result = stringifyYaml(sampleArray);
			expect(result).toBeTypeOf("string");
			expect(result).toContain("- 1");
		});

		test("stringifies primitive values", () => {
			expect(stringifyYaml(samplePrimitive)).toBe("simple string\n");
			expect(stringifyYaml(sampleNumber)).toBe("42\n");
		});
	});

	describe("parseYaml", () => {
		test("parses YAML string to object", () => {
			const yamlString = "name: John Doe\nage: 30";
			const result = parseYaml(yamlString);
			expect(result).toEqual({ name: "John Doe", age: 30 });
		});

		test("parses YAML array", () => {
			const yamlString = "- 1\n- 2\n- 3";
			const result = parseYaml(yamlString);
			expect(result).toEqual([1, 2, 3]);
		});

		test("throws error on invalid YAML", () => {
			expect(() => parseYaml("invalid: yaml: : :")).toThrow();
		});
	});
});

describe("Serialization - Error Handling", () => {
	describe("SerializationError", () => {
		test("has correct error properties", () => {
			const error = new SerializationError("Test error", "json");
			expect(error).toBeInstanceOf(Error);
			expect(error.name).toBe("SerializationError");
			expect(error.message).toBe("Test error");
			expect(error.format).toBe("json");
		});

		test("includes cause error", () => {
			const cause = new Error("Original error");
			const error = new SerializationError("Test error", "json", cause);
			expect(error.cause).toBe(cause);
		});

		test("supports unknown format", () => {
			const error = new SerializationError("Test error", "unknown");
			expect(error.format).toBe("unknown");
		});
	});

	describe("Error scenarios", () => {
		test("toJSON throws on circular references", () => {
			const circular: any = { a: 1 };
			circular.b = circular;

			expect(() => toJSON(circular)).toThrow(SerializationError);
		});

		test("fromJSON throws on malformed JSON", () => {
			expect(() => fromJSON('{"key": }')).toThrow(SerializationError);
			expect(() => fromJSON("[1, 2, ]")).toThrow(SerializationError);
		});

		test("fromYAML throws on malformed YAML", () => {
			expect(() => fromYAML("key: value: extra: invalid")).toThrow(SerializationError);
		});

		test("parse handles empty string (throws)", () => {
			// Empty string cannot be detected, throws error
			expect(() => parse("")).toThrow(SerializationError);
		});

		test("convert throws on invalid source", () => {
			expect(() => convert("invalid", "json", "yaml")).toThrow(SerializationError);
		});
	});
});

describe("Serialization - Edge Cases", () => {
	test("handles empty objects", () => {
		expect(toJSON({}, { includeSchema: false })).toBe("{}");
		expect(fromJSON("{}")).toEqual({});
		expect(toYAML({}, { includeSchema: false })).toBe("{}\n");
		expect(fromYAML("{}")).toEqual({});
	});

	test("handles empty arrays", () => {
		expect(toJSON([], { includeSchema: false })).toBe("[]");
		expect(fromJSON("[]")).toEqual([]);
		expect(toYAML([], { includeSchema: false })).toBe("[]\n");
		expect(fromYAML("[]")).toEqual([]);
	});

	test("handles special characters in strings", () => {
		const data = { message: 'Hello "world" with\nnewlines' };
		const json = toJSON(data);
		const parsed = fromJSON<typeof data>(json);
		expect(parsed.message).toBe(data.message);
	});

	test("handles unicode characters", () => {
		const data = { name: "José 中文 🎉" };
		const json = toJSON(data);
		const parsed = fromJSON<typeof data>(json);
		expect(parsed.name).toBe(data.name);
	});

	test("handles very large numbers", () => {
		const data = { large: Number.MAX_SAFE_INTEGER };
		const json = toJSON(data);
		const parsed = fromJSON<typeof data>(json);
		expect(parsed.large).toBe(Number.MAX_SAFE_INTEGER);
	});

	test("handles dates (serialized as strings)", () => {
		const date = new Date("2025-01-01");
		const data = { date };
		const json = toJSON(data);
		const parsed = fromJSON<{ date: string }>(json);
		expect(parsed.date).toBe(date.toISOString());
	});

	test("round-trip conversion maintains data integrity", () => {
		const original = sampleObject;
		const json = toJSON(original, { includeSchema: false });
		const yaml = jsonToYaml(json, { includeSchema: false });
		const backToJson = yamlToJson(yaml, { includeSchema: false });
		const parsed = fromJSON(backToJson);
		expect(parsed).toEqual(original);
	});
});

