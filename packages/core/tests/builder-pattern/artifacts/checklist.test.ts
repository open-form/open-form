import '@/utils/formats' // Initialize TypeBox format validators
import { describe, test, expect } from 'vitest'
import { checklist } from '@/builders/artifacts/checklist'

describe('Checklist (Builder Pattern)', () => {
  describe('fluent builder API', () => {
    describe('success cases', () => {
      test('builds valid checklist with minimal required properties', () => {
        const result = checklist()
          .name('task-list')
          .version('1.0.0')
          .version('1.0.0')
          .title('Task List')
          .item({ id: 'task-1', title: 'First task' })
          .build()
        expect(result.kind).toBe('checklist')
        expect(result.name).toBe('task-list')
        expect(result.title).toBe('Task List')
        expect(result.items).toHaveLength(1)
      })

      test('builds checklist with multiple items using item()', () => {
        const result = checklist()
          .name('multi-task')
          .version('1.0.0')
          .version('1.0.0')
          .title('Multi Task List')
          .item({ id: 'task-1', title: 'Task 1' })
          .item({ id: 'task-2', title: 'Task 2' })
          .item({ id: 'task-3', title: 'Task 3' })
          .build()
        expect(result.items).toHaveLength(3)
      })

      test('builds checklist with items using items()', () => {
        const result = checklist()
          .name('bulk-items')
          .version('1.0.0')
          .title('Bulk Items')
          .items([
            { id: 'task-1', title: 'Task 1' },
            { id: 'task-2', title: 'Task 2' },
            { id: 'task-3', title: 'Task 3' },
          ])
          .build()
        expect(result.items).toHaveLength(3)
      })

      test('builds checklist with boolean status items using helper', () => {
        const result = checklist()
          .name('boolean-checklist')
          .version('1.0.0')
          .version('1.0.0')
          .title('Boolean Checklist')
          .itemWithBooleanStatus('task-1', 'Task 1', { default: false })
          .itemWithBooleanStatus('task-2', 'Task 2', { default: true })
          .build()
        expect(result.items).toHaveLength(2)
        const items = result.items as any
        expect(items[0].status?.kind).toBe('boolean')
        expect(items[0].status?.default).toBe(false)
        expect(items[1].status?.default).toBe(true)
      })

      test('builds checklist with boolean status and description', () => {
        const result = checklist()
          .name('described-boolean')
          .version('1.0.0')
          .version('1.0.0')
          .title('Described Boolean')
          .itemWithBooleanStatus('task-1', 'Task 1', {
            description: 'Task description',
            default: false,
          })
          .build()
        expect(result.items).toHaveLength(1)
        const items = result.items as any
        expect(items[0].description).toBe('Task description')
        expect(items[0].status?.kind).toBe('boolean')
      })

      test('builds checklist with enum status items using helper', () => {
        const result = checklist()
          .name('enum-checklist')
          .version('1.0.0')
          .version('1.0.0')
          .title('Enum Checklist')
          .itemWithEnumStatus('task-1', 'Task 1', {
            statusOptions: [
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ],
            defaultStatus: 'todo',
          })
          .build()
        expect(result.items).toHaveLength(1)
        const items = result.items as any
        expect(items[0].status?.kind).toBe('enum')
        expect(items[0].status?.options).toHaveLength(3)
        expect(items[0].status?.default).toBe('todo')
      })

      test('builds checklist with enum status and description', () => {
        const result = checklist()
          .name('described-enum')
          .version('1.0.0')
          .version('1.0.0')
          .title('Described Enum')
          .itemWithEnumStatus('task-1', 'Task 1', {
            description: 'Task description',
            statusOptions: [
              { value: 'a', label: 'A' },
              { value: 'b', label: 'B' },
            ],
          })
          .build()
        expect(result.items).toHaveLength(1)
        const items = result.items as any
        expect(items[0].description).toBe('Task description')
        expect(items[0].status?.kind).toBe('enum')
      })

      test('builds checklist with mixed status types', () => {
        const result = checklist()
          .name('mixed-status')
          .version('1.0.0')
          .title('Mixed Status')
          .item({
            id: 'task-1',
            title: 'Task 1',
            status: {
              kind: 'boolean',
              default: true,
            },
          })
          .item({
            id: 'task-2',
            title: 'Task 2',
            status: {
              kind: 'enum',
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
              ],
            },
          })
          .item({
            id: 'task-3',
            title: 'Task 3',
          })
          .build()
        expect(result.items).toHaveLength(3)
        const items = result.items as any
        expect(items[0].status?.kind).toBe('boolean')
        expect(items[1].status?.kind).toBe('enum')
        expect(items[2].status).toBeUndefined()
      })

      test('builds checklist with description', () => {
        const result = checklist()
          .name('described-checklist')
          .version('1.0.0')
          .title('Described Checklist')
          .description('This is a detailed description.')
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.description).toBe('This is a detailed description.')
      })

      test('builds checklist with code', () => {
        const result = checklist()
          .name('coded-checklist')
          .version('1.0.0')
          .title('Coded Checklist')
          .code('CHECK-001')
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.code).toBe('CHECK-001')
      })

      test('builds checklist with metadata', () => {
        const result = checklist()
          .name('metadata-checklist')
          .version('1.0.0')
          .title('Metadata Checklist')
          .metadata({
            version: '1.0',
            author: 'John Doe',
            category: 'QA',
          })
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.metadata?.version).toBe('1.0')
        expect(result.metadata?.author).toBe('John Doe')
      })

      test('builds checklist with all properties', () => {
        const result = checklist()
          .name('complete-checklist')
          .version('1.0.0')
          .title('Complete Checklist')
          .description('A fully configured checklist')
          .code('COMPLETE-001')
          .metadata({ version: '1.0', author: 'Jane Smith' })
          .items([
            {
              id: 'task-1',
              title: 'Task 1',
              description: 'First task',
              status: {
                kind: 'boolean',
                default: false,
              },
            },
            {
              id: 'task-2',
              title: 'Task 2',
              description: 'Second task',
              status: {
                kind: 'enum',
                options: [
                  { value: 'new', label: 'New' },
                  { value: 'done', label: 'Done' },
                ],
                default: 'new',
              },
            },
          ])
          .build()
        expect(result.name).toBe('complete-checklist')
        expect(result.title).toBe('Complete Checklist')
        expect(result.description).toBe('A fully configured checklist')
        expect(result.code).toBe('COMPLETE-001')
        expect(result.metadata?.version).toBe('1.0')
        expect(result.items).toHaveLength(2)
      })

      test('supports method chaining', () => {
        const result = checklist()
          .name('chained')
          .version('1.0.0')
          .title('Chained Checklist')
          .description('Description')
          .code('CODE-001')
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.name).toBe('chained')
        expect(result.title).toBe('Chained Checklist')
      })

      test('allows overwriting name', () => {
        const result = checklist()
          .name('original')
          .version('1.0.0')
          .name('updated')
          .version('1.0.0')
          .title('Test')
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.name).toBe('updated')
      })

      test('allows overwriting title', () => {
        const result = checklist()
          .name('test')
          .version('1.0.0')
          .title('Original')
          .title('Updated')
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.title).toBe('Updated')
      })

      test('allows overwriting description', () => {
        const result = checklist()
          .name('test')
          .version('1.0.0')
          .title('Test')
          .description('Original')
          .description('Updated')
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.description).toBe('Updated')
      })

      test('items() overwrites previous items', () => {
        const result = checklist()
          .name('mixed-items')
          .version('1.0.0')
          .title('Mixed Items')
          .item({ id: 'task-1', title: 'Task 1' })
          .items([
            { id: 'task-2', title: 'Task 2' },
            { id: 'task-3', title: 'Task 3' },
          ])
          .item({ id: 'task-4', title: 'Task 4' })
          .build()
        // items() overwrites previous items, then item() adds to that
        expect(result.items).toHaveLength(3)
        const items = result.items as any
        expect(items[0].id).toBe('task-2')
        expect(items[1].id).toBe('task-3')
        expect(items[2].id).toBe('task-4')
      })

      test('builds checklist with valid name patterns', () => {
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
          const result = checklist()
            .name(name)
          .version('1.0.0')
            .title('Test')
            .item({ id: 'task-1', title: 'Task 1' })
            .build()
          expect(result.name).toBe(name)
        }
      })

      test('builds checklist with long valid name', () => {
        const result = checklist()
          .name('a'.repeat(128))
          .version('1.0.0')
          .title('Test')
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.name).toHaveLength(128)
      })

      test('builds checklist with long valid title', () => {
        const result = checklist()
          .name('test')
          .version('1.0.0')
          .title('T'.repeat(200))
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.title).toHaveLength(200)
      })

      test('builds checklist with long valid description', () => {
        const result = checklist()
          .name('test')
          .version('1.0.0')
          .title('Test')
          .description('D'.repeat(2000))
          .item({ id: 'task-1', title: 'Task 1' })
          .build()
        expect(result.description).toHaveLength(2000)
      })

      test('builds checklist with many items', () => {
        const builder = checklist().name('many-items').title('Many Items')
          .version('1.0.0')

        for (let i = 0; i < 50; i++) {
          builder.item({ id: `task-${i}`, title: `Task ${i}` })
        }

        const result = builder.build()
        expect(result.items).toHaveLength(50)
      })

      test('builds checklist with enum status option descriptions', () => {
        const result = checklist()
          .name('status-descriptions')
          .version('1.0.0')
          .title('Status Descriptions')
          .itemWithEnumStatus('task-1', 'Task 1', {
            statusOptions: [
              {
                value: 'todo',
                label: 'To Do',
                description: 'Task not started',
              },
              {
                value: 'in-progress',
                label: 'In Progress',
                description: 'Task is being worked on',
              },
              {
                value: 'done',
                label: 'Done',
                description: 'Task completed',
              },
            ],
          })
          .build()
        expect(result.items).toHaveLength(1)
        const items = result.items as any
        expect(items[0].status?.options?.[0].description).toBe('Task not started')
        expect(items[0].status?.options?.[1].description).toBe('Task is being worked on')
        expect(items[0].status?.options?.[2].description).toBe('Task completed')
      })
    })

    describe('validation failures on build()', () => {
      test('throws error when name is empty string', () => {
        expect(() =>
          checklist().name('').version('1.0.0').title('Test').item({ id: 'task-1', title: 'Task 1' }).build()
        ).toThrow()
      })

      test('throws error when title is empty string', () => {
        expect(() =>
          checklist().name('test').version('1.0.0').title('').item({ id: 'task-1', title: 'Task 1' }).build()
        ).toThrow()
      })

      test('throws error when name exceeds maxLength', () => {
        expect(() =>
          checklist()
            .name('a'.repeat(129))
          .version('1.0.0')
            .title('Test')
            .item({ id: 'task-1', title: 'Task 1' })
            .build()
        ).toThrow()
      })

      test('throws error when title exceeds maxLength', () => {
        expect(() =>
          checklist()
            .name('test')
          .version('1.0.0')
            .title('T'.repeat(201))
            .item({ id: 'task-1', title: 'Task 1' })
            .build()
        ).toThrow()
      })

      test('throws error when description exceeds maxLength', () => {
        expect(() =>
          checklist()
            .name('test')
          .version('1.0.0')
            .title('Test')
            .description('D'.repeat(2001))
            .item({ id: 'task-1', title: 'Task 1' })
            .build()
        ).toThrow()
      })

      test('throws error when code is empty string', () => {
        expect(() =>
          checklist()
            .name('test')
          .version('1.0.0')
            .title('Test')
            .code('')
            .item({ id: 'task-1', title: 'Task 1' })
            .build()
        ).toThrow()
      })

      test('throws error when name has invalid pattern (starts with dash)', () => {
        expect(() =>
          checklist().name('-invalid').version('1.0.0').title('Test').item({ id: 'task-1', title: 'Task 1' }).build()
        ).toThrow()
      })

      test('throws error when name has invalid pattern (ends with dash)', () => {
        expect(() =>
          checklist().name('invalid-').version('1.0.0').title('Test').item({ id: 'task-1', title: 'Task 1' }).build()
        ).toThrow()
      })

      test('throws error when name has invalid pattern (consecutive dashes)', () => {
        expect(() =>
          checklist()
            .name('invalid--name')
          .version('1.0.0')
            .title('Test')
            .item({ id: 'task-1', title: 'Task 1' })
            .build()
        ).toThrow()
      })

      test('throws error when name has invalid pattern (underscore)', () => {
        expect(() =>
          checklist()
            .name('invalid_name')
          .version('1.0.0')
            .title('Test')
            .item({ id: 'task-1', title: 'Task 1' })
            .build()
        ).toThrow()
      })

      test('throws error when name has invalid pattern (special chars)', () => {
        expect(() =>
          checklist()
            .name('invalid@name')
          .version('1.0.0')
            .title('Test')
            .item({ id: 'task-1', title: 'Task 1' })
            .build()
        ).toThrow()
      })

      test('throws error when item is invalid', () => {
        expect(() =>
          checklist()
            .name('test')
          .version('1.0.0')
            .title('Test')
            .item({ id: '', title: 'Task' } as any)
            .build()
        ).toThrow()
      })

      test('throws error when enum status has no options', () => {
        expect(() =>
          checklist()
            .name('test')
          .version('1.0.0')
            .title('Test')
            .item({
              id: 'task-1',
              title: 'Task 1',
              status: {
                kind: 'enum',
                options: [],
              },
            } as any)
            .build()
        ).toThrow()
      })
    })

    describe('builder instance behavior', () => {
      test('returns builder instance when called with no arguments', () => {
        const builder = checklist()
          .name('test')
          .version('1.0.0')
          .version('1.0.0')
        expect(builder).toBeDefined()
        expect(typeof builder.name).toBe('function')
        expect(typeof builder.title).toBe('function')
        expect(typeof builder.item).toBe('function')
        expect(typeof builder.items).toBe('function')
        expect(typeof builder.build).toBe('function')
      })

      test('builder methods return this for chaining', () => {
        const builder = checklist()
          .name('test')
          .version('1.0.0')
          .version('1.0.0')
        const afterName = builder.name('test')
          .version('1.0.0')
        const afterTitle = afterName.title('Test')
        expect(afterName).toBe(builder)
        expect(afterTitle).toBe(builder)
      })

      test('multiple builders are independent', () => {
        const builder1 = checklist()
          .name('checklist1')
          .version('1.0.0')
          .title('Checklist 1')
          .item({ id: 'task-1', title: 'Task 1' })
        const builder2 = checklist()
          .name('checklist2')
          .version('1.0.0')
          .title('Checklist 2')
          .item({ id: 'task-2', title: 'Task 2' })
        expect(builder1.build().name).toBe('checklist1')
        expect(builder2.build().name).toBe('checklist2')
      })

      test('builder can be reused after build', () => {
        const builder = checklist()
          .name('test')
          .version('1.0.0')
          .title('Test')
          .item({ id: 'task-1', title: 'Task 1' })
        const result1 = builder.build()
        const result2 = builder.build()
        expect(result1).toEqual(result2)
      })

      test('modifying builder after build affects subsequent builds', () => {
        const builder = checklist()
          .name('original')
          .version('1.0.0')
          .title('Original')
          .item({ id: 'task-1', title: 'Task 1' })
        const result1 = builder.build()
        builder.name('modified')
          .version('1.0.0')
        const result2 = builder.build()
        expect(result1.name).toBe('original')
        expect(result2.name).toBe('modified')
      })
    })

    describe('builder pattern vs object pattern comparison', () => {
      test('builder pattern produces equivalent result as object pattern', () => {
        const builderResult = checklist()
          .name('test-checklist')
          .version('1.0.0')
          .title('Test Checklist')
          .description('Description')
          .items([
            { id: 'task-1', title: 'Task 1' },
            { id: 'task-2', title: 'Task 2' },
          ])
          .build()

        const objectResult = checklist({
          kind: 'checklist',
          version: '1.0.0',
          name: 'test-checklist',
          title: 'Test Checklist',
          description: 'Description',
          items: [
            { id: 'task-1', title: 'Task 1' },
            { id: 'task-2', title: 'Task 2' },
          ],
        })

        expect(builderResult.kind).toEqual(objectResult.kind)
        expect(builderResult.name).toEqual(objectResult.name)
        expect(builderResult.title).toEqual(objectResult.title)
        expect(builderResult.description).toEqual(objectResult.description)
        expect(builderResult.items).toEqual(objectResult.items)
      })

      test('builder validates on build(), object validates immediately', () => {
        // Builder - no error until build()
        const builder = checklist().name('test').title('')
          .version('1.0.0')
        expect(() => builder.build()).toThrow()

        // Object - error immediately
        expect(() =>
          checklist({
            kind: 'checklist',
            name: 'test',
            title: '',
            items: [],
          } as any)
        ).toThrow()
      })
    })

    describe('common usage patterns', () => {
      test('creates pre-flight checklist', () => {
        const result = checklist()
          .name('pre-flight')
          .version('1.0.0')
          .title('Pre-Flight Checklist')
          .description('Aircraft pre-flight inspection checklist')
          .itemWithBooleanStatus('fuel-check', 'Verify fuel level', {
            default: false,
          })
          .itemWithBooleanStatus('safety-briefing', 'Complete safety briefing', { default: false })
          .itemWithBooleanStatus('weather-check', 'Check weather conditions', {
            default: false,
          })
          .build()

        expect(result.name).toBe('pre-flight')
        expect(result.items).toHaveLength(3)
      })

      test('creates employee onboarding checklist', () => {
        const result = checklist()
          .name('onboarding-tasks')
          .version('1.0.0')
          .title('Employee Onboarding Tasks')
          .description('Required tasks for new employee onboarding')
          .itemWithEnumStatus('hr-paperwork', 'Complete HR paperwork', {
            description: 'Fill out all required HR forms',
            statusOptions: [
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ],
            defaultStatus: 'todo',
          })
          .itemWithEnumStatus('it-setup', 'IT equipment setup', {
            description: 'Set up computer and accounts',
            statusOptions: [
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ],
            defaultStatus: 'todo',
          })
          .build()

        expect(result.name).toBe('onboarding-tasks')
        expect(result.items).toHaveLength(2)
        const items = result.items as any
        expect(items[0].status?.kind).toBe('enum')
      })
    })
  })
})
