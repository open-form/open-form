import type { StandardSchemaV1 } from '@standard-schema/spec'
import type {
  Bundle,
  BundleContentItem,
  CondExpr,
  LogicExpression,
  LogicSection,
  ScalarLogicType,
} from '@open-form/types'
import { parseExpression } from './expression-parser'
import { collectFieldPaths } from './field-paths'
import { validateFormLogic, type LogicValidationOptions, type LogicValidationIssue } from './validate-form-logic'
import { buildBundleTypeEnvironment, validateBooleanType, topologicalSortLogicKeys } from '../type-checking'
import { validateExpression, isInlineBundleArtifact, isFormArtifact, isBundleArtifact } from './shared'

/** Scalar logic expression types (value is a string expression) */
const SCALAR_LOGIC_TYPES: Set<string> = new Set([
  'boolean',
  'string',
  'number',
  'integer',
  'percentage',
  'rating',
  'date',
  'time',
  'datetime',
  'duration',
])

/**
 * Check if a logic expression type is a scalar type.
 */
function isScalarLogicType(type: string): type is ScalarLogicType {
  return SCALAR_LOGIC_TYPES.has(type)
}

/**
 * Validates a single LogicExpression (scalar or object type).
 *
 * For scalar types, validates the value expression string.
 * For object types, validates each property expression string.
 */
function validateLogicExpression(
  expr: LogicExpression,
  key: string,
  validVariables: Set<string>,
  issues: LogicValidationIssue[],
  collectAllErrors: boolean
): boolean {
  if (isScalarLogicType(expr.type)) {
    // Scalar type: value is a single expression string
    return validateExpression(
      expr.value as string,
      ['logic', key, 'value'],
      validVariables,
      issues,
      collectAllErrors
    )
  }

  // Object type: value is an object with expression strings for each property
  const valueObj = expr.value as unknown as Record<string, string | undefined>

  for (const [propKey, propExpr] of Object.entries(valueObj)) {
    if (propExpr !== undefined) {
      if (
        !validateExpression(
          propExpr,
          ['logic', key, 'value', propKey],
          validVariables,
          issues,
          collectAllErrors
        )
      ) {
        return false
      }
    }
  }

  return true
}

/**
 * Extracts expression strings from a LogicSection for dependency sorting.
 */
function extractExpressionsForSorting(logic: LogicSection): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, expr] of Object.entries(logic)) {
    if (isScalarLogicType(expr.type)) {
      result[key] = expr.value as string
    } else {
      const valueObj = expr.value as unknown as Record<string, string | undefined>
      const allExprs = Object.values(valueObj).filter((v): v is string => v !== undefined)
      result[key] = allExprs.join(' ')
    }
  }

  return result
}

/**
 * Gets the expression string for a logic key (for error reporting).
 */
function getExpressionForKey(expr: LogicExpression): string {
  if (isScalarLogicType(expr.type)) {
    return expr.value as string
  }
  const valueObj = expr.value as unknown as Record<string, string | undefined>
  const firstExpr = Object.values(valueObj).find((v) => v !== undefined)
  return firstExpr ?? '[object expression]'
}

/**
 * Collects valid variable paths from a bundle's inline Forms.
 * Format: forms.<key>.fields.<fieldId>.value
 */
function collectBundleFieldPaths(
  bundle: Bundle,
  validVariables: Set<string>,
  prefix = ''
): void {
  for (const item of bundle.contents) {
    if (isInlineBundleArtifact(item)) {
      if (isFormArtifact(item.artifact)) {
        const form = item.artifact
        const formPrefix = prefix ? `${prefix}.forms.${item.key}` : `forms.${item.key}`
        const formPaths = collectFieldPaths(form.fields, `${formPrefix}.fields`)
        formPaths.forEach((p) => validVariables.add(p))

        // Also add the form's logic keys
        if (form.logic) {
          Object.keys(form.logic).forEach((logicKey) => {
            validVariables.add(`${formPrefix}.${logicKey}`)
          })
        }
      } else if (isBundleArtifact(item.artifact)) {
        // Recursively collect from nested bundles
        const bundlePrefix = prefix ? `${prefix}.bundles.${item.key}` : `bundles.${item.key}`
        collectBundleFieldPaths(item.artifact, validVariables, bundlePrefix)

        // Add nested bundle's logic keys
        if (item.artifact.logic) {
          Object.keys(item.artifact.logic).forEach((logicKey) => {
            validVariables.add(`${bundlePrefix}.${logicKey}`)
          })
        }
      }
    }
  }
}

/**
 * Validates all logic expressions in a Bundle artifact.
 *
 * Checks:
 * 1. Expression syntax using expr-eval-fork parser
 * 2. Variable references exist for inline artifacts only
 * 3. Recursively validates inline form and bundle artifacts
 *
 * For slug/path references, only syntax is validated (variable references cannot be checked
 * because the artifact definition is not available).
 *
 * @param bundle - The Bundle artifact to validate
 * @param options - Validation options
 * @returns Standard Schema result: { value } on success, { issues } on failure
 *
 * @example
 * ```typescript
 * const bundle: Bundle = {
 *   kind: 'bundle',
 *   name: 'test',
 *   version: '1.0',
 *   title: 'Test',
 *   logic: {
 *     needsForm: {
 *       type: 'boolean',
 *       value: 'forms.main.fields.required.value == true'
 *     }
 *   },
 *   contents: [
 *     { type: 'inline', key: 'main', artifact: { kind: 'form', ... } },
 *     { type: 'registry', key: 'optional', slug: '@org/optional', include: 'needsForm' }
 *   ]
 * }
 *
 * validateBundleLogic(bundle)
 * ```
 */
