/**
 * Builds type environments from artifact definitions.
 *
 * Type environments are built in two passes:
 * 1. Register field types from field definitions
 * 2. Infer logic key types in topological order (dependencies first)
 *
 * This ensures that when a logic key references another logic key,
 * the referenced key's type is already known.
 */

import type { Form, Bundle, Field, FieldsetField } from '@open-form/types'
import type { TypeEnvironment } from './type-environment'
import { createTypeEnvironment } from './type-environment'
import { getFieldValueType } from './field-type-map'
import { inferExpressionType } from './type-inferrer'
import { parseExpression } from '../validation/expression-parser'
import { isInlineBundleArtifact, isFormArtifact, isBundleArtifact } from '../validation/shared'

/**
 * Result of topological sorting logic keys.
 */
export interface TopologicalSortResult {
  /** Keys in dependency order */
  sorted: string[]
  /** Keys involved in circular dependencies (if any) */
  cyclicKeys: string[]
}

/**
 * Topologically sorts logic keys based on their dependencies.
 *
 * Ensures that if key A references key B, B comes before A in the result.
 * Detects and reports circular dependencies.
 *
 * @param logic - The logic section with key-to-expression mappings
 * @returns Object containing sorted keys and any cyclic keys
 */
export function topologicalSortLogicKeys(logic: Record<string, string>): TopologicalSortResult {
  const keys = Object.keys(logic)
  const keySet = new Set(keys)
  const visited = new Set<string>()
  const sorted: string[] = []
  const cyclicKeys: string[] = []

  // Build dependency graph
  const dependencies = new Map<string, string[]>()
  for (const key of keys) {
    const expr = logic[key]
    if (expr) {
      const parseResult = parseExpression(expr)
      if (parseResult.success) {
        // Find which logic keys this expression references
        const deps = parseResult.variables.filter((v) => keySet.has(v))
        dependencies.set(key, deps)
      } else {
        dependencies.set(key, [])
      }
    }
  }

  // Kahn's algorithm for topological sort
  const inDegree = new Map<string, number>()
  for (const key of keys) {
    inDegree.set(key, 0)
  }

  for (const [, deps] of dependencies) {
    for (const dep of deps) {
      inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
    }
  }

  // Start with keys that have no dependencies on other logic keys
  const queue: string[] = []
  for (const key of keys) {
    if ((dependencies.get(key)?.length ?? 0) === 0) {
      queue.push(key)
    }
  }

  while (queue.length > 0) {
    const key = queue.shift()!
    if (visited.has(key)) continue
    visited.add(key)
    sorted.push(key)

    // Find keys that depend on this one
    for (const [otherKey, deps] of dependencies) {
      if (deps.includes(key) && !visited.has(otherKey)) {
        const remaining = deps.filter((d) => !visited.has(d))
        if (remaining.length === 0) {
          queue.push(otherKey)
        }
      }
    }
  }

  // Handle any remaining keys (cycles or complex dependencies)
  for (const key of keys) {
    if (!visited.has(key)) {
      cyclicKeys.push(key)
      sorted.push(key)
    }
  }

  return { sorted, cyclicKeys }
}

/**
 * Registers field types in the environment.
 *
 * @param fields - Field definitions
 * @param prefix - Path prefix (e.g., 'fields' or 'fields.address')
 * @param env - Type environment to update
 */
function registerFieldTypes(
  fields: Record<string, Field> | undefined,
  prefix: string,
  env: TypeEnvironment
): void {
  if (!fields) return

  for (const [fieldId, field] of Object.entries(fields)) {
    const basePath = `${prefix}.${fieldId}`
    const valuePath = `${basePath}.value`

    // Register the field's value type
    env.variables.set(valuePath, {
      type: getFieldValueType(field.type),
      confidence: 'certain',
    })

    // Recurse into fieldsets
    if (field.type === 'fieldset') {
      const fieldset = field as FieldsetField
      if (fieldset.fields) {
        registerFieldTypes(fieldset.fields, basePath, env)
      }
    }
  }
}

