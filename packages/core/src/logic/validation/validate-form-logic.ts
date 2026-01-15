import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Form, Field, FieldsetField, Annex, CondExpr } from '@open-form/types'
import type { TypeEnvironment, TypeValidationSeverity, InferredType } from '../types'
import { collectFieldPaths } from './field-paths'
import { buildFormTypeEnvironment, validateBooleanType, topologicalSortLogicKeys } from '../types'
import { validateExpression } from './shared'

/**
 * Options for logic validation
 */
export interface LogicValidationOptions {
  /** Whether to collect all errors or stop at first. Default: true */
  collectAllErrors?: boolean
}

/**
 * A validation issue from logic validation
 */
export interface LogicValidationIssue {
  /** Human-readable error message */
  message: string
  /** JSON path to the expression location */
  path: (string | number)[]
  /** The full expression that failed (optional) */
  expression?: string
  /** Specific variable that was not found (optional) */
  variable?: string
  /** Severity of the issue: 'error' for certain failures, 'warning' for unknown types */
  severity?: TypeValidationSeverity
  /** Expected type (for type validation issues) */
  expectedType?: InferredType
  /** Actual inferred type (for type validation issues) */
  actualType?: InferredType
}

/**
 * Recursively validates expressions in field definitions.
 *
 * @param fields - Record of field definitions
 * @param basePath - Current path for error reporting
 * @param validVariables - Set of valid variable names
 * @param issues - Array to accumulate issues
 * @param collectAllErrors - Whether to collect all errors
 * @returns true if should continue validation
 */
