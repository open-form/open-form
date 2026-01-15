import type { Artifact } from '@open-form/types'
import { parse } from './serialization'
import { form, FormInstance } from './builders/artifacts/form'
import { document, DocumentInstance } from './builders/artifacts/document'
import { bundle, BundleInstance } from './builders/artifacts/bundle'
import { checklist, ChecklistInstance } from './builders/artifacts/checklist'

// ============================================================================
// Type definitions
// ============================================================================

/**
 * Union of all artifact instance types
 */
export type AnyArtifactInstance =
  | FormInstance<Artifact & { kind: 'form' }>
  | DocumentInstance<Artifact & { kind: 'document' }>
  | BundleInstance<Artifact & { kind: 'bundle' }>
  | ChecklistInstance<Artifact & { kind: 'checklist' }>

/**
 * Error thrown when loading an artifact fails
 */
export class LoadError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message)
    this.name = 'LoadError'
  }
}

// ============================================================================
// Load Functions
// ============================================================================

/**
 * Load an artifact from a string (YAML or JSON).
 * Auto-detects the format and parses the content, returning the appropriate
 * artifact instance based on the `kind` field.
 *
 * @param content - YAML or JSON string containing the artifact definition
 * @returns An artifact instance (FormInstance, DocumentInstance, etc.)
 * @throws LoadError if parsing fails or the artifact kind is unknown
 *
 * @example
 * ```typescript
 * import { load } from '@open-form/core'
 *
 * const yaml = `
 * kind: form
 * name: my-form
 * version: 1.0.0
 * title: My Form
 * `
 *
 * const artifact = load(yaml)
 *
 * if (artifact.kind === 'form') {
 *   // TypeScript knows artifact is FormInstance
 *   console.log(artifact.fields)
 * }
 * ```
 */
export function load(content: string): AnyArtifactInstance {
  let parsed: unknown

  try {
    parsed = parse(content)
  } catch (err) {
    throw new LoadError(
      'Failed to parse content as YAML or JSON',
      err instanceof Error ? err : new Error(String(err))
    )
  }

  return loadFromObject(parsed)
}

/**
 * Load an artifact from a parsed object.
 * Returns the appropriate artifact instance based on the `kind` field.
 *
 * @param obj - A parsed object containing the artifact definition
 * @returns An artifact instance (FormInstance, DocumentInstance, etc.)
 * @throws LoadError if the object is invalid or the artifact kind is unknown
 *
 * @example
 * ```typescript
 * import { loadFromObject } from '@open-form/core'
 *
 * const obj = {
 *   kind: 'form',
 *   name: 'my-form',
 *   version: '1.0.0',
 *   title: 'My Form',
 * }
 *
 * const artifact = loadFromObject(obj)
 * ```
 */
export function loadFromObject(obj: unknown): AnyArtifactInstance {
  if (!obj || typeof obj !== 'object') {
    throw new LoadError('Invalid artifact: expected an object')
  }

  if (!('kind' in obj) || typeof obj.kind !== 'string') {
    throw new LoadError('Invalid artifact: missing or invalid "kind" field')
  }

  const kind = obj.kind

  try {
    switch (kind) {
      case 'form':
        return form.from(obj) as FormInstance<Artifact & { kind: 'form' }>

      case 'document':
        return document.from(obj) as DocumentInstance<Artifact & { kind: 'document' }>

      case 'bundle':
        return bundle.from(obj) as BundleInstance<Artifact & { kind: 'bundle' }>

      case 'checklist':
        return checklist.from(obj) as ChecklistInstance<Artifact & { kind: 'checklist' }>

      default:
        throw new LoadError(`Unknown artifact kind: "${kind}"`)
    }
  } catch (err) {
    if (err instanceof LoadError) {
      throw err
    }
    throw new LoadError(
      `Failed to load ${kind} artifact: ${err instanceof Error ? err.message : String(err)}`,
      err instanceof Error ? err : undefined
    )
  }
}

/**
 * Safely load an artifact from a string (YAML or JSON).
 * Returns a result object instead of throwing.
 *
 * @param content - YAML or JSON string containing the artifact definition
 * @returns A result object with success status and either the artifact or error
 *
 * @example
 * ```typescript
 * import { safeLoad } from '@open-form/core'
 *
 * const result = safeLoad(yamlString)
 *
 * if (result.success) {
 *   console.log(result.data.kind)  // e.g., 'form'
 *   console.log(result.data.name)
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
export function safeLoad(
  content: string
): { success: true; data: AnyArtifactInstance } | { success: false; error: LoadError } {
  try {
    const artifact = load(content)
    return { success: true, data: artifact }
  } catch (err) {
    const error = err instanceof LoadError ? err : new LoadError(String(err), err instanceof Error ? err : undefined)
    return { success: false, error }
  }
}

/**
 * Safely load an artifact from a parsed object.
 * Returns a result object instead of throwing.
 *
 * @param obj - A parsed object containing the artifact definition
 * @returns A result object with success status and either the artifact or error
 *
 * @example
 * ```typescript
 * import { safeLoadFromObject } from '@open-form/core'
 *
 * const result = safeLoadFromObject(parsedYaml)
 *
 * if (result.success) {
 *   console.log(result.data.kind)
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
export function safeLoadFromObject(
  obj: unknown
): { success: true; data: AnyArtifactInstance } | { success: false; error: LoadError } {
  try {
    const artifact = loadFromObject(obj)
    return { success: true, data: artifact }
  } catch (err) {
    const error = err instanceof LoadError ? err : new LoadError(String(err), err instanceof Error ? err : undefined)
    return { success: false, error }
  }
}