/**
 * Builds a type environment from a Form artifact.
 *
 * @param form - The Form artifact
 * @returns TypeEnvironment with field and logic key types
 *
 * @example
 * ```typescript
 * const form: Form = {
 *   kind: 'form',
 *   name: 'test',
 *   version: '1.0',
 *   title: 'Test',
 *   logic: {
 *     isAdult: 'fields.age.value >= 18',
 *     ageCalc: 'fields.age.value + 10'
 *   },
 *   fields: {
 *     age: { type: 'number' }
 *   }
 * }
 *
 * const env = buildFormTypeEnvironment(form)
 * // env.variables.get('fields.age.value') -> { type: 'number', confidence: 'certain' }
 * // env.variables.get('isAdult') -> { type: 'boolean', confidence: 'certain' }
 * // env.variables.get('ageCalc') -> { type: 'number', confidence: 'certain' }
 * ```
 */
export function buildFormTypeEnvironment(form: Form): TypeEnvironment {
  const env = createTypeEnvironment()

  // Pass 1: Register field types
  if (form.fields) {
    registerFieldTypes(form.fields, 'fields', env)
  }

  // Pass 2: Infer logic expression types in dependency order
  if (form.logic) {
    const { sorted: sortedKeys } = topologicalSortLogicKeys(form.logic)

    for (const key of sortedKeys) {
      const expr = form.logic[key]
      if (expr) {
        const inferredType = inferExpressionType(expr, env)
        env.variables.set(key, inferredType)
      }
    }
  }

  return env
}

/**
 * Registers types from a bundle's inline contents.
 *
 * @param bundle - The Bundle artifact
 * @param env - Type environment to update
 * @param prefix - Optional prefix for nested bundles
 */
function registerBundleContentTypes(
  bundle: Bundle,
  env: TypeEnvironment,
  prefix = ''
): void {
  for (const item of bundle.contents) {
    if (isInlineBundleArtifact(item)) {
      if (isFormArtifact(item.artifact)) {
        const form = item.artifact
        const formKey = item.key
        const formPrefix = prefix ? `${prefix}.forms.${formKey}` : `forms.${formKey}`

        // Register fields with forms.<key>.fields prefix
        if (form.fields) {
          registerFieldTypes(form.fields, `${formPrefix}.fields`, env)
        }

        // Register form's logic keys with forms.<key>. prefix
        if (form.logic) {
          const formEnv = buildFormTypeEnvironment(form)
          for (const [logicKey, logicType] of formEnv.variables) {
            // Only add logic keys (not field paths)
            if (!logicKey.startsWith('fields.')) {
              env.variables.set(`${formPrefix}.${logicKey}`, logicType)
            }
          }
        }
      } else if (isBundleArtifact(item.artifact)) {
        const nestedBundle = item.artifact
        const bundleKey = item.key
        const bundlePrefix = prefix ? `${prefix}.bundles.${bundleKey}` : `bundles.${bundleKey}`

        // Recursively register nested bundle content types
        registerBundleContentTypes(nestedBundle, env, bundlePrefix)

        // Register nested bundle's logic keys
        if (nestedBundle.logic) {
          const { sorted: sortedKeys } = topologicalSortLogicKeys(nestedBundle.logic)
          for (const key of sortedKeys) {
            const expr = nestedBundle.logic[key]
            if (expr) {
              const inferredType = inferExpressionType(expr, env)
              env.variables.set(`${bundlePrefix}.${key}`, inferredType)
            }
          }
        }
      }
    }
  }
}

/**
 * Builds a type environment from a Bundle artifact.
 *
 * For inline forms, their fields are registered with the path:
 * `forms.<key>.fields.<fieldId>.value`
 *
 * For nested bundles, paths are prefixed with:
 * `bundles.<key>.forms.<formKey>.fields.<fieldId>.value`
 *
 * @param bundle - The Bundle artifact
 * @returns TypeEnvironment with form field and logic key types
 */
export function buildBundleTypeEnvironment(bundle: Bundle): TypeEnvironment {
  const env = createTypeEnvironment()

  // Register inline content types
  registerBundleContentTypes(bundle, env)

  // Infer bundle-level logic types
  if (bundle.logic) {
    const { sorted: sortedKeys } = topologicalSortLogicKeys(bundle.logic)

    for (const key of sortedKeys) {
      const expr = bundle.logic[key]
      if (expr) {
        const inferredType = inferExpressionType(expr, env)
        env.variables.set(key, inferredType)
      }
    }
  }

  return env
}
