import { describe, test, expect } from 'vitest'
import { checklist, ChecklistInstance } from '@/builders/artifacts/checklist'
import { load } from '@/load'

/**
 * Tests for ChecklistInstance methods.
 */
describe('ChecklistInstance', () => {
  // ============================================================================
  // Test Fixtures
  // ============================================================================

  const createMinimalChecklist = () =>
    checklist()
      .name('minimal-checklist')
      .version('1.0.0')
      .title('Minimal Checklist')
      .build()

  const createChecklistWithItems = () =>
    checklist()
      .name('test-checklist')
      .version('1.0.0')
      .title('Test Checklist')
      .description('A test checklist')
      .code('CL-001')
      .metadata({ author: 'Test' })
      .item({ id: 'item1', title: 'First Item' })
      .item({ id: 'item2', title: 'Second Item' })
      .build()

  // ============================================================================
  // Property Getters
  // ============================================================================

  describe('property getters', () => {
    test('returns kind = "checklist"', () => {
      const instance = createMinimalChecklist()
      expect(instance.kind).toBe('checklist')
    })

    test('returns name', () => {
      const instance = createMinimalChecklist()
      expect(instance.name).toBe('minimal-checklist')
    })

    test('returns version', () => {
      const instance = createMinimalChecklist()
      expect(instance.version).toBe('1.0.0')
    })

    test('returns title', () => {
      const instance = createMinimalChecklist()
      expect(instance.title).toBe('Minimal Checklist')
    })

    test('returns description when set', () => {
      const instance = createChecklistWithItems()
      expect(instance.description).toBe('A test checklist')
    })

    test('returns code when set', () => {
      const instance = createChecklistWithItems()
      expect(instance.code).toBe('CL-001')
    })

    test('returns metadata when set', () => {
      const instance = createChecklistWithItems()
      expect(instance.metadata).toEqual({ author: 'Test' })
    })

    test('returns items', () => {
      const instance = createChecklistWithItems()
      expect(instance.items).toBeDefined()
      expect(instance.items).toHaveLength(2)
    })

    test('returns schema (raw checklist object)', () => {
      const instance = createMinimalChecklist()
      expect(instance.schema.kind).toBe('checklist')
      expect(instance.schema.name).toBe('minimal-checklist')
    })
  })

  // ============================================================================
  // validate() Method
  // ============================================================================

  describe('validate()', () => {
    test('returns valid result for valid checklist', () => {
      const instance = createMinimalChecklist()
      const result = instance.validate()
      expect('value' in result).toBe(true)
    })
  })

  // ============================================================================
  // isValid() Method
  // ============================================================================

  describe('isValid()', () => {
    test('returns true for valid checklist', () => {
      const instance = createMinimalChecklist()
      expect(instance.isValid()).toBe(true)
    })
  })

  // ============================================================================
  // toJSON() Method
  // ============================================================================

  describe('toJSON()', () => {
    test('returns raw schema object when includeSchema is false', () => {
      const instance = createMinimalChecklist()
      const json = instance.toJSON({ includeSchema: false })
      expect(json).toEqual(instance.schema)
    })

    test('includes $schema by default', () => {
      const instance = createMinimalChecklist()
      const json = instance.toJSON() as { $schema: string }
      expect(json.$schema).toBe('https://schema.open-form.dev/schema.json')
    })

    test('is JSON.stringify compatible', () => {
      const instance = createChecklistWithItems()
      const json = JSON.stringify(instance)
      const parsed = JSON.parse(json)
      expect(parsed.kind).toBe('checklist')
    })
  })

  // ============================================================================
  // toYAML() Method
  // ============================================================================

  describe('toYAML()', () => {
    test('returns valid YAML string', () => {
      const instance = createMinimalChecklist()
      const yaml = instance.toYAML()
      expect(typeof yaml).toBe('string')
      expect(yaml).toContain('kind: checklist')
    })

    test('round-trips correctly', () => {
      const instance = createChecklistWithItems()
      const yaml = instance.toYAML()
      const parsed = load(yaml) as ChecklistInstance<any>
      expect(parsed.name).toBe(instance.name)
    })
  })

  // ============================================================================
  // clone() Method
  // ============================================================================

  describe('clone()', () => {
    test('creates exact copy', () => {
      const instance = createChecklistWithItems()
      const copy = instance.clone()
      expect(copy.name).toBe(instance.name)
      expect(copy.items).toEqual(instance.items)
    })

    test('copy is independent', () => {
      const instance = createChecklistWithItems()
      const copy = instance.clone()
      expect(copy).not.toBe(instance)
      expect(copy.schema).not.toBe(instance.schema)
    })

    test('copy is a ChecklistInstance', () => {
      const instance = createChecklistWithItems()
      const copy = instance.clone()
      expect(copy).toBeInstanceOf(ChecklistInstance)
    })
  })

  // ============================================================================
  // with() Method
  // ============================================================================

  describe('with()', () => {
    test('creates modified copy', () => {
      const instance = createMinimalChecklist()
      const modified = instance.with({ title: 'New Title' })
      expect(modified.title).toBe('New Title')
    })

    test('original is not modified', () => {
      const instance = createMinimalChecklist()
      instance.with({ title: 'Modified' })
      expect(instance.title).toBe('Minimal Checklist')
    })

    test('validates merged result', () => {
      const instance = createMinimalChecklist()
      expect(() => instance.with({ title: '' })).toThrow()
    })

    test('returns ChecklistInstance', () => {
      const instance = createMinimalChecklist()
      const modified = instance.with({ title: 'New Title' })
      expect(modified).toBeInstanceOf(ChecklistInstance)
    })
  })

  // ============================================================================
  // Static from() Method
  // ============================================================================

  describe('static from()', () => {
    test('parses valid checklist object', () => {
      const input = {
        kind: 'checklist' as const,
        name: 'parsed-checklist',
        version: '1.0.0',
        title: 'Parsed Checklist',
        items: [],
      }
      const instance = checklist.from(input)
      expect(instance.name).toBe('parsed-checklist')
    })

    test('throws for invalid input', () => {
      expect(() => checklist.from({})).toThrow()
    })
  })

  // ============================================================================
  // Static safeFrom() Method
  // ============================================================================

  describe('static safeFrom()', () => {
    test('returns success for valid input', () => {
      const input = {
        kind: 'checklist' as const,
        name: 'safe-checklist',
        version: '1.0.0',
        title: 'Safe Checklist',
        items: [],
      }
      const result = checklist.safeFrom(input)
      expect(result.success).toBe(true)
    })

    test('returns error for invalid input', () => {
      const result = checklist.safeFrom({})
      expect(result.success).toBe(false)
    })
  })
})
