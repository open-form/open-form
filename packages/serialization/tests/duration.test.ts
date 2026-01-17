/**
 * Tests for duration serializer and Serializers
 * Validates ISO 8601 duration stringification across all locale Serializers
 */

import { describe, it, expect } from "vitest";
import { usaSerializers, euSerializers, intlSerializers } from "../src/index";

describe("duration Serializers", () => {
  describe("usaSerializers", () => {
    it("duration.stringify with year duration", () => {
      const result = usaSerializers.duration.stringify("P1Y");
      expect(result).toBe("P1Y");
    });

    it("duration.stringify with month duration", () => {
      const result = usaSerializers.duration.stringify("P3M");
      expect(result).toBe("P3M");
    });

    it("duration.stringify with day duration", () => {
      const result = usaSerializers.duration.stringify("P5D");
      expect(result).toBe("P5D");
    });

    it("duration.stringify with time duration", () => {
      const result = usaSerializers.duration.stringify("PT30M");
      expect(result).toBe("PT30M");
    });

    it("duration.stringify with complex duration", () => {
      const result = usaSerializers.duration.stringify("P1Y2M3DT4H5M6S");
      expect(result).toBe("P1Y2M3DT4H5M6S");
    });
  });

  describe("euSerializers", () => {
    it("duration.stringify (same as USA)", () => {
      const result = euSerializers.duration.stringify("P1Y");
      expect(result).toBe("P1Y");
    });
  });

  describe("intlSerializers", () => {
    it("duration.stringify (same as USA)", () => {
      const result = intlSerializers.duration.stringify("PT1H");
      expect(result).toBe("PT1H");
    });
  });

  describe("duration edge cases", () => {
    it("duration.stringify with null returns fallback", () => {
      expect(usaSerializers.duration.stringify(null as any)).toBe("");
    });

    it("duration.stringify with undefined returns fallback", () => {
      expect(usaSerializers.duration.stringify(undefined as any)).toBe("");
    });

    it("duration.stringify with empty string throws", () => {
      expect(() => {
        usaSerializers.duration.stringify("");
      }).toThrow();
    });

    it("duration.stringify with invalid format throws", () => {
      expect(() => {
        usaSerializers.duration.stringify("1Y");
      }).toThrow();
    });

    it("duration.stringify with lowercase p throws", () => {
      expect(() => {
        usaSerializers.duration.stringify("p1Y");
      }).toThrow();
    });

    it("duration.stringify with non-string throws", () => {
      expect(() => {
        usaSerializers.duration.stringify(123 as any);
      }).toThrow();
    });

    it("duration.stringify with array throws", () => {
      expect(() => {
        usaSerializers.duration.stringify(["P1Y"] as any);
      }).toThrow();
    });
  });
});
