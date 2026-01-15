import { describe, test, expect } from 'vitest'
import { bundle, BundleInstance } from '@/builders/artifacts/bundle'
import { document } from '@/builders/artifacts/document'
import { form } from '@/builders/artifacts/form'
import { load } from '@/load'

/**
 * Tests for BundleInstance methods.
 */
describe('BundleInstance', () => {
  // ============================================================================
  // Test Fixtures
  // ============================================================================

  const createMinimalBundle = () =>
    bundle()
      .name('minimal-bundle')
      .version('1.0.0')
      .title('Minimal Bundle')
      .build()

  const createBundleWithContents = () =>
    bundle()
      .name('test-bundle')
      .version('1.0.0')
      .title('Test Bundle')
      .description('A test bundle')
      .code('BUN-001')
      .metadata({ author: 'Test' })
      .logic({ needsDoc: 'true', isActive: 'needsDoc == true' })
      .inline(
        'main-doc',
        document()
          .name('main-doc')
          .version('1.0.0')
          .title('Main Document')
          .inlineLayer('default', 'text/plain', 'Hello')
          .build()
      )
      .registry('external-form', '@org/external-form', 'isActive')
      .path('local-doc', '/path/to/doc.yaml')
      .build()

  // ============================================================================
  // Property Getters
  // ============================================================================

  describe('property getters', () => {
    test('returns kind = "bundle"', () => {
      const instance = createMinimalBundle()
      expect(instance.kind).toBe('bundle')
    })

    test('returns name', () => {
      const instance = createMinimalBundle()
      expect(instance.name).toBe('minimal-bundle')
    })

    test('returns version', () => {
      const instance = createMinimalBundle()
      expect(instance.version).toBe('1.0.0')
    })

    test('returns title', () => {
      const instance = createMinimalBundle()
      expect(instance.title).toBe('Minimal Bundle')
    })

    test('returns description when set', () => {
      const instance = createBundleWithContents()
      expect(instance.description).toBe('A test bundle')
    })

    test('returns code when set', () => {
      const instance = createBundleWithContents()
      expect(instance.code).toBe('BUN-001')
    })

    test('returns metadata when set', () => {
      const instance = createBundleWithContents()
      expect(instance.metadata).toEqual({ author: 'Test' })
    })

    test('returns logic when set', () => {
      const instance = createBundleWithContents()
      expect(instance.logic).toBeDefined()
      expect(instance.logic?.needsDoc).toBe('true')
      expect(instance.logic?.isActive).toBe('needsDoc == true')
    })

    test('returns contents', () => {
      const instance = createBundleWithContents()
      expect(instance.contents).toBeDefined()
      expect(instance.contents).toHaveLength(3)
    })

    test('returns schema (raw bundle object)', () => {
      const instance = createMinimalBundle()
      expect(instance.schema.kind).toBe('bundle')
      expect(instance.schema.name).toBe('minimal-bundle')
    })
  })

  // ============================================================================
  // validate() Method
  // ============================================================================

  describe('validate()', () => {
    test('returns valid result for valid bundle', () => {
      const instance = createMinimalBundle()
      const result = instance.validate()
      expect('value' in result).toBe(true)
    })
  })

  // ============================================================================
  // isValid() Method
  // ============================================================================

  describe('isValid()', () => {
    test('returns true for valid bundle', () => {
      const instance = createMinimalBundle()
      expect(instance.isValid()).toBe(true)
    })
  })

  // ============================================================================
  // toJSON() Method
  // ============================================================================

  describe('toJSON()', () => {
    test('returns raw schema object when includeSchema is false', () => {
      const instance = createMinimalBundle()
      const json = instance.toJSON({ includeSchema: false })
      expect(json).toEqual(instance.schema)
    })

    test('includes $schema by default', () => {
      const instance = createMinimalBundle()
      const json = instance.toJSON() as { $schema: string }
      expect(json.$schema).toBe('https://schema.open-form.dev/schema.json')
    })

    test('is JSON.stringify compatible', () => {
      const instance = createBundleWithContents()
      const json = JSON.stringify(instance)
      const parsed = JSON.parse(json)
      expect(parsed.kind).toBe('bundle')
    })
  })

  // ============================================================================
  // toYAML() Method
  // ============================================================================

  describe('toYAML()', () => {
    test('returns valid YAML string', () => {
      const instance = createMinimalBundle()
      const yaml = instance.toYAML()
      expect(typeof yaml).toBe('string')
      expect(yaml).toContain('kind: bundle')
    })

    test('round-trips correctly', () => {
      const instance = createBundleWithContents()
      const yaml = instance.toYAML()
      const parsed = load(yaml) as BundleInstance<any>
      expect(parsed.name).toBe(instance.name)
    })
  })

  // ============================================================================
  // clone() Method
  // ============================================================================

  describe('clone()', () => {
    test('creates exact copy', () => {
      const instance = createBundleWithContents()
      const copy = instance.clone()
      expect(copy.name).toBe(instance.name)
      expect(copy.contents).toEqual(instance.contents)
    })

    test('copy is independent', () => {
      const instance = createBundleWithContents()
      const copy = instance.clone()
      expect(copy).not.toBe(instance)
      expect(copy.schema).not.toBe(instance.schema)
    })

    test('copy is a BundleInstance', () => {
      const instance = createBundleWithContents()
      const copy = instance.clone()
      expect(copy).toBeInstanceOf(BundleInstance)
    })
  })

  // ============================================================================
  // with() Method
  // ============================================================================

  describe('with()', () => {
    test('creates modified copy', () => {
      const instance = createMinimalBundle()
      const modified = instance.with({ title: 'New Title' })
      expect(modified.title).toBe('New Title')
    })

    test('original is not modified', () => {
      const instance = createMinimalBundle()
      instance.with({ title: 'Modified' })
      expect(instance.title).toBe('Minimal Bundle')
    })

    test('validates merged result', () => {
      const instance = createMinimalBundle()
      expect(() => instance.with({ title: '' })).toThrow()
    })

    test('returns BundleInstance', () => {
      const instance = createMinimalBundle()
      const modified = instance.with({ title: 'New Title' })
      expect(modified).toBeInstanceOf(BundleInstance)
    })
  })

  // ============================================================================
  // Static from() Method
  // ============================================================================

  describe('static from()', () => {
    test('parses valid bundle object', () => {
      const input = {
        kind: 'bundle' as const,
        name: 'parsed-bundle',
        version: '1.0.0',
        title: 'Parsed Bundle',
        contents: [],
      }
      const instance = bundle.from(input)
      expect(instance.name).toBe('parsed-bundle')
    })

    test('throws for invalid input', () => {
      expect(() => bundle.from({})).toThrow()
    })
  })

  // ============================================================================
  // Static safeFrom() Method
  // ============================================================================

  describe('static safeFrom()', () => {
    test('returns success for valid input', () => {
      const input = {
        kind: 'bundle' as const,
        name: 'safe-bundle',
        version: '1.0.0',
        title: 'Safe Bundle',
        contents: [],
      }
      const result = bundle.safeFrom(input)
      expect(result.success).toBe(true)
    })

    test('returns error for invalid input', () => {
      const result = bundle.safeFrom({})
      expect(result.success).toBe(false)
    })
  })

  // ============================================================================
  // Content Builder Methods
  // ============================================================================

  describe('content builder methods', () => {
    test('inline() adds inline content', () => {
      const instance = bundle()
        .name('test')
        .version('1.0.0')
        .title('Test')
        .inline(
          'doc',
          document().name('doc').version('1.0.0').title('Doc').build()
        )
        .build()

      expect(instance.contents).toHaveLength(1)
      expect(instance.contents[0]?.type).toBe('inline')
      expect((instance.contents[0] as any)?.key).toBe('doc')
    })

    test('registry() adds registry reference', () => {
      const instance = bundle()
        .name('test')
        .version('1.0.0')
        .title('Test')
        .registry('ext', '@org/form')
        .build()

      expect(instance.contents).toHaveLength(1)
      expect(instance.contents[0]?.type).toBe('registry')
      expect((instance.contents[0] as any)?.slug).toBe('@org/form')
    })

    test('registry() with include condition', () => {
      const instance = bundle()
        .name('test')
        .version('1.0.0')
        .title('Test')
        .expr('showForm', 'true')
        .registry('ext', '@org/form', 'showForm')
        .build()

      expect((instance.contents[0] as any)?.include).toBe('showForm')
    })

    test('path() adds path reference', () => {
      const instance = bundle()
        .name('test')
        .version('1.0.0')
        .title('Test')
        .path('local', '/path/to/artifact.yaml')
        .build()

      expect(instance.contents).toHaveLength(1)
      expect(instance.contents[0]?.type).toBe('path')
      expect((instance.contents[0] as any)?.path).toBe('/path/to/artifact.yaml')
    })

    test('path() with include condition', () => {
      const instance = bundle()
        .name('test')
        .version('1.0.0')
        .title('Test')
        .path('local', '/path/to/artifact.yaml', 'includeLocal')
        .build()

      expect((instance.contents[0] as any)?.include).toBe('includeLocal')
    })
  })

  // ============================================================================
  // Logic Methods
  // ============================================================================

  describe('logic methods', () => {
    test('logic() sets entire logic section', () => {
      const instance = bundle()
        .name('test')
        .version('1.0.0')
        .title('Test')
        .logic({ a: 'true', b: 'a == true' })
        .build()

      expect(instance.logic?.a).toBe('true')
      expect(instance.logic?.b).toBe('a == true')
    })

    test('expr() adds individual expression', () => {
      const instance = bundle()
        .name('test')
        .version('1.0.0')
        .title('Test')
        .expr('isActive', 'true')
        .expr('showForm', 'isActive')
        .build()

      expect(instance.logic?.isActive).toBe('true')
      expect(instance.logic?.showForm).toBe('isActive')
    })
  })

  // ============================================================================
  // Nested Bundle Support
  // ============================================================================

  describe('nested bundles', () => {
    test('can contain nested bundle', () => {
      const innerBundle = bundle()
        .name('inner')
        .version('1.0.0')
        .title('Inner Bundle')
        .build()

      const outerBundle = bundle()
        .name('outer')
        .version('1.0.0')
        .title('Outer Bundle')
        .inline('nested', innerBundle)
        .build()

      expect(outerBundle.contents).toHaveLength(1)
      expect(outerBundle.contents[0]?.type).toBe('inline')
      const inlineContent = outerBundle.contents[0] as any
      expect(inlineContent.artifact.kind).toBe('bundle')
      expect(inlineContent.artifact.name).toBe('inner')
    })
  })
})