export function validateBundleLogic(
  bundle: Bundle,
  options: LogicValidationOptions = {}
): StandardSchemaV1.Result<Bundle> {
  const { collectAllErrors = true } = options
  const issues: LogicValidationIssue[] = []

  // Build valid variable set
  const validVariables = new Set<string>()

  // Add logic keys as valid variables
  if (bundle.logic) {
    Object.keys(bundle.logic).forEach((key) => validVariables.add(key))
  }

  // Collect field paths from inline Form artifacts
  collectBundleFieldPaths(bundle, validVariables)

  // Validate logic section expressions
  if (bundle.logic) {
    for (const [key, expr] of Object.entries(bundle.logic)) {
      if (!validateLogicExpression(expr, key, validVariables, issues, collectAllErrors)) {
        if (!collectAllErrors) {
          return { issues }
        }
      }
    }

    // Extract expressions for dependency sorting
    const expressionsForSorting = extractExpressionsForSorting(bundle.logic)

    // Check for circular dependencies in logic keys
    const { cyclicKeys } = topologicalSortLogicKeys(expressionsForSorting)
    for (const key of cyclicKeys) {
      const logicExpr = bundle.logic[key]
      issues.push({
        message: `Circular dependency detected: logic key "${key}" is involved in a dependency cycle`,
        path: ['logic', key],
        expression: logicExpr ? getExpressionForKey(logicExpr) : key,
        severity: 'warning',
      })
      if (!collectAllErrors) {
        return { issues }
      }
    }
  }

  // Validate include conditions on content items
  for (let i = 0; i < bundle.contents.length; i++) {
    const item = bundle.contents[i]
    if (!item) continue
    const itemPath = ['contents', i]

    // Get include expression based on content item type
    const include = getIncludeExpression(item)

    // Validate include expression syntax (always)
    if (typeof include === 'string') {
      const parseResult = parseExpression(include)
      if (!parseResult.success) {
        issues.push({
          message: `Syntax error: ${parseResult.error}`,
          path: [...itemPath, 'include'],
          expression: include,
        })
        if (!collectAllErrors) {
          return { issues }
        }
      } else {
        // For inline artifacts, validate variable references
        // For slug/path, skip variable validation (artifact not available)
        if (isInlineBundleArtifact(item)) {
          for (const variable of parseResult.variables) {
            if (!validVariables.has(variable)) {
              issues.push({
                message: `Unknown variable: "${variable}"`,
                path: [...itemPath, 'include'],
                expression: include,
                variable,
              })
              if (!collectAllErrors) {
                return { issues }
              }
            }
          }
        }
        // For slug/path references - skip variable validation silently
      }
    }

    // Recursively validate inline Form artifacts
    if (isInlineBundleArtifact(item)) {
      if (isFormArtifact(item.artifact)) {
        const formResult = validateFormLogic(item.artifact, options)
        if (formResult.issues) {
          // Prefix the path with contents[i].artifact
          for (const issue of formResult.issues) {
            const logicIssue = issue as LogicValidationIssue
            issues.push({
              ...logicIssue,
              path: [...itemPath, 'artifact', ...logicIssue.path],
            })
          }
          if (!collectAllErrors) {
            return { issues }
          }
        }
      } else if (isBundleArtifact(item.artifact)) {
        // Recursively validate nested bundles
        const bundleResult = validateBundleLogic(item.artifact, options)
        if (bundleResult.issues) {
          for (const issue of bundleResult.issues) {
            const logicIssue = issue as LogicValidationIssue
            issues.push({
              ...logicIssue,
              path: [...itemPath, 'artifact', ...logicIssue.path],
            })
          }
          if (!collectAllErrors) {
            return { issues }
          }
        }
      }
    }
  }

  // Phase 2: Type checking for include expressions
  // Only proceed if syntax and variable validation passed (or collecting all errors)
  if (collectAllErrors || issues.length === 0) {
    const typeEnv = buildBundleTypeEnvironment(bundle)

    // Type-check include expressions on content items
    for (let i = 0; i < bundle.contents.length; i++) {
      const item = bundle.contents[i]
      if (!item) continue

      const include = getIncludeExpression(item)
      if (typeof include !== 'string') continue

      const result = validateBooleanType(include, typeEnv)
      if (!result.valid) {
        issues.push({
          message: result.message ?? 'Type validation failed',
          path: ['contents', i, 'include'],
          expression: include,
          severity: result.severity,
          expectedType: result.expectedType,
          actualType: result.actualType,
        })
        if (!collectAllErrors) {
          return { issues }
        }
      }
    }
  }

  return issues.length > 0 ? { issues } : { value: bundle }
}

/**
 * Helper to get include expression from a BundleContentItem.
 * Only path and registry items have include conditions.
 */
function getIncludeExpression(item: BundleContentItem): CondExpr | undefined {
  if (item.type === 'path' || item.type === 'registry') {
    return item.include
  }
  return undefined
}
