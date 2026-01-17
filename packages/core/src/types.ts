/**
 * @open-form/core - Public Type Definitions
 *
 * This file contains all public interfaces and types for the @open-form/core package.
 * Centralizing types here provides:
 * - Easy documentation generation
 * - Better discoverability for developers
 * - Clean separation of types from implementations
 */

import type { StandardSchemaV1 } from '@standard-schema/spec'
import type {
  Form,
  Document,
  Bundle,
  Checklist,
  Artifact,
  Metadata,
  Party,
  Resolver,
  OpenFormRenderer,
  RendererLayer,
} from '@open-form/types'

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Represents a validation error for a specific field.
 */
export interface ValidationError {
  /** The field path that failed validation (e.g., 'fields.age' or 'annexes.schedule') */
  field: string
  /** Human-readable error message */
  message: string
  /** The invalid value that caused the error */
  value?: unknown
}

/**
 * Successful validation result containing the validated data.
 *
 * @typeParam T - The type of the validated data
 */
export interface ValidationSuccess<T> {
  /** Indicates successful validation */
  success: true
  /** The validated and potentially transformed data */
  data: T
  /** Always null on success */
  errors: null
}

/**
 * Failed validation result containing error details.
 */
export interface ValidationFailure {
  /** Indicates failed validation */
  success: false
  /** Always null on failure */
  data: null
  /** Array of validation errors */
  errors: ValidationError[]
}

/**
 * Result of a validation operation - either success with data or failure with errors.
 *
 * @typeParam T - The type of the validated data on success
 *
 * @example
 * ```typescript
 * const result = form.safeParseData(input)
 * if (result.success) {
 *   console.log(result.data)  // Validated data
 * } else {
 *   console.log(result.errors)  // Array of ValidationError
 * }
 * ```
 */
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

// ============================================================================
// ARTIFACT VALIDATION OPTIONS
// ============================================================================

/**
 * Options for validating artifact definitions.
 */
export interface ValidateOptions {
  /** Whether to validate schema structure. Default: true */
  schema?: boolean
  /** Whether to validate logic expressions. Default: true */
  logic?: boolean
  /** Whether to collect all errors or stop at first. Default: true */
  collectAllErrors?: boolean
}

// ============================================================================
// SERIALIZATION OPTIONS
// ============================================================================

/**
 * Supported serialization formats.
 */
export type SerializationFormat = 'json' | 'yaml'

/**
 * Options for serializing artifacts to JSON or YAML.
 */
export interface SerializationOptions {
  /** Number of spaces for JSON indentation (default: 2) */
  indent?: number
  /** YAML indentation (default: 2) */
  yamlIndent?: number
  /** Sort object keys alphabetically */
  sortKeys?: boolean
  /** Include $schema reference for IDE validation (default: true) */
  includeSchema?: boolean
}

// ============================================================================
// ARTIFACT INSTANCE INTERFACE
// ============================================================================

/**
 * Base interface for all artifact instances.
 * Defines the common API that all artifact wrapper classes implement.
 *
 * @typeParam T - The artifact type (Form, Document, Bundle, Checklist)
 */
export interface IArtifactInstance<T extends Artifact> {
  /** The raw artifact data. Use this for serialization or direct access. */
  readonly schema: T

  /** Artifact kind discriminator ('form', 'document', 'bundle', 'checklist'). */
  readonly kind: T['kind']

  /** Unique identifier/slug. */
  readonly name: string

  /** Semantic version string. */
  readonly version: string | undefined

  /** Human-friendly title. */
  readonly title: string | undefined

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

// ============================================================================
// FORM RENDERING OPTIONS
// ============================================================================

/**
 * Options for rendering a form to a specific output format.
 *
 * @typeParam Output - The output type produced by the renderer (e.g., string, Uint8Array)
 *
 * @example
 * ```typescript
 * const output = await form.render({
 *   renderer: textRenderer,
 *   resolver: fileResolver,
 *   data: { name: 'John', age: 30 },
 *   layer: 'markdown'
 * })
 * ```
 */
export interface RenderOptions<Output = unknown> {
  /** The renderer to use (e.g., textRenderer, pdfRenderer, docxRenderer) */
  renderer: OpenFormRenderer<RendererLayer, Output, Record<string, unknown>>