function validateFieldExpressions(
  fields: Record<string, Field> | undefined,
  basePath: (string | number)[],
  validVariables: Set<string>,
  issues: LogicValidationIssue[],
  collectAllErrors: boolean
): boolean {
  if (!fields) return true

  for (const [fieldId, field] of Object.entries(fields)) {
    const fieldPath = [...basePath, fieldId]

    // Validate required expression
    if (
      !validateExpression(
        field.required,
        [...fieldPath, 'required'],
        validVariables,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }

    // Validate visible expression
    if (
      !validateExpression(
        field.visible,
        [...fieldPath, 'visible'],
        validVariables,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }

    // Validate disabled expression
    if (
      !validateExpression(
        field.disabled,
        [...fieldPath, 'disabled'],
        validVariables,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }

    // Recurse into fieldsets
    if (field.type === 'fieldset') {
      const fieldset = field as FieldsetField
      if (
        !validateFieldExpressions(
          fieldset.fields,
          [...fieldPath, 'fields'],
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
 * Validates expressions in annex definitions.
 *
 * @param annexes - Array of annex definitions
 * @param validVariables - Set of valid variable names
 * @param issues - Array to accumulate issues
 * @param collectAllErrors - Whether to collect all errors
 * @returns true if should continue validation
 */
function validateAnnexExpressions(
  annexes: Annex[] | undefined,
  validVariables: Set<string>,
  issues: LogicValidationIssue[],
  collectAllErrors: boolean
): boolean {
  if (!annexes) return true

  for (let i = 0; i < annexes.length; i++) {
    const annex = annexes[i]
    if (!annex) continue
    const annexPath = ['annexes', i]

    // Validate required expression
    if (
      !validateExpression(
        annex.required,
        [...annexPath, 'required'],
        validVariables,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }

    // Validate visible expression
    if (
      !validateExpression(
        annex.visible,
        [...annexPath, 'visible'],
        validVariables,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }
  }

  return true
}

/**
 * Type-checks a single boolean expression.
 *
 * @param expr - The expression to type-check
 * @param path - JSON path for error reporting
 * @param typeEnv - Type environment
 * @param issues - Array to accumulate issues
 * @param collectAllErrors - Whether to collect all errors
 * @returns true if should continue validation
 */
function typeCheckBooleanExpression(
  expr: CondExpr | undefined,
  path: (string | number)[],
  typeEnv: TypeEnvironment,
  issues: LogicValidationIssue[],
  collectAllErrors: boolean
): boolean {
  // Only check string expressions
  if (typeof expr !== 'string') return true

  const result = validateBooleanType(expr, typeEnv)

  if (!result.valid) {
    issues.push({
      message: result.message ?? 'Type validation failed',
      path,
      expression: expr,
      severity: result.severity,
      expectedType: result.expectedType,
      actualType: result.actualType,
    })
    if (!collectAllErrors) return false
  }

  return true
}

/**
 * Type-checks expressions in field definitions.
 */
function typeCheckFieldExpressions(
  fields: Record<string, Field> | undefined,
  basePath: (string | number)[],
  typeEnv: TypeEnvironment,
  issues: LogicValidationIssue[],
  collectAllErrors: boolean
): boolean {
  if (!fields) return true

  for (const [fieldId, field] of Object.entries(fields)) {
    const fieldPath = [...basePath, fieldId]

    // Type-check required expression
    if (
      !typeCheckBooleanExpression(
        field.required,
        [...fieldPath, 'required'],
        typeEnv,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }

    // Type-check visible expression
    if (
      !typeCheckBooleanExpression(
        field.visible,
        [...fieldPath, 'visible'],
        typeEnv,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }

    // Type-check disabled expression
    if (
      !typeCheckBooleanExpression(
        field.disabled,
        [...fieldPath, 'disabled'],
        typeEnv,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }

    // Recurse into fieldsets
    if (field.type === 'fieldset') {
      const fieldset = field as FieldsetField
      if (
        !typeCheckFieldExpressions(
          fieldset.fields,
          [...fieldPath, 'fields'],
          typeEnv,
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
 * Type-checks expressions in annex definitions.
 */
function typeCheckAnnexExpressions(
  annexes: Annex[] | undefined,
  typeEnv: TypeEnvironment,
  issues: LogicValidationIssue[],
  collectAllErrors: boolean
): boolean {
  if (!annexes) return true

  for (let i = 0; i < annexes.length; i++) {
    const annex = annexes[i]
    if (!annex) continue
    const annexPath = ['annexes', i]

    // Type-check required expression
    if (
      !typeCheckBooleanExpression(
        annex.required,
        [...annexPath, 'required'],
        typeEnv,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }

    // Type-check visible expression
    if (
      !typeCheckBooleanExpression(
        annex.visible,
        [...annexPath, 'visible'],
        typeEnv,
        issues,
        collectAllErrors
      )
    ) {
      return false
    }
  }

  return true
}

/**
 * Validates all logic expressions in a Form artifact.
 *
 * Checks:
 * 1. Expression syntax using expr-eval-fork parser
 * 2. Variable references exist (field paths or logic keys)
 * 3. Expressions in boolean contexts return boolean type
 *
 * @param form - The Form artifact to validate
 * @param options - Validation options
 * @returns Standard Schema result: { value } on success, { issues } on failure
 *
 * @example
 * ```typescript
 * const form: Form = {
 *   kind: 'form',
 *   name: 'test',
 *   version: '1.0',
 *   title: 'Test',
 *   logic: {
 *     isAdult: 'fields.age.value >= 18'
 *   },
 *   fields: {
 *     age: { type: 'number' },
 *     consent: { type: 'boolean', visible: 'isAdult' }
 *   }
 * }
 *
 * const result = validateFormLogic(form)
 * // { value: form } - valid
 *
 * const invalid: Form = { ...form, logic: { broken: 'fields.nonexistent.value' } }
 * const result2 = validateFormLogic(invalid)
 * // { issues: [{ message: 'Unknown variable: "fields.nonexistent.value"', ... }] }
 * ```
 */
export function validateFormLogic(
  form: Form,
  options: LogicValidationOptions = {}
): StandardSchemaV1.Result<Form> {
  const { collectAllErrors = true } = options
  const issues: LogicValidationIssue[] = []

  // Build valid variable set
  const validVariables = new Set<string>()

  // Add all field paths (e.g., 'fields.age.value', 'fields.address.street.value')
  collectFieldPaths(form.fields).forEach((p) => validVariables.add(p))

  // Add all logic keys as valid variables
  if (form.logic) {
    Object.keys(form.logic).forEach((key) => validVariables.add(key))
  }

  // Validate logic section expressions
  if (form.logic) {
    for (const [key, expr] of Object.entries(form.logic)) {
      if (
        !validateExpression(expr, ['logic', key], validVariables, issues, collectAllErrors)
      ) {
        break
      }
    }

    // Check for circular dependencies in logic keys
    const { cyclicKeys } = topologicalSortLogicKeys(form.logic)
    for (const key of cyclicKeys) {
      issues.push({
        message: `Circular dependency detected: logic key "${key}" is involved in a dependency cycle`,
        path: ['logic', key],
        expression: form.logic[key],
        severity: 'warning',
      })
      if (!collectAllErrors) break
    }
  }

  // Validate field expressions (recursive for fieldsets)
  if (collectAllErrors || issues.length === 0) {
    validateFieldExpressions(form.fields, ['fields'], validVariables, issues, collectAllErrors)
  }

  // Validate annex expressions
  if (collectAllErrors || issues.length === 0) {
    validateAnnexExpressions(form.annexes, validVariables, issues, collectAllErrors)
  }

  // Phase 2: Type checking
  // Only proceed if syntax and variable validation passed (or collecting all errors)
  if (collectAllErrors || issues.length === 0) {
    // Build type environment for type inference
    const typeEnv = buildFormTypeEnvironment(form)

    // Type-check field expressions
    if (collectAllErrors || issues.length === 0) {
      typeCheckFieldExpressions(form.fields, ['fields'], typeEnv, issues, collectAllErrors)
    }

    // Type-check annex expressions
    if (collectAllErrors || issues.length === 0) {
      typeCheckAnnexExpressions(form.annexes, typeEnv, issues, collectAllErrors)
    }
  }

  // Return result
  return issues.length > 0 ? { issues } : { value: form }
}
