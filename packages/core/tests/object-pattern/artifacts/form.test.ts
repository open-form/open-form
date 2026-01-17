import { describe, test, expect } from 'vitest'
import { form } from '@/builders/artifacts/form'
import type { Form, EnumField } from '@open-form/types'

describe('Form (Object Pattern)', () => {
  describe('form() - direct validation', () => {
    describe('success cases', () => {
      test('creates valid form with minimal required properties', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'contact-form',
          title: 'Contact Form',
        }
        const result = form(input)
        expect(result.kind).toBe('form')
        expect(result.name).toBe('contact-form')
        expect(result.title).toBe('Contact Form')
      })

      test('creates form with fields', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'user-form',
          title: 'User Form',
          fields: {
            name: { type: 'text', label: 'Full Name' },
            email: { type: 'email', label: 'Email' },
          },
        }
        const result = form(input)
        expect(result?.fields?.name?.type).toBe('text')
        expect(result?.fields?.email?.type).toBe('email')
      })

      test('creates form with various field types', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'complex-form',
          title: 'Complex Form',
          fields: {
            textField: { type: 'text', label: 'Text' },
            numberField: { type: 'number', label: 'Number' },
            booleanField: { type: 'boolean', label: 'Boolean' },
            emailField: { type: 'email', label: 'Email' },
            enumField: { type: 'enum', enum: ['a', 'b', 'c'], label: 'Enum' } as EnumField,
            moneyField: { type: 'money', label: 'Money' },
            addressField: { type: 'address', label: 'Address' },
            phoneField: { type: 'phone', label: 'Phone' },
            coordinateField: { type: 'coordinate', label: 'Coordinate' },
          },
        }
        const result = form(input)
        expect(Object.keys(result.fields || {})).toHaveLength(9)
      })

      test('creates form with nested fieldset', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'nested-form',
          title: 'Nested Form',
          fields: {
            personal: {
              type: 'fieldset',
              label: 'Personal Info',
              fields: {
                name: { type: 'text', label: 'Name' },
                age: { type: 'number', label: 'Age' },
              },
            },
          },
        }
        const result = form(input)
        expect(result?.fields?.personal?.type).toBe('fieldset')
        const fields = result?.fields as any
        expect(fields.personal.fields.name.type).toBe('text')
      })

      test('creates form with deeply nested fieldsets', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'deeply-nested',
          title: 'Deeply Nested',
          fields: {
            level1: {
              type: 'fieldset',
              label: 'Level 1',
              fields: {
                level2: {
                  type: 'fieldset',
                  label: 'Level 2',
                  fields: {
                    level3: {
                      type: 'fieldset',
                      label: 'Level 3',
                      fields: {
                        name: { type: 'text', label: 'Name' },
                      },
                    },
                  },
                },
              },
            },
          },
        }
        const result = form(input)
        const fields = result.fields as any
        expect(fields.level1.fields.level2.fields.level3.fields.name.type).toBe('text')
      })

      test('creates form with inline template', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'form-with-template',
          title: 'Form with Template',
          layers: {
            default: {
              kind: 'inline',
              mimeType: 'text/markdown',
              text: '# Welcome\n\nPlease fill out this form.',
            },
          },
          defaultLayer: 'default',
        }
        const result = form(input)
        expect(result.layers?.default?.kind).toBe('inline')
        if (result.layers?.default?.kind === 'inline') {
          expect(result.layers.default.text).toBe('# Welcome\n\nPlease fill out this form.')
        }
      })

      test('creates form with file template', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'form-with-file-template',
          title: 'Form with File Template',
          layers: {
            pdf: {
              kind: 'file',
              mimeType: 'application/pdf',
              path: './template.pdf',
            },
          },
          defaultLayer: 'pdf',
        }
        const result = form(input)
        expect(result.layers?.pdf?.kind).toBe('file')
        if (result.layers?.pdf?.kind === 'file') {
          expect(result.layers.pdf.path).toBe('./template.pdf')
        }
      })

      test('creates form with annexes', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'form-with-annexes',
          title: 'Form with Annexes',
          annexes: [
            {
              id: 'terms',
              title: 'Terms and Conditions',
            },
          ],
        }
        const result = form(input)
        expect(result.annexes).toHaveLength(1)
        expect(result?.annexes?.[0]!.id).toBe('terms')
      })

      test('creates form with multiple annexes', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'form-with-multiple-annexes',
          title: 'Form with Multiple Annexes',
          annexes: [
            {
              id: 'terms',
              title: 'Terms and Conditions',
            },
            {
              id: 'privacy',
              title: 'Privacy Policy',
            },
            {
              id: 'agreement',
              title: 'Agreement',
            },
          ],
        }
        const result = form(input)
        expect(result.annexes).toHaveLength(3)
      })

      test('creates form with description', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'described-form',
          title: 'Described Form',
          description: 'This is a detailed description of the form.',
        }
        const result = form(input)
        expect(result.description).toBe('This is a detailed description of the form.')
      })

      test('creates form with code', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'coded-form',
          title: 'Coded Form',
          code: 'FORM-001',
        }
        const result = form(input)
        expect(result.code).toBe('FORM-001')
      })

      // Note: releaseDate validation requires TypeBox format registry configuration
      // which may not be set up in the test environment
      // test('creates form with releaseDate', () => {
      // 	const input: Form = {
      // 		kind: 'form',
      // 		name: 'dated-form',
      // 		title: 'Dated Form',
      // 		releaseDate: '2024-11-14',
      // 	};
      // 	const result = form(input);
      // 	expect(result.releaseDate).toBe('2024-11-14');
      // });

      test('creates form with metadata', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'metadata-form',
          title: 'Metadata Form',
          metadata: {
            version: '1.0',
            author: 'John Doe',
            category: 'HR',
          },
        }
        const result = form(input)
        expect(result.metadata?.version).toBe('1.0')
        expect(result.metadata?.author).toBe('John Doe')
      })

      test('creates form with all properties (except releaseDate)', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'complete-form',
          title: 'Complete Form',
          description: 'A fully configured form',
          code: 'COMPLETE-001',
          metadata: { version: '1.0' },
          fields: {
            name: { type: 'text', label: 'Name', required: true },
            email: { type: 'email', label: 'Email', required: true },
          },
          layers: {
            default: {
              kind: 'inline',
              mimeType: 'text/markdown',
              text: '# Instructions\n\nPlease complete all required fields.',
            },
          },
          defaultLayer: 'default',
          annexes: [
            {
              id: 'guide',
              title: 'User Guide',
            },
          ],
        }
        const result = form(input)
        // allowAnnexes has a default value of false, so it will be added during parsing
        // Compare the raw form data (schema) since form() now returns FormInstance
        expect(result.schema).toEqual({ ...input, allowAnnexes: false })
      })

      test('creates form with valid name patterns', () => {
        const validNames = [
          'simple',
          'with-dash',
          'PascalCase',
          'camelCase',
          'with-multiple-dashes',
          '123numeric',
          'abc123def',
          'a',
          'A',
          '1',
        ]

        for (const name of validNames) {
          const input: Form = {
            kind: 'form',
            version: '1.0.0',
            name,
            title: 'Test Form',
          }
          const result = form(input)
          expect(result.name).toBe(name)
        }
      })

      test('creates form with long valid name', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'a'.repeat(128),
          title: 'Test Form',
        }
        const result = form(input)
        expect(result.name).toHaveLength(128)
      })

      test('creates form with long valid title', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'T'.repeat(200),
        }
        const result = form(input)
        expect(result.title).toHaveLength(200)
      })

      test('creates form with long valid description', () => {
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
          description: 'D'.repeat(2000),
        }
        const result = form(input)
        expect(result.description).toHaveLength(2000)
      })

      test('creates form with many fields', () => {
        const fields: Form['fields'] = {}
        for (let i = 0; i < 50; i++) {
          fields[`field${i}`] = { type: 'text', label: `Field ${i}` }
        }
        const input: Form = {
          kind: 'form',
          version: '1.0.0',
          name: 'many-fields',
          title: 'Many Fields',
          fields,
        }
        const result = form(input)
        expect(Object.keys(result.fields || {})).toHaveLength(50)
      })
    })

    describe('validation failures', () => {
      test('corrects kind when incorrect value is provided', () => {
        // The builder ensures kind is always 'form' regardless of input
        const input = {
          kind: 'invalid', // Wrong kind - will be overridden
          version: '1.0.0',
          name: 'test',
          title: 'Test',
        } as any
        const result = form(input)
        expect(result.schema.kind).toBe('form')
      })

      test('throws error when name is missing', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          title: 'Test',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when name is empty string', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: '',
          title: 'Test',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when title is empty string', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: '',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when name exceeds maxLength', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'a'.repeat(129),
          title: 'Test',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when title exceeds maxLength', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'T'.repeat(201),
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when description exceeds maxLength', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
          description: 'D'.repeat(2001),
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when code is empty string', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
          code: '',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when name has invalid pattern (starts with dash)', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: '-invalid',
          title: 'Test',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when name has invalid pattern (ends with dash)', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'invalid-',
          title: 'Test',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when name has invalid pattern (consecutive dashes)', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'invalid--name',
          title: 'Test',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when name has invalid pattern (underscore)', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'invalid_name',
          title: 'Test',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when name has invalid pattern (special chars)', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'invalid@name',
          title: 'Test',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when releaseDate has invalid format', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
          releaseDate: 'invalid-date',
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when field definition is invalid', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
          fields: {
            invalid: { type: 'invalid-type' },
          },
        } as any
        expect(() => form(input)).toThrow()
      })

      test('throws error when annex is invalid', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
          annexes: [
            {
              id: '',
              title: 'Invalid',
            },
          ],
        } as any
        expect(() => form(input)).toThrow()
      })

      test('strips additional properties', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
          extra: 'should be removed',
        } as any
        const result = form(input)
        expect(result).not.toHaveProperty('extra')
      })

      test('throws error when input is null', () => {
        expect(() => form(null as any)).toThrow()
      })

      test('throws error when input is a string', () => {
        expect(() => form('not an object' as any)).toThrow()
      })

      test('throws error when input is a number', () => {
        expect(() => form(123 as any)).toThrow()
      })

      test('throws error when input is an array', () => {
        expect(() => form([{ kind: 'form', name: 'test', title: 'Test' }] as any)).toThrow()
      })
    })
  })

  describe('form.parse()', () => {
    describe('success cases', () => {
      test('parses valid form', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test-form',
          title: 'Test Form',
        }
        const result = form.parse(input)
        // allowAnnexes has a default value of false, so it will be added during parsing
        expect(result).toEqual({ ...input, allowAnnexes: false })
      })

      test('parses form with fields', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'user-form',
          title: 'User Form',
          fields: {
            name: { type: 'text', label: 'Name' },
          },
        }
        const result = form.parse(input)
        expect(result.fields?.name!.type).toBe('text')
      })

      test('parses form with template', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'form-with-template',
          title: 'Form with Template',
          layers: {
            default: {
              kind: 'inline',
              mimeType: 'text/plain',
              text: 'Content here',
            },
          },
        }
        const result = form.parse(input)
        expect(result.layers?.default?.kind).toBe('inline')
        if (result.layers?.default?.kind === 'inline') {
          expect(result.layers.default.text).toBe('Content here')
        }
      })

      test('parses form with annexes', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'form-with-annexes',
          title: 'Form with Annexes',
          annexes: [
            {
              id: 'annex1',
              title: 'Annex 1',
            },
          ],
        }
        const result = form.parse(input)
        expect(result.annexes).toHaveLength(1)
      })
    })

    describe('validation failures', () => {
      test('throws error for missing name', () => {
        const input = { kind: 'form', title: 'Test' }
        expect(() => form.parse(input)).toThrow()
      })

      test('throws error for null input', () => {
        expect(() => form.parse(null)).toThrow()
      })

      test('throws error for undefined input', () => {
        expect(() => form.parse(undefined)).toThrow()
      })

      test('throws error for invalid input type', () => {
        expect(() => form.parse('string')).toThrow()
      })
    })
  })

  describe('form.safeParse()', () => {
    describe('success cases', () => {
      test('returns success for valid form', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test-form',
          title: 'Test Form',
        }
        const result = form.safeParse(input)
        expect(result.success).toBe(true)
        if (result.success) {
          // allowAnnexes has a default value of false, so it will be added during parsing
          expect(result.data).toEqual({ ...input, allowAnnexes: false })
        }
      })

      test('returns success for form with all properties (except releaseDate)', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'complete-form',
          title: 'Complete Form',
          description: 'Description',
          code: 'CODE-001',
          metadata: { version: '1.0' },
          fields: {
            name: { type: 'text', label: 'Name' },
          },
          layers: {
            default: {
              kind: 'inline',
              mimeType: 'text/plain',
              text: 'Content',
            },
          },
          annexes: [
            {
              id: 'annex1',
              title: 'Annex 1',
            },
          ],
        }
        const result = form.safeParse(input)
        expect(result.success).toBe(true)
      })
    })

    describe('failure cases', () => {
      test('returns error for missing name', () => {
        const input = { kind: 'form', title: 'Test' }
        const result = form.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeInstanceOf(Error)
        }
      })

      test('returns error for empty name', () => {
        const input = { kind: 'form', name: '', title: 'Test' }
        const result = form.safeParse(input)
        expect(result.success).toBe(false)
      })

      test('returns error for empty title', () => {
        const input = { kind: 'form', name: 'test', title: '' }
        const result = form.safeParse(input)
        expect(result.success).toBe(false)
      })

      test('returns error for null input', () => {
        const result = form.safeParse(null)
        expect(result.success).toBe(false)
      })

      test('returns error for undefined input', () => {
        const result = form.safeParse(undefined)
        expect(result.success).toBe(false)
      })

      test('returns error for invalid input type', () => {
        const result = form.safeParse('string')
        expect(result.success).toBe(false)
      })

      test('returns error for invalid name pattern', () => {
        const input = { kind: 'form', name: '-invalid', title: 'Test' }
        const result = form.safeParse(input)
        expect(result.success).toBe(false)
      })

      test('returns error for name too long', () => {
        const input = { kind: 'form', name: 'a'.repeat(129), title: 'Test' }
        const result = form.safeParse(input)
        expect(result.success).toBe(false)
      })

      test('strips additional properties', () => {
        const input = {
          kind: 'form',
          version: '1.0.0',
          name: 'test',
          title: 'Test',
          extra: 'removed',
        }
        const result = form.safeParse(input)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).not.toHaveProperty('extra')
        }
      })
    })
  })
})
