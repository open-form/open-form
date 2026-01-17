import { describe, test, expect } from 'vitest'
import { document } from '@/builders/artifacts/document'

describe('Document (Builder Pattern)', () => {
  describe('fluent builder API', () => {
    describe('success cases', () => {
      test('builds valid document with only name (minimal)', () => {
        const result = document()
          .name('privacy-policy')
          .build()
        expect(result.kind).toBe('document')
        expect(result.name).toBe('privacy-policy')
        expect(result.version).toBeUndefined()
        expect(result.title).toBeUndefined()
      })

      test('builds valid document with name and version', () => {
        const result = document()
          .name('terms-doc')
          .version('1.0.0')
          .build()
        expect(result.kind).toBe('document')
        expect(result.name).toBe('terms-doc')
        expect(result.version).toBe('1.0.0')
        expect(result.title).toBeUndefined()
      })

      test('builds valid document with name, version, and title', () => {
        const result = document()
          .name('privacy-policy')
          .version('1.0.0')
          .title('Privacy Policy')
          .build()
        expect(result.kind).toBe('document')
        expect(result.name).toBe('privacy-policy')
        expect(result.version).toBe('1.0.0')
        expect(result.title).toBe('Privacy Policy')
      })

      test('builds document with inline layer', () => {
        const result = document()
          .name('terms')
          .version('1.0.0')
          .title('Terms of Service')
          .inlineLayer('default', 'text/markdown', '# Terms of Service\n\nPlease read carefully.')
          .defaultLayer('default')
          .build()
        expect(result.layers).toBeDefined()
        expect(result.layers?.default?.kind).toBe('inline')
        if (result.layers?.default?.kind === 'inline') {
          expect(result.layers.default.text).toContain('Terms of Service')
        }
      })

      test('builds document with file layer', () => {
        const result = document()
          .name('contract')
          .version('1.0.0')
          .title('Contract')
          .fileLayer('pdf', 'application/pdf', '/documents/contract.pdf')
          .defaultLayer('pdf')
          .build()
        expect(result.layers).toBeDefined()
        expect(result.layers?.pdf?.kind).toBe('file')
        if (result.layers?.pdf?.kind === 'file') {
          expect(result.layers.pdf.path).toBe('/documents/contract.pdf')
        }
      })

      test('builds document with multiple layers', () => {
        const result = document()
          .name('disclosure')
          .version('1.0.0')
          .title('Disclosure')
          .inlineLayer('markdown', 'text/markdown', '# Disclosure')
          .fileLayer('pdf', 'application/pdf', '/documents/disclosure.pdf')
          .defaultLayer('markdown')
          .build()
        expect(Object.keys(result.layers || {})).toHaveLength(2)
      })

      test('builds document with description', () => {
        const result = document()
          .name('guide')
          .version('1.0.0')
          .title('User Guide')
          .description('A comprehensive user guide.')
          .build()
        expect(result.description).toBe('A comprehensive user guide.')
      })

      test('builds document with code', () => {
        const result = document()
          .name('policy')
          .version('1.0.0')
          .title('Policy')
          .code('DOC-001')
          .build()
        expect(result.code).toBe('DOC-001')
      })

      test('builds document with metadata', () => {
        const result = document()
          .name('report')
          .version('1.0.0')
          .title('Annual Report')
          .metadata({
            year: '2024',
            department: 'Finance',
          })
          .build()
        expect(result.metadata?.year).toBe('2024')
      })

      test('builds document with all properties', () => {
        const result = document()
          .name('complete-doc')
          .version('1.0.0')
          .title('Complete Document')
          .description('A fully configured document')
          .code('DOC-001')
          .metadata({ author: 'Test' })
          .inlineLayer('default', 'text/plain', 'Content here')
          .defaultLayer('default')
          .build()
        expect(result.name).toBe('complete-doc')
        expect(result.title).toBe('Complete Document')
        expect(result.description).toBe('A fully configured document')
        expect(result.code).toBe('DOC-001')
        expect(result.layers).toBeDefined()
        expect(result.defaultLayer).toBe('default')
      })

      test('supports method chaining', () => {
        const result = document()
          .name('chained')
          .version('1.0.0')
          .title('Chained Document')
          .description('Description')
          .code('CODE-001')
          .build()
        expect(result.name).toBe('chained')
        expect(result.title).toBe('Chained Document')
      })
    })

    describe('validation failures on build()', () => {
      test('throws error when name is empty string', () => {
        expect(() =>
          document()
            .name('')
            .version('1.0.0')
            .title('Test')
            .build()
        ).toThrow()
      })

      test('throws error when title is empty string', () => {
        expect(() =>
          document()
            .name('test')
            .version('1.0.0')
            .title('')
            .build()
        ).toThrow()
      })

      test('throws error when name has invalid pattern', () => {
        expect(() =>
          document()
            .name('-invalid')
            .version('1.0.0')
            .title('Test')
            .build()
        ).toThrow()
      })
    })

    describe('builder instance behavior', () => {
      test('returns builder instance when called with no arguments', () => {
        const builder = document()
        expect(builder).toBeDefined()
        expect(typeof builder.name).toBe('function')
        expect(typeof builder.title).toBe('function')
        expect(typeof builder.inlineLayer).toBe('function')
        expect(typeof builder.fileLayer).toBe('function')
        expect(typeof builder.build).toBe('function')
      })

      test('builder methods return this for chaining', () => {
        const builder = document()
        const afterName = builder.name('test').version('1.0.0')
        const afterTitle = afterName.title('Test')
        expect(afterName).toBe(builder)
        expect(afterTitle).toBe(builder)
      })

      test('multiple builders are independent', () => {
        const builder1 = document().name('doc1').version('1.0.0').title('Doc 1')
        const builder2 = document().name('doc2').version('1.0.0').title('Doc 2')
        expect(builder1.build().name).toBe('doc1')
        expect(builder2.build().name).toBe('doc2')
      })
    })
  })
})
