import { describe, test, expect } from 'vitest'
import { evaluateFormLogic } from '@/logic/runtime/evaluation/form-evaluator'
import type { Form } from '@open-form/types'
import {
  evaluateFieldStates,
  evaluateAnnexStates,
  getFieldRuntimeState,
  getAnnexRuntimeState,
} from '../helpers/evaluation-helpers'

/**
 * Tests for form-evaluator.ts
 */
describe('form-evaluator', () => {
  // ============================================================================
  // Test Form Fixtures
  // ============================================================================

  const createSimpleForm = (): Form => ({
    kind: 'form',
    name: 'simple-form',
    version: '1.0.0',
    title: 'Simple Form',
    fields: {
      name: { type: 'text', required: true },
      age: { type: 'number' },
      agreed: { type: 'boolean' },
    },
  })

  const createFormWithExpressions = (): Form => ({
    kind: 'form',
    name: 'form-with-expressions',
    version: '1.0.0',
    title: 'Form with Expressions',
    fields: {
      age: { type: 'number' },
      drivingLicense: {
        type: 'text',
        visible: 'fields.age.value >= 18',
        required: 'isAdult',
      },
      parentConsent: {
        type: 'boolean',
        visible: 'fields.age.value < 18',
        required: 'not isAdult',
      },
    },
    logic: {
      isAdult: { type: 'boolean', value: 'fields.age.value >= 18' },
    },
  })

  const createFormWithFieldset = (): Form => ({
    kind: 'form',
    name: 'form-with-fieldset',
    version: '1.0.0',
    title: 'Form with Fieldset',
    fields: {
      hasAddress: { type: 'boolean' },
      address: {
        type: 'fieldset',
        visible: 'fields.hasAddress.value',
        fields: {
          street: { type: 'text', required: true },
          city: { type: 'text', required: true },
        },
      },
    },
  })

  const createFormWithAnnexes = (): Form => ({
    kind: 'form',
    name: 'form-with-annexes',
    version: '1.0.0',
    title: 'Form with Annexes',
    fields: {
      age: { type: 'number' },
    },
    logic: {
      isAdult: { type: 'boolean', value: 'fields.age.value >= 18' },
    },
    annexes: {
      'id-proof': {
        title: 'ID Proof',
        required: true,
      },
      'drivers-license': {
        title: 'Drivers License',
        visible: 'isAdult',
        required: 'isAdult',
      },
      'parent-consent': {
        title: 'Parent Consent',
        visible: 'not isAdult',
        required: 'not isAdult',
      },
    },
  })

  // ============================================================================
  // evaluateFormLogic Tests
  // ============================================================================

  describe('evaluateFormLogic', () => {
    describe('basic field evaluation', () => {
      test('evaluates form with boolean literal conditions', () => {
        const form = createSimpleForm()
        const data = { fields: { name: 'John', age: 25, agreed: true } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          const nameState = state.fields.get('name')
          expect(nameState).toBeDefined()
          expect(nameState?.visible).toBe(true) // default
          expect(nameState?.required).toBe(true) // explicitly set
          expect(nameState?.value).toBe('John')

          const ageState = state.fields.get('age')
          expect(ageState?.visible).toBe(true)
          expect(ageState?.required).toBe(false) // not set
        }
      })

      test('captures field values correctly', () => {
        const form = createSimpleForm()
        const data = { fields: { name: 'Jane', age: 30, agreed: false } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          expect(result.value.fields.get('name')?.value).toBe('Jane')
          expect(result.value.fields.get('age')?.value).toBe(30)
          expect(result.value.fields.get('agreed')?.value).toBe(false)
        }
      })
    })

    describe('expression evaluation', () => {
      test('evaluates visible expression (adult case)', () => {
        const form = createFormWithExpressions()
        const data = { fields: { age: 25 } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          // Adult: drivingLicense visible, parentConsent hidden
          expect(state.fields.get('drivingLicense')?.visible).toBe(true)
          expect(state.fields.get('parentConsent')?.visible).toBe(false)
        }
      })

      test('evaluates visible expression (minor case)', () => {
        const form = createFormWithExpressions()
        const data = { fields: { age: 16 } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          // Minor: drivingLicense hidden, parentConsent visible
          expect(state.fields.get('drivingLicense')?.visible).toBe(false)
          expect(state.fields.get('parentConsent')?.visible).toBe(true)
        }
      })

      test('evaluates required expression using logic key', () => {
        const form = createFormWithExpressions()
        const data = { fields: { age: 25 } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          // Adult: drivingLicense required via isAdult logic key
          expect(state.fields.get('drivingLicense')?.required).toBe(true)
          expect(state.fields.get('parentConsent')?.required).toBe(false)
        }
      })
    })

    describe('nested fieldset evaluation', () => {
      test('evaluates fieldset visibility', () => {
        const form = createFormWithFieldset()
        const data = { fields: { hasAddress: true } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          // Fieldset and nested fields should be visible
          expect(state.fields.get('address')?.visible).toBe(true)
          expect(state.fields.get('address.street')?.visible).toBe(true)
          expect(state.fields.get('address.city')?.visible).toBe(true)
        }
      })

      test('evaluates nested field values', () => {
        const form = createFormWithFieldset()
        const data = {
          fields: {
            hasAddress: true,
            address: { street: '123 Main St', city: 'NYC' },
          },
        }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          expect(state.fields.get('address.street')?.value).toBe('123 Main St')
          expect(state.fields.get('address.city')?.value).toBe('NYC')
        }
      })
    })

    describe('annex evaluation', () => {
      test('evaluates annex with boolean required', () => {
        const form = createFormWithAnnexes()
        const data = { fields: { age: 25 } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          // id-proof is always required
          const idProof = state.annexes.get('id-proof')
          expect(idProof?.visible).toBe(true)
          expect(idProof?.required).toBe(true)
        }
      })

      test('evaluates annex with expression (adult)', () => {
        const form = createFormWithAnnexes()
        const data = { fields: { age: 25 } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          // Adult: drivers-license visible, parent-consent hidden
          expect(state.annexes.get('drivers-license')?.visible).toBe(true)
          expect(state.annexes.get('drivers-license')?.required).toBe(true)
          expect(state.annexes.get('parent-consent')?.visible).toBe(false)
          expect(state.annexes.get('parent-consent')?.required).toBe(false)
        }
      })

      test('evaluates annex with expression (minor)', () => {
        const form = createFormWithAnnexes()
        const data = { fields: { age: 16 } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value

          // Minor: drivers-license hidden, parent-consent visible
          expect(state.annexes.get('drivers-license')?.visible).toBe(false)
          expect(state.annexes.get('drivers-license')?.required).toBe(false)
          expect(state.annexes.get('parent-consent')?.visible).toBe(true)
          expect(state.annexes.get('parent-consent')?.required).toBe(true)
        }
      })
    })

    describe('logic values', () => {
      test('includes evaluated logic values', () => {
        const form = createFormWithExpressions()
        const data = { fields: { age: 25 } }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          expect(result.value.logicValues.get('isAdult')).toBe(true)
        }
      })

      test('logic values reflect data changes', () => {
        const form = createFormWithExpressions()

        const adultResult = evaluateFormLogic(form, { fields: { age: 25 } })
        const minorResult = evaluateFormLogic(form, { fields: { age: 16 } })

        expect('value' in adultResult).toBe(true)
        expect('value' in minorResult).toBe(true)
        if ('value' in adultResult && 'value' in minorResult) {
          expect(adultResult.value.logicValues.get('isAdult')).toBe(true)
          expect(minorResult.value.logicValues.get('isAdult')).toBe(false)
        }
      })
    })

    describe('error handling', () => {
      test('uses defaults for invalid expressions', () => {
        const form: Form = {
          kind: 'form',
          name: 'invalid-expr',
          version: '1.0.0',
          title: 'Invalid Expr',
          fields: {
            test: {
              type: 'text',
              visible: 'invalid syntax ((',
              required: 'also invalid ))',
            },
          },
        }
        const data = { fields: {} }

        const result = evaluateFormLogic(form, data)

        expect('value' in result).toBe(true)
        if ('value' in result) {
          const state = result.value.fields.get('test')
          // Defaults: visible=true, required=false
          expect(state?.visible).toBe(true)
          expect(state?.required).toBe(false)
        }
      })
    })
  })

  // ============================================================================
  // Convenience Function Tests
  // ============================================================================

  describe('evaluateFieldStates', () => {
    test('returns map of field states', () => {
      const form = createSimpleForm()
      const data = { fields: { name: 'John', age: 25 } }

      const states = evaluateFieldStates(form, data)

      expect(states.size).toBeGreaterThan(0)
      expect(states.get('name')).toBeDefined()
      expect(states.get('age')).toBeDefined()
    })
  })

  describe('evaluateAnnexStates', () => {
    test('returns map of annex states', () => {
      const form = createFormWithAnnexes()
      const data = { fields: { age: 25 } }

      const states = evaluateAnnexStates(form, data)

      expect(states.size).toBe(3)
      expect(states.get('id-proof')).toBeDefined()
      expect(states.get('drivers-license')).toBeDefined()
      expect(states.get('parent-consent')).toBeDefined()
    })

    test('returns empty map for form without annexes', () => {
      const form = createSimpleForm()
      const data = { fields: {} }

      const states = evaluateAnnexStates(form, data)

      expect(states.size).toBe(0)
    })
  })

  describe('getFieldRuntimeState', () => {
    test('returns state for specific field', () => {
      const form = createSimpleForm()
      const data = { fields: { name: 'John' } }

      const state = getFieldRuntimeState(form, data, 'name')

      expect(state).toBeDefined()
      expect(state?.fieldId).toBe('name')
      expect(state?.value).toBe('John')
    })

    test('returns undefined for missing field', () => {
      const form = createSimpleForm()
      const data = { fields: {} }

      const state = getFieldRuntimeState(form, data, 'nonexistent')

      expect(state).toBeUndefined()
    })
  })

  describe('getAnnexRuntimeState', () => {
    test('returns state for specific annex', () => {
      const form = createFormWithAnnexes()
      const data = { fields: { age: 25 } }

      const state = getAnnexRuntimeState(form, data, 'id-proof')

      expect(state).toBeDefined()
      expect(state?.annexId).toBe('id-proof')
      expect(state?.required).toBe(true)
    })

    test('returns undefined for missing annex', () => {
      const form = createFormWithAnnexes()
      const data = { fields: {} }

      const state = getAnnexRuntimeState(form, data, 'nonexistent')

      expect(state).toBeUndefined()
    })
  })
})
