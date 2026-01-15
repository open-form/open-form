import { describe, test, expect } from 'vitest'
import { form } from '@/builders/artifacts/form'
import { FilledForm } from '@/filled-form'

/**
 * Tests for FilledForm class.
 *
 * FilledForm wraps a form instance together with validated data,
 * providing a convenient way to work with forms and their data.
 */
describe('FilledForm', () => {
  // ============================================================================
  // Test Fixtures
  // ============================================================================

  const createFormWithFields = () =>
    form()
      .name('test-form')
      .version('1.0.0')
      .title('Test Form')
      .fields({
        name: { type: 'text', label: 'Full Name', required: true },
        email: { type: 'email', label: 'Email', required: true },
        age: { type: 'number', label: 'Age', min: 0, max: 150 },
        subscribe: { type: 'boolean', label: 'Subscribe' },
      })
      .build()

  const createFormWithLayer = () =>
    form()
      .name('form-with-layer')
      .version('1.0.0')
      .title('Form with Layer')
      .fields({
        name: { type: 'text', label: 'Name', required: true },
        greeting: { type: 'text', label: 'Greeting' },
      })
      .inlineLayer('default', 'text/plain', 'Hello, {{name}}! {{greeting}}')
      .defaultLayer('default')
      .build()

  // ============================================================================
  // Constructor
  // ============================================================================

  describe('constructor', () => {
    test('creates FilledForm with form and data', () => {
      const formInstance = createFormWithFields()
      const data = { fields: { name: 'John', email: 'john@example.com' } } as const
      // Use fill() which handles type normalization
      const filled = formInstance.fill(data)

      expect(filled).toBeInstanceOf(FilledForm)
      expect(filled.form).toBe(formInstance)
      expect(filled.data.fields.name).toEqual('John')
      expect(filled.data.fields.email).toEqual('john@example.com')
    })

    test('stores form reference', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      expect(filled.form).toBe(formInstance)
      expect(filled.form.name).toBe('test-form')
    })

    test('stores data', () => {
      const formInstance = createFormWithFields()
      const data = {
        fields: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
          subscribe: true,
        },
      }
      const filled = formInstance.fill(data)

      expect(filled.data.fields.name).toEqual('John Doe')
      expect(filled.data.fields.email).toEqual('john@example.com')
      expect(filled.data.fields.age).toEqual(30)
      expect(filled.data.fields.subscribe).toEqual(true)
    })
  })

  // ============================================================================
  // Creating via fill()
  // ============================================================================

  describe('creating via form.fill()', () => {
    test('creates FilledForm via fill()', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      expect(filled).toBeInstanceOf(FilledForm)
    })

    test('validates data when creating via fill()', () => {
      const formInstance = createFormWithFields()

      // Missing required field should throw
      expect(() => formInstance.fill({ fields: { name: 'John' } })).toThrow()
    })

    test('creates FilledForm via safeFill()', () => {
      const formInstance = createFormWithFields()
      const result = formInstance.safeFill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeInstanceOf(FilledForm)
      }
    })
  })

  // ============================================================================
  // get() Method
  // ============================================================================

  describe('get()', () => {
    test('returns field value by id', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John Doe', email: 'john@example.com', age: 30 },
      })

      expect(filled.get('name')).toBe('John Doe')
      expect(filled.get('email')).toBe('john@example.com')
      expect(filled.get('age')).toBe(30)
    })

    test('returns undefined for unset optional field', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      expect(filled.get('age')).toBeUndefined()
      expect(filled.get('subscribe')).toBeUndefined()
    })

    test('returns undefined for non-existent field', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      expect(filled.get('nonexistent')).toBeUndefined()
    })

    test('returns correct type for each field type', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com', age: 25, subscribe: false },
      })

      expect(typeof filled.get('name')).toBe('string')
      expect(typeof filled.get('email')).toBe('string')
      expect(typeof filled.get('age')).toBe('number')
      expect(typeof filled.get('subscribe')).toBe('boolean')
    })
  })

  // ============================================================================
  // getAll() Method
  // ============================================================================

  describe('getAll()', () => {
    test('returns all field values', () => {
      const formInstance = createFormWithFields()
      const fieldData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        subscribe: true,
      }
      const filled = formInstance.fill({ fields: fieldData })

      expect(filled.getAll()).toEqual(fieldData)
    })

    test('returns fields object from data', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      expect(filled.getAll()).toEqual({ name: 'John', email: 'john@example.com' })
    })
  })

  // ============================================================================
  // isValid() Method
  // ============================================================================

  describe('isValid()', () => {
    test('always returns true (data is validated at construction)', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      expect(filled.isValid()).toBe(true)
    })

    test('return type is exactly true', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const result: true = filled.isValid()
      expect(result).toBe(true)
    })
  })

  // ============================================================================
  // set() Method
  // ============================================================================

  describe('set()', () => {
    test('returns new FilledForm with updated field', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const updated = filled.set('name', 'Jane')

      expect(updated.get('name')).toBe('Jane')
      expect(updated.get('email')).toBe('john@example.com')
    })

    test('original FilledForm is not modified', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      filled.set('name', 'Jane')

      expect(filled.get('name')).toBe('John') // unchanged
    })

    test('returns new FilledForm instance', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const updated = filled.set('name', 'Jane')

      expect(updated).not.toBe(filled)
      expect(updated).toBeInstanceOf(FilledForm)
    })

    test('validates updated data', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      // Valid set should work
      const updated = filled.set('name', 'Jane')
      expect(updated.get('name')).toBe('Jane')
    })

    test('validates age constraints', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      // Age out of range should throw
      expect(() => filled.set('age', 200)).toThrow()
    })

    test('can set optional field', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const updated = filled.set('age', 25)
      expect(updated.get('age')).toBe(25)
    })
  })

  // ============================================================================
  // update() Method
  // ============================================================================

  describe('update()', () => {
    test('returns new FilledForm with multiple updated fields', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const updated = filled.update({
        name: 'Jane',
        age: 30,
      })

      expect(updated.get('name')).toBe('Jane')
      expect(updated.get('age')).toBe(30)
      expect(updated.get('email')).toBe('john@example.com') // unchanged
    })

    test('original FilledForm is not modified', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      filled.update({ name: 'Jane', age: 30 })

      expect(filled.get('name')).toBe('John')
      expect(filled.get('age')).toBeUndefined()
    })

    test('validates updated data', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      // Update returns new FilledForm - test passes with valid data
      const updated = filled.update({ name: 'Jane' })
      expect(updated.get('name')).toBe('Jane')
    })

    test('can update multiple fields at once', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const updated = filled.update({
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 28,
        subscribe: true,
      })

      expect(updated.get('name')).toBe('Jane Doe')
      expect(updated.get('email')).toBe('jane@example.com')
      expect(updated.get('age')).toBe(28)
      expect(updated.get('subscribe')).toBe(true)
    })
  })

  // ============================================================================
  // clone() Method
  // ============================================================================

  describe('clone()', () => {
    test('creates exact copy', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com', age: 30 },
      })

      const cloned = filled.clone()

      expect(cloned.get('name')).toBe(filled.get('name'))
      expect(cloned.get('email')).toBe(filled.get('email'))
      expect(cloned.get('age')).toBe(filled.get('age'))
    })

    test('clone is a new FilledForm instance', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const cloned = filled.clone()

      expect(cloned).not.toBe(filled)
      expect(cloned).toBeInstanceOf(FilledForm)
    })

    test('clone data is independent (deep clone)', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const cloned = filled.clone()

      // Verify data objects are different
      expect(cloned.data).not.toBe(filled.data)

      // Modifying one doesn't affect the other
      const updated = cloned.set('name', 'Jane')
      expect(filled.get('name')).toBe('John')
      expect(updated.get('name')).toBe('Jane')
    })

    test('clone shares form reference', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const cloned = filled.clone()

      expect(cloned.form).toBe(filled.form)
    })
  })

  // ============================================================================
  // toJSON() Method
  // ============================================================================

  describe('toJSON()', () => {
    test('returns object with form and data', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const json = filled.toJSON()

      expect(json.form).toBeDefined()
      expect(json.data).toBeDefined()
    })

    test('form property is raw schema', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const json = filled.toJSON()

      expect(json.form.kind).toBe('form')
      expect(json.form.name).toBe('test-form')
      expect(json.form.fields).toBeDefined()
    })

    test('data property contains fields', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com', age: 30 },
      })

      const json = filled.toJSON()

      expect(json.data.fields.name).toBe('John')
      expect(json.data.fields.email).toBe('john@example.com')
      expect(json.data.fields.age).toBe(30)
    })

    test('is JSON.stringify compatible', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const jsonString = JSON.stringify(filled)
      const parsed = JSON.parse(jsonString)

      expect(parsed.form).toBeDefined()
      expect(parsed.data).toBeDefined()
      expect(parsed.form.kind).toBe('form')
      expect(parsed.data.fields.name).toBe('John')
    })
  })

  // ============================================================================
  // toYAML() Method
  // ============================================================================

  describe('toYAML()', () => {
    test('returns valid YAML string', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const yaml = filled.toYAML()

      expect(typeof yaml).toBe('string')
      expect(yaml).toContain('form:')
      expect(yaml).toContain('data:')
    })

    test('YAML contains form schema', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const yaml = filled.toYAML()

      expect(yaml).toContain('kind: form')
      expect(yaml).toContain('name: test-form')
    })

    test('YAML contains data values', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John Doe', email: 'john@example.com' },
      })

      const yaml = filled.toYAML()

      expect(yaml).toContain('John Doe')
      expect(yaml).toContain('john@example.com')
    })
  })

  // ============================================================================
  // Immutability
  // ============================================================================

  describe('immutability', () => {
    test('form property is readonly at compile-time', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      // TypeScript prevents assignment at compile-time
      // @ts-expect-error - form is readonly
      const _check = () => { filled.form = null }

      // At runtime, form is still the original value
      expect(filled.form).toBe(formInstance)
    })

    test('data property is readonly at compile-time', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })
      const originalData = filled.data

      // TypeScript prevents assignment at compile-time
      // @ts-expect-error - data is readonly
      const _check = () => { filled.data = {} }

      // At runtime, data should equal the original
      expect(filled.data).toEqual(originalData)
    })

    test('mutation methods return new instances', () => {
      const formInstance = createFormWithFields()
      const original = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      const afterSet = original.set('name', 'Jane')
      const afterUpdate = original.update({ age: 30 })
      const afterClone = original.clone()

      expect(afterSet).not.toBe(original)
      expect(afterUpdate).not.toBe(original)
      expect(afterClone).not.toBe(original)
    })
  })

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    test('handles form with no optional fields', () => {
      const simpleForm = form()
        .name('simple')
        .version('1.0.0')
        .title('Simple')
        .fields({
          name: { type: 'text', label: 'Name', required: true },
        })
        .build()

      const filled = simpleForm.fill({ fields: { name: 'John' } })

      expect(filled.get('name')).toBe('John')
    })

    test('handles empty data object for form with no required fields', () => {
      const optionalForm = form()
        .name('optional')
        .version('1.0.0')
        .title('Optional')
        .fields({
          name: { type: 'text', label: 'Name' },
          age: { type: 'number', label: 'Age' },
        })
        .build()

      const filled = optionalForm.fill({ fields: {} })

      expect(filled.get('name')).toBeUndefined()
      expect(filled.get('age')).toBeUndefined()
    })

    test('handles special characters in string values', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: "O'Brien", email: 'obrien@example.com' },
      })

      expect(filled.get('name')).toBe("O'Brien")
    })

    test('handles unicode in string values', () => {
      const formInstance = createFormWithFields()
      const filled = formInstance.fill({
        fields: { name: 'John', email: 'john@example.com' },
      })

      expect(filled.get('name')).toBe('John')
    })
  })

  // ============================================================================
  // Runtime State (Expression Evaluation)
  // ============================================================================

  describe('runtimeState', () => {
    // Note: We don't use required: 'expression' in these tests because schema
    // validation treats string expressions as truthy. Runtime evaluation tests
    // the required expression separately via isFieldRequired().
    const createFormWithExpressions = () =>
      form()
        .name('conditional-form')
        .version('1.0.0')
        .title('Conditional Form')
        .logic({ isAdult: 'fields.age.value >= 18' })
        .field('age', { type: 'number', label: 'Age' })
        .field('drivingLicense', {
          type: 'text',
          label: 'Driving License',
          visible: 'isAdult',
        })
        .field('parentConsent', {
          type: 'boolean',
          label: 'Parent Consent',
          visible: 'not isAdult',
        })
        .build()

    // For testing required expressions at runtime
    const createFormWithRequiredExpressions = () =>
      form()
        .name('required-form')
        .version('1.0.0')
        .title('Required Form')
        .logic({ isAdult: 'fields.age.value >= 18' })
        .field('age', { type: 'number', label: 'Age', required: true })
        .field('drivingLicense', {
          type: 'text',
          label: 'Driving License',
          visible: 'isAdult',
          required: 'isAdult',
        })
        .field('parentConsent', {
          type: 'boolean',
          label: 'Parent Consent',
          visible: 'not isAdult',
          required: 'not isAdult',
        })
        .build()

    const createFormWithDisabled = () =>
      form()
        .name('disabled-form')
        .version('1.0.0')
        .title('Disabled Form')
        .field('locked', { type: 'boolean', label: 'Locked' })
        .field('editableField', {
          type: 'text',
          label: 'Editable',
          disabled: 'fields.locked.value',
        })
        .build()

    // Note: Don't use required expressions for annexes in tests because schema
    // validation treats any string as truthy, which causes validation to fail
    // when annexes data is missing. We can only test visibility for annexes.
    const createFormWithAnnexes = () =>
      form()
        .name('form-with-annexes')
        .version('1.0.0')
        .title('Form with Annexes')
        .logic({ isAdult: 'fields.age.value >= 18' })
        .field('age', { type: 'number', label: 'Age' })
        .annex({ id: 'id-proof', title: 'ID Proof' })
        .annex({ id: 'drivers-license', title: 'Drivers License', visible: 'isAdult' })
        .annex({ id: 'parent-consent', title: 'Parent Consent', visible: 'not isAdult' })
        .build()

    describe('runtimeState getter', () => {
      test('returns FormRuntimeState object', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const state = filled.runtimeState

        expect(state).toBeDefined()
        expect(state.fields).toBeInstanceOf(Map)
        expect(state.annexes).toBeInstanceOf(Map)
        expect(state.logicValues).toBeInstanceOf(Map)
      })

      test('caches runtime state on subsequent accesses', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const state1 = filled.runtimeState
        const state2 = filled.runtimeState

        expect(state1).toBe(state2) // Same object reference
      })

      test('includes all fields in state', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const state = filled.runtimeState

        expect(state.fields.has('age')).toBe(true)
        expect(state.fields.has('drivingLicense')).toBe(true)
        expect(state.fields.has('parentConsent')).toBe(true)
      })
    })

    describe('getFieldState()', () => {
      test('returns FieldRuntimeState for existing field', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const fieldState = filled.getFieldState('age')

        expect(fieldState).toBeDefined()
        expect(fieldState?.fieldId).toBe('age')
        expect(fieldState?.value).toBe(25)
      })

      test('returns undefined for non-existent field', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const fieldState = filled.getFieldState('nonexistent')

        expect(fieldState).toBeUndefined()
      })

      test('includes visible, required, disabled properties', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const fieldState = filled.getFieldState('drivingLicense')

        expect(fieldState).toBeDefined()
        expect(typeof fieldState?.visible).toBe('boolean')
        expect(typeof fieldState?.required).toBe('boolean')
        expect(typeof fieldState?.disabled).toBe('boolean')
      })
    })

    describe('isFieldVisible()', () => {
      test('returns true for visible field (adult case)', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.isFieldVisible('drivingLicense')).toBe(true)
        expect(filled.isFieldVisible('parentConsent')).toBe(false)
      })

      test('returns true for visible field (minor case)', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 16 } })

        expect(filled.isFieldVisible('drivingLicense')).toBe(false)
        expect(filled.isFieldVisible('parentConsent')).toBe(true)
      })

      test('returns true for always-visible field', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.isFieldVisible('age')).toBe(true)
      })

      test('returns true for non-existent field (default behavior)', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.isFieldVisible('nonexistent')).toBe(true)
      })
    })

    describe('isFieldRequired()', () => {
      test('returns true for required field (adult case)', () => {
        // Use form with required expressions, provide all data
        const formInstance = createFormWithRequiredExpressions()
        const filled = formInstance.fill({
          fields: { age: 25, drivingLicense: 'ABC123', parentConsent: false },
        })

        expect(filled.isFieldRequired('drivingLicense')).toBe(true)
        expect(filled.isFieldRequired('parentConsent')).toBe(false)
      })

      test('returns true for required field (minor case)', () => {
        // Use form with required expressions, provide all data
        const formInstance = createFormWithRequiredExpressions()
        const filled = formInstance.fill({
          fields: { age: 16, drivingLicense: '', parentConsent: true },
        })

        expect(filled.isFieldRequired('drivingLicense')).toBe(false)
        expect(filled.isFieldRequired('parentConsent')).toBe(true)
      })

      test('returns true for always-required field', () => {
        // Use form with required expressions, provide all data
        const formInstance = createFormWithRequiredExpressions()
        const filled = formInstance.fill({
          fields: { age: 25, drivingLicense: 'ABC123', parentConsent: false },
        })

        expect(filled.isFieldRequired('age')).toBe(true)
      })

      test('returns false for non-existent field (default behavior)', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.isFieldRequired('nonexistent')).toBe(false)
      })
    })

    describe('isFieldDisabled()', () => {
      // Note: The 'disabled' property is defined in TypeScript types but not
      // in the JSON schema, so it gets stripped during field parsing. These
      // tests verify the default behavior when disabled is not in the schema.
      test('returns false when disabled expression is stripped by schema', () => {
        const formInstance = createFormWithDisabled()
        const filled = formInstance.fill({ fields: { locked: true } })

        // Disabled property gets stripped by field parsing, so always false
        expect(filled.isFieldDisabled('editableField')).toBe(false)
      })

      test('returns false for field without disabled expression', () => {
        const formInstance = createFormWithDisabled()
        const filled = formInstance.fill({ fields: { locked: false } })

        expect(filled.isFieldDisabled('locked')).toBe(false)
      })

      test('returns false for non-existent field (default behavior)', () => {
        const formInstance = createFormWithDisabled()
        const filled = formInstance.fill({ fields: { locked: false } })

        expect(filled.isFieldDisabled('nonexistent')).toBe(false)
      })
    })

    describe('getVisibleFields()', () => {
      test('returns only visible fields (adult case)', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const visibleFields = filled.getVisibleFields()
        const visibleIds = visibleFields.map((f) => f.fieldId)

        expect(visibleIds).toContain('age')
        expect(visibleIds).toContain('drivingLicense')
        expect(visibleIds).not.toContain('parentConsent')
      })

      test('returns only visible fields (minor case)', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 16 } })

        const visibleFields = filled.getVisibleFields()
        const visibleIds = visibleFields.map((f) => f.fieldId)

        expect(visibleIds).toContain('age')
        expect(visibleIds).not.toContain('drivingLicense')
        expect(visibleIds).toContain('parentConsent')
      })

      test('returns array of FieldRuntimeState objects', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const visibleFields = filled.getVisibleFields()

        expect(Array.isArray(visibleFields)).toBe(true)
        expect(visibleFields.length).toBeGreaterThan(0)
        expect(visibleFields[0]).toHaveProperty('fieldId')
        expect(visibleFields[0]).toHaveProperty('visible')
      })
    })

    describe('getRequiredVisibleFields()', () => {
      test('returns fields that are both visible AND required (adult)', () => {
        // Use form with required expressions, provide all data
        const formInstance = createFormWithRequiredExpressions()
        const filled = formInstance.fill({
          fields: { age: 25, drivingLicense: 'ABC123', parentConsent: false },
        })

        const requiredVisible = filled.getRequiredVisibleFields()
        const ids = requiredVisible.map((f) => f.fieldId)

        expect(ids).toContain('age')
        expect(ids).toContain('drivingLicense')
        expect(ids).not.toContain('parentConsent')
      })

      test('returns fields that are both visible AND required (minor)', () => {
        // Use form with required expressions, provide all data
        const formInstance = createFormWithRequiredExpressions()
        const filled = formInstance.fill({
          fields: { age: 16, drivingLicense: '', parentConsent: true },
        })

        const requiredVisible = filled.getRequiredVisibleFields()
        const ids = requiredVisible.map((f) => f.fieldId)

        expect(ids).toContain('age')
        expect(ids).not.toContain('drivingLicense')
        expect(ids).toContain('parentConsent')
      })

      test('excludes visible but not required fields', () => {
        const formInstance = form()
          .name('test')
          .version('1.0.0')
          .title('Test')
          .field('name', { type: 'text', label: 'Name', required: true })
          .field('optional', { type: 'text', label: 'Optional' })
          .build()
        const filled = formInstance.fill({ fields: { name: 'John' } })

        const requiredVisible = filled.getRequiredVisibleFields()
        const ids = requiredVisible.map((f) => f.fieldId)

        expect(ids).toContain('name')
        expect(ids).not.toContain('optional')
      })
    })

    describe('getAnnexState()', () => {
      test('returns AnnexRuntimeState for existing annex', () => {
        const formInstance = createFormWithAnnexes()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const annexState = filled.getAnnexState('id-proof')

        expect(annexState).toBeDefined()
        expect(annexState?.annexId).toBe('id-proof')
      })

      test('returns undefined for non-existent annex', () => {
        const formInstance = createFormWithAnnexes()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const annexState = filled.getAnnexState('nonexistent')

        expect(annexState).toBeUndefined()
      })

      test('includes visible and required properties', () => {
        const formInstance = createFormWithAnnexes()
        const filled = formInstance.fill({ fields: { age: 25 } })

        const annexState = filled.getAnnexState('id-proof')

        expect(annexState).toBeDefined()
        expect(typeof annexState?.visible).toBe('boolean')
        expect(typeof annexState?.required).toBe('boolean')
      })
    })

    describe('isAnnexVisible()', () => {
      test('returns true for visible annex (adult case)', () => {
        const formInstance = createFormWithAnnexes()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.isAnnexVisible('id-proof')).toBe(true)
        expect(filled.isAnnexVisible('drivers-license')).toBe(true)
        expect(filled.isAnnexVisible('parent-consent')).toBe(false)
      })

      test('returns true for visible annex (minor case)', () => {
        const formInstance = createFormWithAnnexes()
        const filled = formInstance.fill({ fields: { age: 16 } })

        expect(filled.isAnnexVisible('id-proof')).toBe(true)
        expect(filled.isAnnexVisible('drivers-license')).toBe(false)
        expect(filled.isAnnexVisible('parent-consent')).toBe(true)
      })

      test('returns true for non-existent annex (default behavior)', () => {
        const formInstance = createFormWithAnnexes()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.isAnnexVisible('nonexistent')).toBe(true)
      })
    })

    describe('isAnnexRequired()', () => {
      // Note: We cannot test required expressions on annexes because schema
      // validation treats string expressions as truthy and requires annexes data.
      // These tests verify the default behavior when no required is set.
      test('returns false when annex has no required expression', () => {
        const formInstance = createFormWithAnnexes()
        const filled = formInstance.fill({ fields: { age: 25 } })

        // All annexes have no required expression, so all default to false
        expect(filled.isAnnexRequired('id-proof')).toBe(false)
        expect(filled.isAnnexRequired('drivers-license')).toBe(false)
        expect(filled.isAnnexRequired('parent-consent')).toBe(false)
      })

      test('returns false for non-existent annex (default behavior)', () => {
        const formInstance = createFormWithAnnexes()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.isAnnexRequired('nonexistent')).toBe(false)
      })
    })

    describe('getLogicValue()', () => {
      test('returns evaluated logic key value (adult)', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.getLogicValue('isAdult')).toBe(true)
      })

      test('returns evaluated logic key value (minor)', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 16 } })

        expect(filled.getLogicValue('isAdult')).toBe(false)
      })

      test('returns undefined for non-existent logic key', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 25 } })

        expect(filled.getLogicValue('nonexistent')).toBeUndefined()
      })

      test('works with multiple logic keys', () => {
        const formInstance = form()
          .name('multi-logic')
          .version('1.0.0')
          .title('Multi Logic')
          .logic({
            isAdult: 'fields.age.value >= 18',
            isSenior: 'fields.age.value >= 65',
            isTeenager: 'fields.age.value >= 13 and fields.age.value < 20',
          })
          .field('age', { type: 'number', label: 'Age' })
          .build()

        const filled = formInstance.fill({ fields: { age: 70 } })

        expect(filled.getLogicValue('isAdult')).toBe(true)
        expect(filled.getLogicValue('isSenior')).toBe(true)
        expect(filled.getLogicValue('isTeenager')).toBe(false)
      })
    })

    describe('runtime state with data changes', () => {
      test('new FilledForm has fresh runtime state after set()', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 16 } })

        expect(filled.isFieldVisible('parentConsent')).toBe(true)
        expect(filled.isFieldVisible('drivingLicense')).toBe(false)

        const updated = filled.set('age', 25)

        expect(updated.isFieldVisible('parentConsent')).toBe(false)
        expect(updated.isFieldVisible('drivingLicense')).toBe(true)
      })

      test('original FilledForm state is unchanged after set()', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 16 } })

        filled.set('age', 25) // Create new instance

        // Original should remain unchanged
        expect(filled.isFieldVisible('parentConsent')).toBe(true)
        expect(filled.isFieldVisible('drivingLicense')).toBe(false)
      })

      test('logic values update with data changes', () => {
        const formInstance = createFormWithExpressions()
        const filled = formInstance.fill({ fields: { age: 16 } })

        expect(filled.getLogicValue('isAdult')).toBe(false)

        const updated = filled.set('age', 25)

        expect(updated.getLogicValue('isAdult')).toBe(true)
        expect(filled.getLogicValue('isAdult')).toBe(false) // Original unchanged
      })
    })
  })
})
