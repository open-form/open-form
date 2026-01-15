import { describe, test, expect } from 'vitest'
import { document, DocumentInstance } from '@/builders/artifacts/document'
import { load } from '@/load'

/**
 * Tests for DocumentInstance methods.
 */
describe('DocumentInstance', () => {
  // ============================================================================
  // Test Fixtures
  // ============================================================================

  const createMinimalDocument = () =>
    document()
      .name('minimal-document')
      .version('1.0.0')
      .title('Minimal Document')
      .build()

  const createDocumentWithLayers = () =>
    document()
      .name('test-document')
      .version('1.0.0')
      .title('Test Document')
      .description('A test document')
      .code('DOC-001')
      .metadata({ author: 'Test' })
      .inlineLayer('default', 'text/plain', 'Hello, World!')
      .inlineLayer('html', 'text/html', '<p>Hello, World!</p>')
      .defaultLayer('default')
      .build()

  // ============================================================================
  // Property Getters
  // ============================================================================

  describe('property getters', () => {
    test('returns kind = "document"', () => {
      const instance = createMinimalDocument()
      expect(instance.kind).toBe('document')
    })

    test('returns name', () => {
      const instance = createMinimalDocument()
      expect(instance.name).toBe('minimal-document')
    })

    test('returns version', () => {
      const instance = createMinimalDocument()
      expect(instance.version).toBe('1.0.0')
    })

    test('returns title', () => {
      const instance = createMinimalDocument()
      expect(instance.title).toBe('Minimal Document')
    })

    test('returns description when set', () => {
      const instance = createDocumentWithLayers()
      expect(instance.description).toBe('A test document')
    })

    test('returns code when set', () => {
      const instance = createDocumentWithLayers()
      expect(instance.code).toBe('DOC-001')
    })

    test('returns metadata when set', () => {
      const instance = createDocumentWithLayers()
      expect(instance.metadata).toEqual({ author: 'Test' })
    })

    test('returns layers when set', () => {
      const instance = createDocumentWithLayers()
      expect(instance.layers).toBeDefined()
      expect(Object.keys(instance.layers || {})).toHaveLength(2)
    })

    test('returns defaultLayer when set', () => {
      const instance = createDocumentWithLayers()
      expect(instance.defaultLayer).toBe('default')
    })

    test('returns schema (raw document object)', () => {
      const instance = createMinimalDocument()
      expect(instance.schema.kind).toBe('document')
      expect(instance.schema.name).toBe('minimal-document')
    })
  })

  // ============================================================================
  // validate() Method
  // ============================================================================

  describe('validate()', () => {
    test('returns valid result for valid document', () => {
      const instance = createMinimalDocument()
      const result = instance.validate()
      expect('value' in result).toBe(true)
    })
  })

  // ============================================================================
  // isValid() Method
  // ============================================================================

  describe('isValid()', () => {
    test('returns true for valid document', () => {
      const instance = createMinimalDocument()
      expect(instance.isValid()).toBe(true)
    })
  })

  // ============================================================================
  // toJSON() Method
  // ============================================================================

  describe('toJSON()', () => {
    test('returns raw schema object when includeSchema is false', () => {
      const instance = createMinimalDocument()
      const json = instance.toJSON({ includeSchema: false })
      expect(json).toEqual(instance.schema)
    })

    test('includes $schema by default', () => {
      const instance = createMinimalDocument()
      const json = instance.toJSON() as { $schema: string }
      expect(json.$schema).toBe('https://schema.open-form.dev/schema.json')
    })

    test('is JSON.stringify compatible', () => {
      const instance = createDocumentWithLayers()
      const json = JSON.stringify(instance)
      const parsed = JSON.parse(json)
      expect(parsed.kind).toBe('document')
    })
  })

  // ============================================================================
  // toYAML() Method
  // ============================================================================

  describe('toYAML()', () => {
    test('returns valid YAML string', () => {
      const instance = createMinimalDocument()
      const yaml = instance.toYAML()
      expect(typeof yaml).toBe('string')
      expect(yaml).toContain('kind: document')
    })

    test('round-trips correctly', () => {
      const instance = createDocumentWithLayers()
      const yaml = instance.toYAML()
      const parsed = load(yaml) as DocumentInstance<any>
      expect(parsed.name).toBe(instance.name)
    })
  })

  // ============================================================================
  // clone() Method
  // ============================================================================

  describe('clone()', () => {
    test('creates exact copy', () => {
      const instance = createDocumentWithLayers()
      const copy = instance.clone()
      expect(copy.name).toBe(instance.name)
      expect(copy.layers).toEqual(instance.layers)
    })

    test('copy is independent', () => {
      const instance = createDocumentWithLayers()
      const copy = instance.clone()
      expect(copy).not.toBe(instance)
      expect(copy.schema).not.toBe(instance.schema)
    })

    test('copy is a DocumentInstance', () => {
      const instance = createDocumentWithLayers()
      const copy = instance.clone()
      expect(copy).toBeInstanceOf(DocumentInstance)
    })
  })

  // ============================================================================
  // with() Method
  // ============================================================================

  describe('with()', () => {
    test('creates modified copy', () => {
      const instance = createMinimalDocument()
      const modified = instance.with({ title: 'New Title' })
      expect(modified.title).toBe('New Title')
    })

    test('original is not modified', () => {
      const instance = createMinimalDocument()
      instance.with({ title: 'Modified' })
      expect(instance.title).toBe('Minimal Document')
    })

    test('validates merged result', () => {
      const instance = createMinimalDocument()
      expect(() => instance.with({ title: '' })).toThrow()
    })

    test('returns DocumentInstance', () => {
      const instance = createMinimalDocument()
      const modified = instance.with({ title: 'New Title' })
      expect(modified).toBeInstanceOf(DocumentInstance)
    })
  })

  // ============================================================================
  // Static from() Method
  // ============================================================================

  describe('static from()', () => {
    test('parses valid document object', () => {
      const input = {
        kind: 'document' as const,
        name: 'parsed-document',
        version: '1.0.0',
        title: 'Parsed Document',
      }
      const instance = document.from(input)
      expect(instance.name).toBe('parsed-document')
    })

    test('throws for invalid input', () => {
      expect(() => document.from({})).toThrow()
    })
  })

  // ============================================================================
  // Static safeFrom() Method
  // ============================================================================

  describe('static safeFrom()', () => {
    test('returns success for valid input', () => {
      const input = {
        kind: 'document' as const,
        name: 'safe-document',
        version: '1.0.0',
        title: 'Safe Document',
      }
      const result = document.safeFrom(input)
      expect(result.success).toBe(true)
    })

    test('returns error for invalid input', () => {
      const result = document.safeFrom({})
      expect(result.success).toBe(false)
    })
  })

  // ============================================================================
  // Layer Methods
  // ============================================================================

  describe('layers', () => {
    test('inlineLayer adds an inline layer', () => {
      const instance = document()
        .name('doc')
        .version('1.0.0')
        .title('Doc')
        .inlineLayer('main', 'text/plain', 'Content')
        .build()

      expect(instance.layers?.main).toBeDefined()
      expect(instance.layers?.main?.kind).toBe('inline')
      expect((instance.layers?.main as any)?.text).toBe('Content')
    })

    test('fileLayer adds a file-backed layer', () => {
      const instance = document()
        .name('doc')
        .version('1.0.0')
        .title('Doc')
        .fileLayer('pdf', 'application/pdf', '/templates/doc.pdf')
        .build()

      expect(instance.layers?.pdf).toBeDefined()
      expect(instance.layers?.pdf?.kind).toBe('file')
      expect((instance.layers?.pdf as any)?.path).toBe('/templates/doc.pdf')
    })

    test('defaultLayer sets the default', () => {
      const instance = document()
        .name('doc')
        .version('1.0.0')
        .title('Doc')
        .inlineLayer('main', 'text/plain', 'Content')
        .defaultLayer('main')
        .build()

      expect(instance.defaultLayer).toBe('main')
    })
  })
})