  /** Resolver for auto-loading file-backed layers (only needs read method) */
  resolver?: Resolver

  /** Field values to populate the layer with */
  data?: Record<string, unknown>

  /** Key of the layer to use. If not provided, uses defaultLayer or first available. */
  layer?: string
}

/**
 * Options for rendering a FilledForm (data is already attached).
 *
 * This is the same as RenderOptions but without the `data` property,
 * since FilledForm already contains the validated data.
 *
 * @typeParam Output - The output type produced by the renderer
 *
 * @example
 * ```typescript
 * const filled = form.fill({ name: 'John', age: 30 })
 *
 * // No data needed - it's already in the FilledForm
 * const output = await filled.render({
 *   renderer: textRenderer,
 *   layer: 'html'
 * })
 * ```
 */
export interface FilledFormRenderOptions<Output = unknown> {
  /** The renderer to use (e.g., textRenderer, pdfRenderer, docxRenderer) */
  renderer: OpenFormRenderer<RendererLayer, Output, Record<string, unknown>>

  /** Resolver for auto-loading file-backed layers (only needs read method) */
  resolver?: Resolver

  /** Key of the layer to use. If not provided, uses defaultLayer or first available. */
  layer?: string
}

/**
 * Options for filling a form with data.
 *
 * @example
 * ```typescript
 * const filled = form.fill({
 *   fields: { name: 'John', age: 30 },
 *   annexes: { schedule: { items: [...] } },
 *   parties: { buyer: { type: 'person', name: { firstName: 'John' } } }
 * })
 * ```
 */
export interface FillOptions {
  /** Field values to populate the form with */
  fields?: Record<string, unknown>

  /** Annex data */
  annexes?: Record<string, unknown>

  /** Party data indexed by role ID */
  parties?: Record<string, Party | Party[]>

  /** Witness data */
  witnesses?: Party[]
}

// ============================================================================
// ARTIFACT INPUT TYPES
// ============================================================================

/**
 * Input type for creating a Form instance.
 * The `kind` property is optional and defaults to 'form'.
 *
 * @example
 * ```typescript
 * const form = open.form({
 *   name: 'my-form',
 *   version: '1.0.0',
 *   fields: { name: { type: 'text' } }
 * })
 * ```
 */
export type FormInput = Omit<Form, 'kind'> & { kind?: 'form' }

/**
 * Input type for creating a Document instance.
 * The `kind` property is optional and defaults to 'document'.
 *
 * @example
 * ```typescript
 * const doc = open.document({
 *   name: 'my-document',
 *   version: '1.0.0',
 *   layers: { markdown: { kind: 'inline', mimeType: 'text/markdown', text: '# Hello' } }
 * })
 * ```
 */
export type DocumentInput = Omit<Document, 'kind'> & { kind?: 'document' }

/**
 * Input type for creating a Bundle instance.
 * The `kind` property is optional and defaults to 'bundle'.
 *
 * @example
 * ```typescript
 * const bundle = open.bundle({
 *   name: 'my-bundle',
 *   version: '1.0.0',
 *   contents: [{ ref: './form.yaml' }]
 * })
 * ```
 */
export type BundleInput = Omit<Bundle, 'kind'> & { kind?: 'bundle' }

/**
 * Input type for creating a Checklist instance.
 * The `kind` property is optional and defaults to 'checklist'.
 *
 * @example
 * ```typescript
 * const checklist = open.checklist({
 *   name: 'my-checklist',
 *   version: '1.0.0',
 *   items: [{ id: 'item-1', label: 'First item' }]
 * })
 * ```
 */
export type ChecklistInput = Omit<Checklist, 'kind'> & { kind?: 'checklist' }
