import { describe, test, expect } from 'vitest'
import { applyDefaults, withDefaults } from '@/utils/apply-defaults'
import { deepClone } from '@/utils/clone'

/**
 * Tests for apply-defaults utility functions.
 *
 * These utilities apply default values from JSON Schemas to data objects.
 */
describe('apply-defaults', () => {
  // ============================================================================
  // deepClone Tests
  // ============================================================================

  describe('deepClone()', () => {
    test('clones primitive values', () => {
      expect(deepClone('hello')).toBe('hello')
      expect(deepClone(42)).toBe(42)
      expect(deepClone(true)).toBe(true)
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
    })

    test('clones simple objects', () => {
      const original = { name: 'John', age: 30 }
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })

    test('clones nested objects', () => {
      const original = {
        user: {
          name: 'John',
          address: {
            city: 'NYC',
            zip: '10001',
          },
        },
      }
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned.user).not.toBe(original.user)
      expect(cloned.user.address).not.toBe(original.user.address)
    })

    test('clones arrays', () => {
      const original = [1, 2, 3, { value: 4 }]
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned[3]).not.toBe(original[3])
    })

    test('modifications to clone do not affect original', () => {
      const original = { nested: { value: 1 } }
      const cloned = deepClone(original)

      cloned.nested.value = 999

      expect(original.nested.value).toBe(1)
    })
  })

  // ============================================================================
  // applyDefaults Tests
  // ============================================================================

  describe('applyDefaults()', () => {
    describe('simple defaults', () => {
      test('applies default to undefined property', () => {
        const schema = {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Anonymous' },
          },
        }
        const data: Record<string, unknown> = {}

        const result = applyDefaults(schema, data)

        expect(result.name).toBe('Anonymous')
      })

      test('does not override existing value with default', () => {
        const schema = {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Anonymous' },
          },
        }
        const data = { name: 'John' }

        const result = applyDefaults(schema, data)

        expect(result.name).toBe('John')
      })

      test('applies multiple defaults', () => {
        const schema = {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Anonymous' },
            age: { type: 'number', default: 0 },
            active: { type: 'boolean', default: true },
          },
        }
        const data: Record<string, unknown> = {}

        const result = applyDefaults(schema, data)

        expect(result.name).toBe('Anonymous')
        expect(result.age).toBe(0)
        expect(result.active).toBe(true)
      })

      test('applies only missing defaults', () => {
        const schema = {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Anonymous' },
            age: { type: 'number', default: 0 },
          },
        }
        const data: Record<string, unknown> = { age: 25 }

        const result = applyDefaults(schema, data)

        expect(result.name).toBe('Anonymous')
        expect(result.age).toBe(25)
      })
    })

    describe('nested object defaults', () => {
      test('applies defaults to nested objects', () => {
        const schema = {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string', default: 'Anonymous' },
                settings: {
                  type: 'object',
                  properties: {
                    theme: { type: 'string', default: 'light' },
                  },
                },
              },
            },
          },
        }
        const data: { user: { name?: string; settings: { theme?: string } } } = { user: { settings: {} } }

        const result = applyDefaults(schema, data)

        expect(result.user.name).toBe('Anonymous')
        expect(result.user.settings.theme).toBe('light')
      })

      test('preserves existing nested values', () => {
        const schema = {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string', default: 'Anonymous' },
              },
            },
          },
        }
        const data = { user: { name: 'John' } }

        const result = applyDefaults(schema, data)

        expect(result.user.name).toBe('John')
      })
    })

    describe('array defaults', () => {
      test('applies defaults to array items', () => {
        const schema = {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', default: 'Item' },
                  quantity: { type: 'number', default: 1 },
                },
              },
            },
          },
        }
        const data: { items: Array<{ name?: string; quantity?: number }> } = {
          items: [{ name: 'Custom' }, {}, { quantity: 5 }],
        }

        const result = applyDefaults(schema, data)

        expect(result.items[0]!.name).toBe('Custom')
        expect(result.items[0]!.quantity).toBe(1)
        expect(result.items[1]!.name).toBe('Item')
        expect(result.items[1]!.quantity).toBe(1)
        expect(result.items[2]!.name).toBe('Item')
        expect(result.items[2]!.quantity).toBe(5)
      })

      test('handles empty arrays', () => {
        const schema = {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', default: 'Item' },
                },
              },
            },
          },
        }
        const data = { items: [] }

        const result = applyDefaults(schema, data)

        expect(result.items).toEqual([])
      })
    })

    describe('$ref handling', () => {
      test('applies defaults from $ref definitions', () => {
        const schema = {
          type: 'object',
          properties: {
            user: { $ref: '#/$defs/User' },
          },
          $defs: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string', default: 'Anonymous' },
              },
            },
          },
        }
        const data: { user: { name?: string } } = { user: {} }

        const result = applyDefaults(schema, data)

        expect(result.user.name).toBe('Anonymous')
      })

      test('handles missing $ref gracefully', () => {
        const schema = {
          type: 'object',
          properties: {
            user: { $ref: '#/$defs/NonExistent' },
          },
          $defs: {},
        }
        const data = { user: { name: 'John' } }

        const result = applyDefaults(schema, data)

        expect(result.user.name).toBe('John')
      })
    })

    describe('allOf handling', () => {
      test('merges defaults from allOf schemas', () => {
        const enabledSchema = {
          type: 'object' as const,
          properties: {
            enabled: { type: 'boolean' as const, default: true },
          },
        }
        const timeoutSchema = {
          type: 'object' as const,
          properties: {
            timeout: { type: 'number' as const, default: 30 },
          },
        }
        const schema = {
          type: 'object' as const,
          properties: {
            config: {
              allOf: [enabledSchema, timeoutSchema],
            },
          },
        }
        const data: { config: { enabled?: boolean; timeout?: number } } = { config: {} }

        const result = applyDefaults(schema, data)

        expect(result.config.enabled).toBe(true)
        expect(result.config.timeout).toBe(30)
      })
    })

    describe('anyOf/oneOf handling', () => {
      test('applies schema-level default for anyOf', () => {
        const schema = {
          type: 'object',
          properties: {
            value: {
              anyOf: [{ type: 'string' }, { type: 'number' }],
              default: 'default-value',
            },
          },
        }
        const data: Record<string, unknown> = {}

        const result = applyDefaults(schema, data)

        expect(result.value).toBe('default-value')
      })

      test('preserves existing value for anyOf', () => {
        const schema = {
          type: 'object',
          properties: {
            value: {
              anyOf: [{ type: 'string' }, { type: 'number' }],
              default: 'default-value',
            },
          },
        }
        const data = { value: 42 }

        const result = applyDefaults(schema, data)

        expect(result.value).toBe(42)
      })
    })

    describe('edge cases', () => {
      test('handles null schema gracefully', () => {
        const data = { name: 'John' }
        // @ts-expect-error - Testing null handling
        const result = applyDefaults(null, data)

        expect(result).toEqual(data)
      })

      test('handles non-object schema gracefully', () => {
        const data = { name: 'John' }
        // @ts-expect-error - Testing primitive handling
        const result = applyDefaults('invalid', data)

        expect(result).toEqual(data)
      })

      test('applies default for falsy but defined value (0)', () => {
        const schema = {
          type: 'object',
          properties: {
            count: { type: 'number', default: 10 },
          },
        }
        const data = { count: 0 }

        const result = applyDefaults(schema, data)

        expect(result.count).toBe(0) // Preserves explicit 0
      })

      test('applies default for falsy but defined value (empty string)', () => {
        const schema = {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Default' },
          },
        }
        const data = { name: '' }

        const result = applyDefaults(schema, data)

        expect(result.name).toBe('') // Preserves explicit empty string
      })

      test('applies default for falsy but defined value (false)', () => {
        const schema = {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
          },
        }
        const data = { enabled: false }

        const result = applyDefaults(schema, data)

        expect(result.enabled).toBe(false) // Preserves explicit false
      })

      test('handles complex default values (objects)', () => {
        const schema = {
          type: 'object',
          properties: {
            metadata: {
              type: 'object',
              default: { version: '1.0', created: '2024-01-01' },
            },
          },
        }
        const data: Record<string, unknown> = {}

        const result = applyDefaults(schema, data)

        expect(result.metadata).toEqual({ version: '1.0', created: '2024-01-01' })
      })

      test('handles complex default values (arrays)', () => {
        const schema = {
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              default: ['default', 'tags'],
            },
          },
        }
        const data: Record<string, unknown> = {}

        const result = applyDefaults(schema, data)

        expect(result.tags).toEqual(['default', 'tags'])
      })

      test('deep clones default values to prevent mutation', () => {
        const schema = {
          type: 'object',
          properties: {
            metadata: {
              type: 'object',
              default: { value: 1 },
            },
          },
        }
        const data1: Record<string, unknown> = {}
        const data2: Record<string, unknown> = {}

        const result1 = applyDefaults(schema, data1)
        const result2 = applyDefaults(schema, data2)

        // Modify result1's metadata
        ;(result1.metadata as Record<string, unknown>).value = 999

        // result2's metadata should be unaffected
        expect((result2.metadata as Record<string, unknown>).value).toBe(1)
      })
    })

    describe('mutation behavior', () => {
      test('mutates the original data object', () => {
        const schema = {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Anonymous' },
          },
        }
        const data: Record<string, unknown> = {}

        applyDefaults(schema, data)

        expect(data.name).toBe('Anonymous')
      })
    })
  })

  // ============================================================================
  // withDefaults Tests
  // ============================================================================

  describe('withDefaults()', () => {
    test('returns new object with defaults (non-mutating)', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'Anonymous' },
        },
      }
      const data: Record<string, unknown> = {}

      const result = withDefaults(schema, data)

      expect(result.name).toBe('Anonymous')
      expect(data.name).toBeUndefined() // Original unchanged
    })

    test('original object is not modified', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'Anonymous' },
          age: { type: 'number', default: 0 },
        },
      }
      const data: Record<string, unknown> = { age: 25 }

      const result = withDefaults(schema, data)

      expect(result.name).toBe('Anonymous')
      expect(result.age).toBe(25)
      expect(Object.keys(data)).toEqual(['age'])
    })

    test('result is a new object', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'Anonymous' },
        },
      }
      const data = { name: 'John' }

      const result = withDefaults(schema, data)

      expect(result).not.toBe(data)
      expect(result).toEqual(data)
    })

    test('nested objects are also cloned', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'Anonymous' },
            },
          },
        },
      }
      const data = { user: { name: 'John' } }

      const result = withDefaults(schema, data)

      expect(result.user).not.toBe(data.user)
    })
  })
})
