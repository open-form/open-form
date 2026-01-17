import { describe, test, expect } from 'vitest'
import { bundle } from '@/builders/artifacts/bundle'
import type { Bundle, BundleContentItem } from '@open-form/types'

describe('Bundle (Object Pattern)', () => {
  describe('bundle() - direct validation', () => {
    describe('success cases', () => {
      test('creates valid bundle with minimal required properties', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'rental-package',
          title: 'Rental Package',
          contents: [],
        }
        const result = bundle(input)
        expect(result.kind).toBe('bundle')
        expect(result.name).toBe('rental-package')
        expect(result.title).toBe('Rental Package')
      })

      test('creates bundle with inline document', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'disclosure-bundle',
          title: 'Disclosure Bundle',
          contents: [
            {
              type: 'inline',
              key: 'privacy',
              artifact: {
                kind: 'document',
                version: '1.0.0',
                name: 'privacy-policy',
                title: 'Privacy Policy',
              },
            },
          ],
        }
        const result = bundle(input)
        expect(result.contents).toHaveLength(1)
        expect(result.contents[0]?.type).toBe('inline')
      })

      test('creates bundle with registry reference', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'form-bundle',
          title: 'Form Bundle',
          contents: [
            {
              type: 'registry',
              key: 'lease',
              slug: '@company/lease-agreement',
            },
          ],
        }
        const result = bundle(input)
        expect(result.contents).toHaveLength(1)
        const item = result.contents[0] as BundleContentItem & { type: 'registry' }
        expect(item.slug).toBe('@company/lease-agreement')
      })

      test('creates bundle with path reference', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'local-bundle',
          title: 'Local Bundle',
          contents: [
            {
              type: 'path',
              key: 'terms',
              path: '/artifacts/terms.yaml',
            },
          ],
        }
        const result = bundle(input)
        expect(result.contents).toHaveLength(1)
        const item = result.contents[0] as BundleContentItem & { type: 'path' }
        expect(item.path).toBe('/artifacts/terms.yaml')
      })

      test('creates bundle with include condition', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'conditional-bundle',
          title: 'Conditional Bundle',
          logic: {
            hasPets: 'true',
          },
          contents: [
            {
              type: 'registry',
              key: 'pet-addendum',
              slug: '@company/pet-addendum',
              include: 'hasPets',
            },
          ],
        }
        const result = bundle(input)
        const item = result.contents[0] as BundleContentItem & { type: 'registry' }
        expect(item.include).toBe('hasPets')
      })

      test('creates bundle with logic section', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'logic-bundle',
          title: 'Logic Bundle',
          logic: {
            isActive: 'true',
            showExtra: 'isActive == true',
          },
          contents: [],
        }
        const result = bundle(input)
        expect(result.logic?.isActive).toBe('true')
        expect(result.logic?.showExtra).toBe('isActive == true')
      })

      test('creates bundle with nested bundle', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'outer-bundle',
          title: 'Outer Bundle',
          contents: [
            {
              type: 'inline',
              key: 'inner',
              artifact: {
                kind: 'bundle',
                version: '1.0.0',
                name: 'inner-bundle',
                title: 'Inner Bundle',
                contents: [],
              },
            },
          ],
        }
        const result = bundle(input)
        expect(result.contents).toHaveLength(1)
        const item = result.contents[0] as BundleContentItem & { type: 'inline' }
        expect(item.artifact.kind).toBe('bundle')
      })

      test('creates bundle with description', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'described-bundle',
          title: 'Described Bundle',
          description: 'A bundle with a description',
          contents: [],
        }
        const result = bundle(input)
        expect(result.description).toBe('A bundle with a description')
      })

      test('creates bundle with code', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'coded-bundle',
          title: 'Coded Bundle',
          code: 'BUN-001',
          contents: [],
        }
        const result = bundle(input)
        expect(result.code).toBe('BUN-001')
      })

      test('creates bundle with metadata', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'metadata-bundle',
          title: 'Metadata Bundle',
          metadata: {
            author: 'Test',
            category: 'Rental',
          },
          contents: [],
        }
        const result = bundle(input)
        expect(result.metadata?.author).toBe('Test')
      })

      test('creates bundle with mixed content types', () => {
        const input: Bundle = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'mixed-bundle',
          title: 'Mixed Bundle',
          contents: [
            {
              type: 'inline',
              key: 'doc',
              artifact: {
                kind: 'document',
                version: '1.0.0',
                name: 'doc',
                title: 'Doc',
              },
            },
            {
              type: 'registry',
              key: 'ext',
              slug: '@org/form',
            },
            {
              type: 'path',
              key: 'local',
              path: '/local/artifact.yaml',
            },
          ],
        }
        const result = bundle(input)
        expect(result.contents).toHaveLength(3)
      })
    })

    describe('validation failures', () => {
      test('throws error when name is missing', () => {
        const input = {
          kind: 'bundle',
          version: '1.0.0',
          title: 'Test',
          contents: [],
        } as any
        expect(() => bundle(input)).toThrow()
      })

      test('throws error when contents is missing', () => {
        const input = {
          kind: 'bundle',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
        } as any
        expect(() => bundle(input)).toThrow()
      })

      test('throws error when name is empty string', () => {
        const input = {
          kind: 'bundle',
          version: '1.0.0',
          name: '',
          title: 'Test',
          contents: [],
        } as any
        expect(() => bundle(input)).toThrow()
      })

      test('throws error when name has invalid pattern', () => {
        const input = {
          kind: 'bundle',
          version: '1.0.0',
          name: '-invalid',
          title: 'Test',
          contents: [],
        } as any
        expect(() => bundle(input)).toThrow()
      })
    })
  })

  describe('bundle.safeParse()', () => {
    test('returns success for valid bundle', () => {
      const input = {
        kind: 'bundle',
        version: '1.0.0',
        name: 'test-bundle',
        title: 'Test Bundle',
        contents: [],
      }
      const result = bundle.safeParse(input)
      expect(result.success).toBe(true)
    })

    test('returns error for invalid input', () => {
      const result = bundle.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
