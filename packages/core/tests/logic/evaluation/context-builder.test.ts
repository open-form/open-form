import { describe, test, expect } from 'vitest'
import {
  buildFormContext,
  getLogicValues,
  getFieldValueFromContext,
} from '@/logic/evaluation/context-builder'
import type { Form } from '@open-form/types'

/**
 * Tests for context-builder.ts
 */
describe('context-builder', () => {
  // ============================================================================
  // Test Form Fixtures
  // ============================================================================

  const createSimpleForm = (): Form => ({
    kind: 'form',
    name: 'simple-form',
    version: '1.0.0',
    title: 'Simple Form',
    fields: {
      age: { type: 'number' },
      name: { type: 'text' },
      agreed: { type: 'boolean' },
    },
  })

  const createFormWithLogic = (): Form => ({
    kind: 'form',
    name: 'form-with-logic',
    version: '1.0.0',
    title: 'Form with Logic',
    fields: {
      age: { type: 'number' },
      hasLicense: { type: 'boolean' },
    },
    logic: {
      isAdult: 'fields.age.value >= 18',
      canDrive: 'isAdult and fields.hasLicense.value',
    },
  })

  const createFormWithFieldset = (): Form => ({
    kind: 'form',
    name: 'form-with-fieldset',
    version: '1.0.0',
    title: 'Form with Fieldset',
    fields: {
      person: {
        type: 'fieldset',
        fields: {
          name: { type: 'text' },
          age: { type: 'number' },
        },
      },
      address: {
        type: 'fieldset',
        fields: {
          street: { type: 'text' },
          city: { type: 'text' },
        },
      },
    },
  })

  // ============================================================================
  // buildFormContext Tests
  // ============================================================================

  describe('buildFormContext', () => {
    describe('simple fields', () => {
      test('builds context with simple field values', () => {
        const form = createSimpleForm()
        const data = { fields: { age: 25, name: 'John', agreed: true } }

        const context = buildFormContext(form, data)

        expect(context.fields).toBeDefined()
        expect((context.fields.age as { value: unknown }).value).toBe(25)
        expect((context.fields.name as { value: unknown }).value).toBe('John')
        expect((context.fields.agreed as { value: unknown }).value).toBe(true)
      })

      test('handles missing field values', () => {
        const form = createSimpleForm()
        const data = { fields: { age: 25 } } // name and agreed missing

        const context = buildFormContext(form, data)

        expect((context.fields.age as { value: unknown }).value).toBe(25)
        expect((context.fields.name as { value: unknown }).value).toBe(undefined)
        expect((context.fields.agreed as { value: unknown }).value).toBe(undefined)
      })

      test('handles empty data', () => {
        const form = createSimpleForm()
        const data = { fields: {} }

        const context = buildFormContext(form, data)

        expect(context.fields).toBeDefined()
      })
    })

    describe('nested fieldsets', () => {
      test('builds context with nested fieldset data (object format)', () => {
        const form = createFormWithFieldset()
        const data = {
          fields: {
            person: { name: 'Jane', age: 30 },
            address: { street: '123 Main St', city: 'NYC' },
          },
        }

        const context = buildFormContext(form, data)

        expect(context.fields.person).toBeDefined()
        const person = context.fields.person as Record<string, { value: unknown }>
        expect(person['name']?.value).toBe('Jane')
        expect(person['age']?.value).toBe(30)

        const address = context.fields.address as Record<string, { value: unknown }>
        expect(address['street']?.value).toBe('123 Main St')
        expect(address['city']?.value).toBe('NYC')
      })

      test('handles partial nested data', () => {
        const form = createFormWithFieldset()
        const data = {
          fields: {
            person: { name: 'Jane' }, // age missing
          },
        }

        const context = buildFormContext(form, data)

        const person = context.fields.person as Record<string, { value: unknown }>
        expect(person['name']?.value).toBe('Jane')
        expect(person['age']?.value).toBe(undefined)
      })
    })

    describe('logic key evaluation', () => {
      test('evaluates simple logic key', () => {
        const form = createFormWithLogic()
        const data = { fields: { age: 25, hasLicense: true } }

        const context = buildFormContext(form, data)

        expect((context as Record<string, unknown>).isAdult).toBe(true)
      })

      test('evaluates dependent logic keys in order', () => {
        const form = createFormWithLogic()
        const data = { fields: { age: 25, hasLicense: true } }

        const context = buildFormContext(form, data)

        // canDrive depends on isAdult
        expect((context as Record<string, unknown>).isAdult).toBe(true)
        expect((context as Record<string, unknown>).canDrive).toBe(true)
      })

      test('evaluates logic key to false', () => {
        const form = createFormWithLogic()
        const data = { fields: { age: 16, hasLicense: false } }

        const context = buildFormContext(form, data)

        expect((context as Record<string, unknown>).isAdult).toBe(false)
        expect((context as Record<string, unknown>).canDrive).toBe(false)
      })

      test('handles missing data in logic evaluation', () => {
        const form = createFormWithLogic()
        const data = { fields: {} } // All values missing

        const context = buildFormContext(form, data)

        // undefined >= 18 is false
        expect((context as Record<string, unknown>).isAdult).toBe(false)
      })
    })

    describe('edge cases', () => {
      test('handles form with no fields', () => {
        const form: Form = {
          kind: 'form',
          name: 'empty',
          version: '1.0.0',
          title: 'Empty',
        }
        const data = { fields: {} }

        const context = buildFormContext(form, data)

        expect(context.fields).toBeDefined()
      })

      test('handles form with no logic', () => {
        const form = createSimpleForm()
        const data = { fields: { age: 25 } }

        const context = buildFormContext(form, data)

        expect(context.fields).toBeDefined()
        expect(context.parties).toBeDefined()
        expect(context.witnesses).toBeDefined()
        // No logic keys should be present (only fields, parties, witnesses are base context)
        const baseKeys = ['fields', 'parties', 'witnesses']
        expect(Object.keys(context).filter((k) => !baseKeys.includes(k))).toHaveLength(0)
      })
    })
  })

  // ============================================================================
  // getLogicValues Tests
  // ============================================================================

  describe('getLogicValues', () => {
    test('returns map of evaluated logic values', () => {
      const form = createFormWithLogic()
      const data = { fields: { age: 25, hasLicense: true } }

      const logicValues = getLogicValues(form, data)

      expect(logicValues.get('isAdult')).toBe(true)
      expect(logicValues.get('canDrive')).toBe(true)
    })

    test('returns empty map for form without logic', () => {
      const form = createSimpleForm()
      const data = { fields: { age: 25 } }

      const logicValues = getLogicValues(form, data)

      expect(logicValues.size).toBe(0)
    })

    test('handles undefined values', () => {
      const form = createFormWithLogic()
      const data = { fields: {} }

      const logicValues = getLogicValues(form, data)

      expect(logicValues.get('isAdult')).toBe(false)
      expect(logicValues.get('canDrive')).toBe(false)
    })
  })

  // ============================================================================
  // getFieldValueFromContext Tests
  // ============================================================================

  describe('getFieldValueFromContext', () => {
    test('gets simple field value', () => {
      const fields = {
        age: { value: 25 },
        name: { value: 'John' },
      }

      expect(getFieldValueFromContext(fields, 'age')).toBe(25)
      expect(getFieldValueFromContext(fields, 'name')).toBe('John')
    })

    test('gets nested field value', () => {
      const fields = {
        address: {
          street: { value: '123 Main St' },
          city: { value: 'NYC' },
        },
      }

      expect(getFieldValueFromContext(fields, 'address.street')).toBe('123 Main St')
      expect(getFieldValueFromContext(fields, 'address.city')).toBe('NYC')
    })

    test('returns undefined for missing path', () => {
      const fields = {
        age: { value: 25 },
      }

      expect(getFieldValueFromContext(fields, 'missing')).toBe(undefined)
      expect(getFieldValueFromContext(fields, 'deep.missing.path')).toBe(undefined)
    })

    test('returns undefined for null in path', () => {
      const fields = {
        data: null as unknown as { value: unknown },
      }

      expect(getFieldValueFromContext(fields, 'data.value')).toBe(undefined)
    })
  })
})
