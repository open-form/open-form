import { describe, test, expect } from 'vitest'
import { evaluateFormLogic } from '@/logic/runtime/evaluation/form-evaluator'
import { buildFormContext } from '@/logic/runtime/evaluation/context-builder'
import type { Form, LogicSection } from '@open-form/types'
import { getLogicValues } from '../helpers/evaluation-helpers'

/**
 * Tests for LogicExpression evaluation with typed computed values.
 *
 * These tests verify:
 * - Scalar logic expressions (boolean, string, number, etc.)
 * - Object logic expressions (money, address, phone, etc.)
 * - Metadata (label, description) on expressions
 * - Cross-references between logic keys
 */
describe('LogicExpression evaluation', () => {
  // ============================================================================
  // Scalar Expression Tests
  // ============================================================================

  describe('scalar expressions', () => {
    test('evaluates boolean expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          age: { type: 'number' },
        },
        logic: {
          isAdult: {
            type: 'boolean',
            label: 'Adult Status',
            description: 'Whether the person is 18 or older',
            value: 'fields.age.value >= 18',
          },
        },
      }

      const result = evaluateFormLogic(form, { fields: { age: 25 } })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        expect(result.value.logicValues.get('isAdult')).toBe(true)
      }
    })

    test('evaluates string expression with concat', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          firstName: { type: 'text' },
          lastName: { type: 'text' },
        },
        logic: {
          fullName: {
            type: 'string',
            label: 'Full Name',
            value: 'fields.firstName.value || " " || fields.lastName.value',
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: { firstName: 'John', lastName: 'Doe' },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        expect(result.value.logicValues.get('fullName')).toBe('John Doe')
      }
    })

    test('evaluates number expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          quantity: { type: 'number' },
          price: { type: 'number' },
        },
        logic: {
          subtotal: {
            type: 'number',
            label: 'Subtotal',
            description: 'Quantity times price',
            value: 'fields.quantity.value * fields.price.value',
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: { quantity: 5, price: 10 },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        expect(result.value.logicValues.get('subtotal')).toBe(50)
      }
    })

    test('evaluates percentage expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          score: { type: 'number' },
          total: { type: 'number' },
        },
        logic: {
          percentage: {
            type: 'percentage',
            label: 'Score Percentage',
            value: '(fields.score.value / fields.total.value) * 100',
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: { score: 85, total: 100 },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        expect(result.value.logicValues.get('percentage')).toBe(85)
      }
    })
  })

  // ============================================================================
  // Object Expression Tests
  // ============================================================================

  describe('object expressions', () => {
    test('evaluates money expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          quantity: { type: 'number' },
          unitPrice: { type: 'money' },
        },
        logic: {
          totalAmount: {
            type: 'money',
            label: 'Total Amount',
            description: 'Quantity times unit price',
            value: {
              amount: 'fields.quantity.value * fields.unitPrice.value.amount',
              currency: 'fields.unitPrice.value.currency',
            },
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: {
          quantity: 3,
          unitPrice: { amount: 25.5, currency: 'USD' },
        },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        const total = result.value.logicValues.get('totalAmount') as {
          amount: number
          currency: string
        }
        expect(total.amount).toBe(76.5)
        expect(total.currency).toBe('USD')
      }
    })

    test('evaluates coordinate expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          startLat: { type: 'number' },
          startLon: { type: 'number' },
          offset: { type: 'number' },
        },
        logic: {
          endPoint: {
            type: 'coordinate',
            label: 'End Point',
            value: {
              lat: 'fields.startLat.value + fields.offset.value',
              lon: 'fields.startLon.value + fields.offset.value',
            },
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: { startLat: 40.7128, startLon: -74.006, offset: 0.5 },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        const coord = result.value.logicValues.get('endPoint') as {
          lat: number
          lon: number
        }
        expect(coord.lat).toBeCloseTo(41.2128)
        expect(coord.lon).toBeCloseTo(-73.506)
      }
    })

    test('evaluates phone expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          countryCode: { type: 'text' },
          phoneNumber: { type: 'text' },
        },
        logic: {
          fullPhone: {
            type: 'phone',
            label: 'Full Phone Number',
            value: {
              number: '"+" || fields.countryCode.value || fields.phoneNumber.value',
            },
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: { countryCode: '1', phoneNumber: '5551234567' },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        const phone = result.value.logicValues.get('fullPhone') as {
          number: string
        }
        expect(phone.number).toBe('+15551234567')
      }
    })

    test('evaluates person expression', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          firstName: { type: 'text' },
          lastName: { type: 'text' },
          honorific: { type: 'text' },
        },
        logic: {
          formalPerson: {
            type: 'person',
            label: 'Formal Person',
            value: {
              fullName: 'fields.honorific.value || " " || fields.firstName.value || " " || fields.lastName.value',
              title: 'fields.honorific.value',
              firstName: 'fields.firstName.value',
              lastName: 'fields.lastName.value',
            },
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: { firstName: 'John', lastName: 'Smith', honorific: 'Dr.' },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        const person = result.value.logicValues.get('formalPerson') as {
          fullName: string
          title: string
          firstName: string
          lastName: string
        }
        expect(person.fullName).toBe('Dr. John Smith')
        expect(person.title).toBe('Dr.')
        expect(person.firstName).toBe('John')
        expect(person.lastName).toBe('Smith')
      }
    })
  })

  // ============================================================================
  // Dependency and Cross-Reference Tests
  // ============================================================================

  describe('dependencies and cross-references', () => {
    test('logic keys can reference other logic keys', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          price: { type: 'number' },
          quantity: { type: 'number' },
          taxRate: { type: 'number' },
        },
        logic: {
          subtotal: {
            type: 'number',
            label: 'Subtotal',
            value: 'fields.price.value * fields.quantity.value',
          },
          tax: {
            type: 'number',
            label: 'Tax',
            value: 'subtotal * (fields.taxRate.value / 100)',
          },
          total: {
            type: 'number',
            label: 'Total',
            value: 'subtotal + tax',
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: { price: 100, quantity: 2, taxRate: 10 },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        expect(result.value.logicValues.get('subtotal')).toBe(200)
        expect(result.value.logicValues.get('tax')).toBe(20)
        expect(result.value.logicValues.get('total')).toBe(220)
      }
    })

    test('object expression can reference other logic keys', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          quantity: { type: 'number' },
          unitPrice: { type: 'money' },
          discountPercent: { type: 'number' },
        },
        logic: {
          subtotal: {
            type: 'number',
            value: 'fields.quantity.value * fields.unitPrice.value.amount',
          },
          discount: {
            type: 'number',
            value: 'subtotal * (fields.discountPercent.value / 100)',
          },
          finalAmount: {
            type: 'money',
            label: 'Final Amount',
            description: 'After discount',
            value: {
              amount: 'subtotal - discount',
              currency: 'fields.unitPrice.value.currency',
            },
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: {
          quantity: 2,
          unitPrice: { amount: 100, currency: 'EUR' },
          discountPercent: 10,
        },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        expect(result.value.logicValues.get('subtotal')).toBe(200)
        expect(result.value.logicValues.get('discount')).toBe(20)
        const final = result.value.logicValues.get('finalAmount') as {
          amount: number
          currency: string
        }
        expect(final.amount).toBe(180)
        expect(final.currency).toBe('EUR')
      }
    })
  })

  // ============================================================================
  // getLogicValues Tests
  // ============================================================================

  describe('getLogicValues helper', () => {
    test('returns evaluated logic values as Map', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          age: { type: 'number' },
        },
        logic: {
          isAdult: { type: 'boolean', value: 'fields.age.value >= 18' },
          ageGroup: {
            type: 'string',
            value: 'fields.age.value < 18 ? "minor" : "adult"',
          },
        },
      }

      const values = getLogicValues(form, { fields: { age: 25 } })

      expect(values.get('isAdult')).toBe(true)
      expect(values.get('ageGroup')).toBe('adult')
    })

    test('returns evaluated object logic values', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          quantity: { type: 'number' },
          price: { type: 'number' },
        },
        logic: {
          total: {
            type: 'money',
            value: {
              amount: 'fields.quantity.value * fields.price.value',
              currency: '"USD"',
            },
          },
        },
      }

      const values = getLogicValues(form, { fields: { quantity: 3, price: 15 } })

      const total = values.get('total') as { amount: number; currency: string }
      expect(total.amount).toBe(45)
      expect(total.currency).toBe('USD')
    })
  })

  // ============================================================================
  // Field Visibility Tests with Object Logic
  // ============================================================================

  describe('field visibility with object logic', () => {
    test('object logic values can be used in visibility expressions', () => {
      const form: Form = {
        kind: 'form',
        name: 'test-form',
        version: '1.0.0',
        title: 'Test',
        fields: {
          quantity: { type: 'number' },
          price: { type: 'number' },
          specialDiscount: {
            type: 'number',
            visible: 'totalAmount.amount > 1000',
            required: 'totalAmount.amount > 1000',
          },
        },
        logic: {
          totalAmount: {
            type: 'money',
            value: {
              amount: 'fields.quantity.value * fields.price.value',
              currency: '"USD"',
            },
          },
        },
      }

      const result = evaluateFormLogic(form, {
        fields: { quantity: 10, price: 150 },
      })

      expect('value' in result).toBe(true)
      if ('value' in result) {
        const discountField = result.value.fields.get('specialDiscount')
        expect(discountField?.visible).toBe(true)
        expect(discountField?.required).toBe(true)
      }
    })
  })
})
