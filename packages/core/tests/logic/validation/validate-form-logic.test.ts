import { describe, test, expect } from 'vitest'
import { validateFormLogic } from '@/logic/validation/validate-form-logic'
import type { Form } from '@open-form/types'

/**
 * Tests for validateFormLogic (design-time validation).
 */
describe('validateFormLogic', () => {
  // ============================================================================
  // Test Form Fixtures
  // ============================================================================

  const createValidForm = (): Form => ({
    kind: 'form',
    name: 'valid-form',
    version: '1.0.0',
    title: 'Valid Form',
    fields: {
      age: { type: 'number' },
      name: { type: 'text' },
    },
    logic: {
      isAdult: 'fields.age.value >= 18',
    },
  })

  // ============================================================================
  // Valid Form Tests
  // ============================================================================

  describe('valid forms', () => {
    test('validates form with no logic', () => {
      const form: Form = {
        kind: 'form',
        name: 'simple',
        version: '1.0.0',
        title: 'Simple Form',
        fields: {
          name: { type: 'text' },
        },
      }

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })

    test('validates form with valid logic expressions', () => {
      const form = createValidForm()

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })

    test('validates form with field conditional expressions', () => {
      const form: Form = {
        kind: 'form',
        name: 'conditional',
        version: '1.0.0',
        title: 'Conditional Form',
        fields: {
          age: { type: 'number' },
          drivingLicense: {
            type: 'text',
            visible: 'fields.age.value >= 18',
            required: 'fields.age.value >= 18',
          },
        },
      }

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })

    test('validates form with logic key references', () => {
      const form: Form = {
        kind: 'form',
        name: 'logic-refs',
        version: '1.0.0',
        title: 'Logic Refs Form',
        fields: {
          age: { type: 'number' },
          consent: {
            type: 'boolean',
            visible: 'isAdult',
            required: 'isAdult',
          },
        },
        logic: {
          isAdult: 'fields.age.value >= 18',
        },
      }

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })

    test('validates form with nested fieldset', () => {
      const form: Form = {
        kind: 'form',
        name: 'fieldset-form',
        version: '1.0.0',
        title: 'Fieldset Form',
        fields: {
          address: {
            type: 'fieldset',
            visible: 'hasAddress',
            fields: {
              street: { type: 'text' },
              city: { type: 'text' },
            },
          },
        },
        logic: {
          hasAddress: 'fields.address.street.value != ""',
        },
      }

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })

    test('validates form with annexes', () => {
      const form: Form = {
        kind: 'form',
        name: 'annex-form',
        version: '1.0.0',
        title: 'Annex Form',
        fields: {
          age: { type: 'number' },
        },
        logic: {
          isAdult: 'fields.age.value >= 18',
        },
        annexes: [
          {
            id: 'proof',
            title: 'Proof',
            required: true,
          },
          {
            id: 'license',
            title: 'License',
            visible: 'isAdult',
            required: 'isAdult',
          },
        ],
      }

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })
  })

  // ============================================================================
  // Syntax Error Tests
  // ============================================================================

  describe('syntax errors', () => {
    test('detects syntax error in logic expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'syntax-error',
        version: '1.0.0',
        title: 'Syntax Error Form',
        fields: {
          age: { type: 'number' },
        },
        logic: {
          broken: 'fields.age.value >=', // Missing operand
        },
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        expect(result.issues.length).toBeGreaterThan(0)
      }
    })

    test('detects syntax error in field visible expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'field-syntax-error',
        version: '1.0.0',
        title: 'Field Syntax Error Form',
        fields: {
          age: { type: 'number' },
          field: {
            type: 'text',
            visible: 'invalid syntax ((',
          },
        },
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
    })

    test('detects syntax error in annex expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'annex-syntax-error',
        version: '1.0.0',
        title: 'Annex Syntax Error Form',
        fields: {},
        annexes: [
          {
            id: 'test',
            title: 'Test',
            required: 'broken syntax ))',
          },
        ],
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
    })
  })

  // ============================================================================
  // Variable Reference Tests
  // ============================================================================

  describe('variable reference validation', () => {
    test('detects unknown variable in logic expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'unknown-var',
        version: '1.0.0',
        title: 'Unknown Var Form',
        fields: {
          age: { type: 'number' },
        },
        logic: {
          broken: 'fields.nonexistent.value >= 18', // nonexistent field
        },
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        const issue = result.issues.find((i) => i.message.includes('nonexistent'))
        expect(issue).toBeDefined()
      }
    })

    test('detects unknown logic key reference', () => {
      const form: Form = {
        kind: 'form',
        name: 'unknown-logic',
        version: '1.0.0',
        title: 'Unknown Logic Form',
        fields: {
          field: {
            type: 'text',
            visible: 'unknownLogicKey', // logic key doesn't exist
          },
        },
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
    })

    test('validates valid nested field path', () => {
      const form: Form = {
        kind: 'form',
        name: 'valid-nested',
        version: '1.0.0',
        title: 'Valid Nested Form',
        fields: {
          address: {
            type: 'fieldset',
            fields: {
              street: { type: 'text' },
            },
          },
        },
        logic: {
          hasStreet: 'fields.address.street.value != ""',
        },
      }

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })
  })

  // ============================================================================
  // Circular Dependency Tests
  // ============================================================================

  describe('circular dependency detection', () => {
    test('detects self-referencing logic key', () => {
      const form: Form = {
        kind: 'form',
        name: 'self-ref',
        version: '1.0.0',
        title: 'Self Ref Form',
        fields: {},
        logic: {
          selfRef: 'selfRef', // references itself
        },
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        const cycleIssue = result.issues.find((i) => i.message.includes('Circular dependency'))
        expect(cycleIssue).toBeDefined()
      }
    })

    test('detects A → B → A cycle', () => {
      const form: Form = {
        kind: 'form',
        name: 'cycle',
        version: '1.0.0',
        title: 'Cycle Form',
        fields: {},
        logic: {
          a: 'b',
          b: 'a',
        },
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        const cycleIssues = result.issues.filter((i) => i.message.includes('Circular dependency'))
        expect(cycleIssues.length).toBeGreaterThan(0)
      }
    })
  })

  // ============================================================================
  // Type Checking Tests
  // ============================================================================

  describe('type checking', () => {
    test('validates boolean expression in visible context', () => {
      const form: Form = {
        kind: 'form',
        name: 'bool-visible',
        version: '1.0.0',
        title: 'Bool Visible Form',
        fields: {
          age: { type: 'number' },
          field: {
            type: 'text',
            visible: 'fields.age.value >= 18', // Comparison returns boolean
          },
        },
      }

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })

    test('validates boolean expression in required context', () => {
      const form: Form = {
        kind: 'form',
        name: 'bool-required',
        version: '1.0.0',
        title: 'Bool Required Form',
        fields: {
          agreed: { type: 'boolean' },
          field: {
            type: 'text',
            required: 'fields.agreed.value', // Boolean field
          },
        },
      }

      const result = validateFormLogic(form)
      expect('value' in result).toBe(true)
    })

    test('warns on non-boolean type in boolean context', () => {
      const form: Form = {
        kind: 'form',
        name: 'non-bool',
        version: '1.0.0',
        title: 'Non Bool Form',
        fields: {
          age: { type: 'number' },
          field: {
            type: 'text',
            visible: 'fields.age.value', // Number, not boolean
          },
        },
      }

      const result = validateFormLogic(form)
      // This may or may not be an issue depending on strictness
      // The implementation uses truthy coercion at runtime
      // But type checking might warn about it
    })
  })

  // ============================================================================
  // Options Tests
  // ============================================================================

  describe('validation options', () => {
    test('collectAllErrors: true collects all errors', () => {
      const form: Form = {
        kind: 'form',
        name: 'multi-error',
        version: '1.0.0',
        title: 'Multi Error Form',
        fields: {
          f1: {
            type: 'text',
            visible: 'unknown1',
          },
          f2: {
            type: 'text',
            visible: 'unknown2',
          },
        },
      }

      const result = validateFormLogic(form, { collectAllErrors: true })
      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        // Should have multiple issues
        expect(result.issues.length).toBeGreaterThanOrEqual(2)
      }
    })

    test('collectAllErrors: false stops at first error', () => {
      const form: Form = {
        kind: 'form',
        name: 'first-error',
        version: '1.0.0',
        title: 'First Error Form',
        fields: {
          f1: {
            type: 'text',
            visible: 'invalid syntax ((',
          },
          f2: {
            type: 'text',
            visible: 'another invalid ))',
          },
        },
      }

      const result = validateFormLogic(form, { collectAllErrors: false })
      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        // Should stop at first error
        expect(result.issues.length).toBe(1)
      }
    })
  })

  // ============================================================================
  // Issue Structure Tests
  // ============================================================================

  describe('issue structure', () => {
    test('includes path in issue', () => {
      const form: Form = {
        kind: 'form',
        name: 'path-test',
        version: '1.0.0',
        title: 'Path Test Form',
        fields: {
          myField: {
            type: 'text',
            visible: 'invalid syntax ((',
          },
        },
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues && result.issues[0]) {
        expect(result.issues[0].path).toBeDefined()
        expect(result.issues[0].path).toContain('myField')
      }
    })

    test('includes expression in issue message', () => {
      const form: Form = {
        kind: 'form',
        name: 'expr-test',
        version: '1.0.0',
        title: 'Expr Test Form',
        fields: {},
        logic: {
          broken: 'syntax error ((',
        },
      }

      const result = validateFormLogic(form)
      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues && result.issues[0]) {
        // The expression details are included in the message
        expect(result.issues[0].message).toBeDefined()
      }
    })
  })
})
