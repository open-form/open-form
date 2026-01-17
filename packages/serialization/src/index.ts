/**
 * @open-form/serialization
 *
 * Primitive serialization for OpenForm framework
 * Locale and region-aware conversion of primitives to strings
 */

// Re-export types from @open-form/types for convenience
export type { SerializerRegistry, SerializerConfig } from "@open-form/types";

// Serializers
export * from "./serializers";

// Serializer Registries
export * from "./registry";

// Field detection and preprocessing utilities (for renderers)
export * from "./field-detection";
