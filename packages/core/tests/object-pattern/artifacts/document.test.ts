import { describe, test, expect } from 'vitest'
import { document } from '@/builders/artifacts/document'
import type { Document } from '@open-form/types'

describe('Document (Object Pattern)', () => {
  describe('document() - direct validation', () => {
    describe('success cases', () => {
      test('creates valid document with minimal required properties', () => {
        const input: Document = {
          kind: 'document',
          version: '1.0.0',
          name: 'privacy-policy',
          title: 'Privacy Policy',
        }
        const result = document(input)
        expect(result.kind).toBe('document')
        expect(result.name).toBe('privacy-policy')
        expect(result.title).toBe('Privacy Policy')
      })

      test('creates document with inline layer', () => {
        const input: Document = {
          kind: 'document',
          version: '1.0.0',
          name: 'terms',
          title: 'Terms of Service',
          layers: {
            default: {
              kind: 'inline',
              mimeType: 'text/markdown',
              text: '# Terms of Service\n\nPlease read carefully.',
            },
          },
          defaultLayer: 'default',
        }
        const result = document(input)
        expect(result.layers?.default?.kind).toBe('inline')
        if (result.layers?.default?.kind === 'inline') {
          expect(result.layers.default.text).toContain('Terms of Service')
        }
      })

      test('creates document with file layer', () => {
        const input: Document = {
          kind: 'document',
          version: '1.0.0',
          name: 'contract',
          title: 'Contract',
          layers: {
            pdf: {
              kind: 'file',
              mimeType: 'application/pdf',
              path: '/documents/contract.pdf',
            },
          },
          defaultLayer: 'pdf',
        }
        const result = document(input)
        expect(result.layers?.pdf?.kind).toBe('file')
        if (result.layers?.pdf?.kind === 'file') {
          expect(result.layers.pdf.path).toBe('/documents/contract.pdf')
        }
      })

      test('creates document with multiple layers', () => {
        const input: Document = {
          kind: 'document',
          version: '1.0.0',
          name: 'disclosure',
          title: 'Disclosure',
          layers: {
            markdown: {
              kind: 'inline',
              mimeType: 'text/markdown',
              text: '# Disclosure',
            },
            pdf: {
              kind: 'file',
              mimeType: 'application/pdf',
              path: '/documents/disclosure.pdf',
            },
          },
          defaultLayer: 'markdown',
        }
        const result = document(input)
        expect(Object.keys(result.layers || {})).toHaveLength(2)
      })

      test('creates document with description', () => {
        const input: Document = {
          kind: 'document',
          version: '1.0.0',
          name: 'guide',
          title: 'User Guide',
          description: 'A comprehensive user guide.',
        }
        const result = document(input)
        expect(result.description).toBe('A comprehensive user guide.')
      })

      test('creates document with code', () => {
        const input: Document = {
          kind: 'document',
          version: '1.0.0',
          name: 'policy',
          title: 'Policy',
          code: 'DOC-001',
        }
        const result = document(input)
        expect(result.code).toBe('DOC-001')
      })

      test('creates document with metadata', () => {
        const input: Document = {
          kind: 'document',
          version: '1.0.0',
          name: 'report',
          title: 'Annual Report',
          metadata: {
            year: '2024',
            department: 'Finance',
          },
        }
        const result = document(input)
        expect(result.metadata?.year).toBe('2024')
      })
    })

    describe('validation failures', () => {
      test('throws error when kind is missing', () => {
        const input = {
          name: 'test',
          title: 'Test',
        } as any
        expect(() => document(input)).toThrow()
      })

      test('throws error when name is missing', () => {
        const input = {
          kind: 'document',
          version: '1.0.0',
          title: 'Test',
        } as any
        expect(() => document(input)).toThrow()
      })

      test('throws error when title is missing', () => {
        const input = {
          kind: 'document',
          version: '1.0.0',
          name: 'test',
        } as any
        expect(() => document(input)).toThrow()
      })

      test('throws error when name is empty string', () => {
        const input = {
          kind: 'document',
          version: '1.0.0',
          name: '',
          title: 'Test',
        } as any
        expect(() => document(input)).toThrow()
      })

      test('throws error when name has invalid pattern', () => {
        const input = {
          kind: 'document',
          version: '1.0.0',
          name: '-invalid',
          title: 'Test',
        } as any
        expect(() => document(input)).toThrow()
      })
    })
  })

  describe('document.safeParse()', () => {
    test('returns success for valid document', () => {
      const input = {
        kind: 'document',
        version: '1.0.0',
        name: 'test-doc',
        title: 'Test Document',
      }
      const result = document.safeParse(input)
      expect(result.success).toBe(true)
    })

    test('returns error for invalid input', () => {
      const result = document.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
