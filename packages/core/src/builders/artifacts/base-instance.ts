/**
 * BaseArtifactInstance - Abstract base class for all artifact instances
 *
 * Provides common functionality shared by FormInstance, CaseInstance,
 * PacketInstance, ChecklistInstance, EnclosureInstance, and TemplateInstance.
 */

import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Artifact } from '@open-form/types'
import type { Metadata } from '@open-form/types'
import { validate as validateArtifact, type ValidateOptions } from '@/utils/validate-artifact'
import { toYAML, type SerializationOptions, OPENFORM_SCHEMA_URL } from '@/serialization'

/**
 * Base interface for all artifact instances.
 * Defines the common API that all artifact wrapper classes implement.
 */
export interface IArtifactInstance<T extends Artifact> {
  /** The raw artifact data. Use this for serialization or direct access. */
  readonly schema: T

  /** Artifact kind discriminator. */
  readonly kind: T['kind']

  /** Unique identifier/slug. */
  readonly name: string

  /** Semantic version string. */
  readonly version: string

  /** Human-friendly title. */
  readonly title: string

  /** Optional description. */
  readonly description: string | undefined

  /** Optional internal code. */
  readonly code: string | undefined

  /** Optional release date (ISO string). */
  readonly releaseDate: string | undefined

  /** Optional custom metadata. */
  readonly metadata: Metadata | undefined

  /**
   * Validates the artifact schema definition.
   * Returns a Standard Schema result with either `value` or `issues`.
   */
  validate(options?: ValidateOptions): StandardSchemaV1.Result<T>

  /**
   * Checks if the artifact schema definition is valid.
   * Returns true if valid, false otherwise.
   */
  isValid(options?: ValidateOptions): boolean

  /**
   * Serialize to JSON object. Called by JSON.stringify().
   * @param options - Serialization options (includeSchema defaults to true)
   */
  toJSON(options?: SerializationOptions): T | (T & { $schema: string })

  /**
   * Serialize to YAML string.
   * @param options - Serialization options (includeSchema defaults to true)
   */
  toYAML(options?: SerializationOptions): string

  /**
   * Create an exact copy of this instance.
   */
  clone(): IArtifactInstance<T>
}

/**
 * Abstract base class implementing common artifact instance functionality.
 *
 * All artifact instances (Form, Case, Packet, etc.) extend this class
 * to inherit shared behavior for validation, serialization, and mutation.
 *
 * @example
 * ```typescript
 * class FormInstance<F extends Form> extends BaseArtifactInstance<F> {
 *   // Form-specific methods like render(), parseData(), etc.
 * }
 * ```
 */
export abstract class BaseArtifactInstance<T extends Artifact> implements IArtifactInstance<T> {
  /**
   * The raw artifact data. Use this for serialization or when you need
   * access to the underlying artifact object.
   *
   * @example
   * ```typescript
   * const form = open.form({ ... })
   * console.log(form.schema.name)  // Access raw form properties
   * const yaml = open.toYAML(form.schema)  // Serialize raw form
   * ```
   */
  readonly schema: T

  constructor(artifact: T) {
    this.schema = artifact
  }

  // ============================================================================
  // Common Property Getters
  // ============================================================================

  get kind(): T['kind'] {
    return this.schema.kind
  }

  get name(): string {
    return this.schema.name
  }

  get version(): string {
    return this.schema.version
  }

  get title(): string {
    return this.schema.title
  }

  get description(): string | undefined {
    return this.schema.description
  }

  get code(): string | undefined {
    return this.schema.code
  }

  get releaseDate(): string | undefined {
    return this.schema.releaseDate
  }

  get metadata(): Metadata | undefined {
    return this.schema.metadata
  }

  // ============================================================================
  // Validation
  // ============================================================================

  /**
   * Validates the artifact schema definition itself (not data).
   * Returns a Standard Schema result with either `value` or `issues`.
   *
   * @param options - Optional validation options
   * @returns Standard Schema result: `{ value }` on success, `{ issues }` on failure
   *
   * @example
   * ```typescript
   * const result = artifact.validate()
   * if ('issues' in result) {
   *   console.error('Artifact definition is invalid:', result.issues)
   * } else {
   *   console.log('Artifact is valid')
   * }
   * ```
   */
  validate(options?: ValidateOptions): StandardSchemaV1.Result<T> {
    return validateArtifact<T>(this.schema, options)
  }

  /**
   * Checks if the artifact schema definition is valid.
   * Returns true if valid, false otherwise.
   *
   * This is a convenience wrapper around validate() that returns a boolean
   * instead of the full result object.
   *
   * @param options - Optional validation options
   * @returns true if valid, false otherwise
   *
   * @example
   * ```typescript
   * if (form.isValid()) {
   *   // Safe to use the form
   * }
   * ```
   */
  isValid(options?: ValidateOptions): boolean {
    const result = this.validate(options)
    return !('issues' in result)
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  /**
   * Serialize to JSON object. This method is called by JSON.stringify().
   *
   * @param options - Serialization options (includeSchema defaults to true)
   * @returns The artifact object, optionally with $schema property
   *
   * @example
   * ```typescript
   * const json = JSON.stringify(form)
   * // or with schema for IDE validation
   * const obj = form.toJSON()  // includes $schema by default
   * const obj = form.toJSON({ includeSchema: false })  // without $schema
   * ```
   */
  toJSON(options: SerializationOptions = {}): T | (T & { $schema: string }) {
    const { includeSchema = true } = options
    if (includeSchema) {
      return { $schema: OPENFORM_SCHEMA_URL, ...this.schema } as T & { $schema: string }
    }
    return this.schema
  }

  /**
   * Serialize to YAML string.
   *
   * @param options - Serialization options (includeSchema defaults to true)
   * @returns YAML string representation of the artifact, optionally with schema comment
   *
   * @example
   * ```typescript
   * const yaml = form.toYAML()  // includes schema comment by default
   * await fs.writeFile('form.yaml', yaml)
   *
   * const yaml = form.toYAML({ includeSchema: false })  // without schema comment
   * ```
   */
  toYAML(options: SerializationOptions = {}): string {
    return toYAML(this.schema, options)
  }

  // ============================================================================
  // Mutation (abstract - implemented by subclasses)
  // ============================================================================

  /**
   * Create an exact copy of this instance.
   * Subclasses must implement this to return the correct instance type.
   *
   * @returns A new instance with a deep clone of the artifact data
   *
   * @example
   * ```typescript
   * const copy = form.clone()
   * // copy is a new FormInstance with cloned data
   * ```
   */
  abstract clone(): IArtifactInstance<T>
}
