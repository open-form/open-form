import '@/utils/formats'; // Initialize TypeBox format validators
import { describe, test, expect } from 'vitest';
import { checklist } from '@/builders/artifacts/checklist';
import type { Checklist } from '@open-form/types';

describe('Checklist (Object Pattern)', () => {
	describe('checklist() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid checklist with minimal required properties', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'task-list',
					title: 'Task List',
					items: [
						{
							id: 'task-1',
							title: 'First task',
						},
					],
				};
				const result = checklist(input);
				expect(result.kind).toBe('checklist');
				expect(result.name).toBe('task-list');
				expect(result.title).toBe('Task List');
				expect(result.items).toHaveLength(1);
			});

			test('creates checklist with boolean status items', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'pre-flight',
					title: 'Pre-Flight Checklist',
					items: [
						{
							id: 'fuel-check',
							title: 'Verify fuel level',
							status: {
								kind: 'boolean',
								default: false,
							},
						},
						{
							id: 'safety-briefing',
							title: 'Complete safety briefing',
							status: {
								kind: 'boolean',
							},
						},
					],
				};
				const result = checklist(input);
				expect(result.items).toHaveLength(2);
				expect(result.items[0]!.status?.kind).toBe('boolean');
				expect(result.items[0]!.status?.default).toBe(false);
			});

			test('creates checklist with enum status items', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'onboarding',
					title: 'Employee Onboarding Tasks',
					items: [
						{
							id: 'hr-paperwork',
							title: 'Complete HR paperwork',
							description: 'Fill out all required HR forms',
							status: {
								kind: 'enum',
								options: [
									{ value: 'todo', label: 'To Do' },
									{ value: 'in-progress', label: 'In Progress' },
									{ value: 'done', label: 'Done' },
								],
								default: 'todo',
							},
						},
					],
				};
				const result = checklist(input);
				expect(result.items[0]!.status?.kind).toBe('enum');
				expect((result.items[0]!.status as any)?.options).toHaveLength(3);
				expect(result.items[0]!.status?.default).toBe('todo');
			});

			test('creates checklist with mixed status types', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'mixed-checklist',
					title: 'Mixed Checklist',
					items: [
						{
							id: 'item-1',
							title: 'Boolean item',
							status: {
								kind: 'boolean',
								default: true,
							},
						},
						{
							id: 'item-2',
							title: 'Enum item',
							status: {
								kind: 'enum',
								options: [
									{ value: 'pending', label: 'Pending' },
									{ value: 'completed', label: 'Completed' },
								],
							},
						},
						{
							id: 'item-3',
							title: 'No status item',
						},
					],
				};
				const result = checklist(input);
				expect(result.items).toHaveLength(3);
				expect(result.items[0]!.status?.kind).toBe('boolean');
				expect(result.items[1]!.status?.kind).toBe('enum');
				expect(result.items[2]!.status).toBeUndefined();
			});

			test('creates checklist with description', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'described-checklist',
					title: 'Described Checklist',
					description: 'This is a detailed description of the checklist.',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
						},
					],
				};
				const result = checklist(input);
				expect(result.description).toBe(
					'This is a detailed description of the checklist.',
				);
			});

			test('creates checklist with code', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'coded-checklist',
					title: 'Coded Checklist',
					code: 'CHECK-001',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
						},
					],
				};
				const result = checklist(input);
				expect(result.code).toBe('CHECK-001');
			});

			test('creates checklist with metadata', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'metadata-checklist',
					title: 'Metadata Checklist',
					metadata: {
						version: '1.0',
						author: 'John Doe',
						category: 'Quality Assurance',
					},
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
						},
					],
				};
				const result = checklist(input);
				expect(result.metadata?.version).toBe('1.0');
				expect(result.metadata?.author).toBe('John Doe');
			});

			test('creates checklist with items having descriptions', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'detailed-checklist',
					title: 'Detailed Checklist',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
							description: 'Detailed instructions for task 1',
						},
						{
							id: 'task-2',
							title: 'Task 2',
							description: 'Detailed instructions for task 2',
						},
					],
				};
				const result = checklist(input);
				expect(result.items[0]!.description).toBe(
					'Detailed instructions for task 1',
				);
				expect(result.items[1]!.description).toBe(
					'Detailed instructions for task 2',
				);
			});

			test('creates checklist with all properties', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'complete-checklist',
					title: 'Complete Checklist',
					description: 'A fully configured checklist',
					code: 'COMPLETE-001',
					metadata: { version: '1.0' },
					items: [
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
					],
				};
				const result = checklist(input);
				// Compare the raw schema data since checklist() now returns ChecklistInstance
				expect(result.schema).toEqual(input);
			});

			test('creates checklist with valid name patterns', () => {
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
				];

				for (const name of validNames) {
					const input: Checklist = {
						kind: 'checklist',
						version: '1.0.0',
						name,
						title: 'Test Checklist',
						items: [{ id: 'task-1', title: 'Task 1' }],
					};
					const result = checklist(input);
					expect(result.name).toBe(name);
				}
			});

			test('creates checklist with long valid name', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'a'.repeat(128),
					title: 'Test Checklist',
					items: [{ id: 'task-1', title: 'Task 1' }],
				};
				const result = checklist(input);
				expect(result.name).toHaveLength(128);
			});

			test('creates checklist with long valid title', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'T'.repeat(200),
					items: [{ id: 'task-1', title: 'Task 1' }],
				};
				const result = checklist(input);
				expect(result.title).toHaveLength(200);
			});

			test('creates checklist with long valid description', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					description: 'D'.repeat(2000),
					items: [{ id: 'task-1', title: 'Task 1' }],
				};
				const result = checklist(input);
				expect(result.description).toHaveLength(2000);
			});

			test('creates checklist with many items', () => {
				const items: Checklist['items'] = [];
				for (let i = 0; i < 50; i++) {
					items.push({ id: `task-${i}`, title: `Task ${i}` });
				}
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'many-items',
					title: 'Many Items',
					items,
				};
				const result = checklist(input);
				expect(result.items).toHaveLength(50);
			});

			test('creates checklist with enum status option descriptions', () => {
				const input: Checklist = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'status-with-descriptions',
					title: 'Status with Descriptions',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
							status: {
								kind: 'enum',
								options: [
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
							},
						},
					],
				};
				const result = checklist(input);
				expect(
					(result.items[0]!.status as any)?.options?.[0]?.description,
				).toBe('Task not started');
				expect(
					(result.items[0]!.status as any)?.options?.[1]?.description,
				).toBe('Task is being worked on');
				expect(
					(result.items[0]!.status as any)?.options?.[2]?.description,
				).toBe('Task completed');
			});
		});

		describe('validation failures', () => {
			test('throws error when kind is missing', () => {
				const input = {
					name: 'test',
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('corrects kind when incorrect value is provided', () => {
				// The builder ensures kind is always 'checklist' regardless of input
				const input = {
					kind: 'invalid', // Wrong kind - will be overridden
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					items: [],
				} as any;
				const result = checklist(input);
				expect(result.schema.kind).toBe('checklist');
			});

			test('throws error when name is missing', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when title is missing', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when items is missing', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when name is empty string', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: '',
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when title is empty string', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: '',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when name exceeds maxLength', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'a'.repeat(129),
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when title exceeds maxLength', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'T'.repeat(201),
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when description exceeds maxLength', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					description: 'D'.repeat(2001),
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when code is empty string', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					code: '',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when name has invalid pattern (starts with dash)', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: '-invalid',
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when name has invalid pattern (ends with dash)', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'invalid-',
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when name has invalid pattern (consecutive dashes)', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'invalid--name',
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when name has invalid pattern (underscore)', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'invalid_name',
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when name has invalid pattern (special chars)', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'invalid@name',
					title: 'Test',
					items: [],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when item id is empty', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					items: [
						{
							id: '',
							title: 'Task',
						},
					],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when item title is empty', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					items: [
						{
							id: 'task-1',
							title: '',
						},
					],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when enum status has no options', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
							status: {
								kind: 'enum',
								options: [],
							},
						},
					],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when enum status option value is empty', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
							status: {
								kind: 'enum',
								options: [{ value: '', label: 'Label' }],
							},
						},
					],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('throws error when enum status option label is empty', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
							status: {
								kind: 'enum',
								options: [{ value: 'value', label: '' }],
							},
						},
					],
				} as any;
				expect(() => checklist(input)).toThrow();
			});

			test('strips additional properties', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					items: [],
					extra: 'should be removed',
				} as any;
				const result = checklist(input);
				expect(result).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => checklist(null as any)).toThrow();
			});

			test('throws error when input is a string', () => {
				expect(() => checklist('not an object' as any)).toThrow();
			});

			test('throws error when input is a number', () => {
				expect(() => checklist(123 as any)).toThrow();
			});

			test('throws error when input is an array', () => {
				expect(() =>
					checklist([
						{ kind: 'checklist', name: 'test', title: 'Test', items: [] },
					] as any),
				).toThrow();
			});
		});
	});

	describe('checklist.parse()', () => {
		describe('success cases', () => {
			test('parses valid checklist', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test-checklist',
					title: 'Test Checklist',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
						},
					],
				};
				const result = checklist.parse(input);
				expect(result).toEqual(input);
			});

			test('parses checklist with boolean status items', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'boolean-checklist',
					title: 'Boolean Checklist',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
							status: {
								kind: 'boolean',
								default: true,
							},
						},
					],
				};
				const result = checklist.parse(input);
				expect(result.items[0]!.status?.kind).toBe('boolean');
			});

			test('parses checklist with enum status items', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'enum-checklist',
					title: 'Enum Checklist',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
							status: {
								kind: 'enum',
								options: [
									{ value: 'a', label: 'A' },
									{ value: 'b', label: 'B' },
								],
							},
						},
					],
				};
				const result = checklist.parse(input);
				expect(result.items[0]!.status?.kind).toBe('enum');
			});
		});

		describe('validation failures', () => {
			test('throws error for missing name', () => {
				const input = { kind: 'checklist', title: 'Test', items: [] };
				expect(() => checklist.parse(input)).toThrow();
			});

			test('throws error for missing title', () => {
				const input = { kind: 'checklist', name: 'test', items: [] };
				expect(() => checklist.parse(input)).toThrow();
			});

			test('throws error for missing items', () => {
				const input = { kind: 'checklist', name: 'test', title: 'Test' };
				expect(() => checklist.parse(input)).toThrow();
			});

			test('throws error for null input', () => {
				expect(() => checklist.parse(null)).toThrow();
			});

			test('throws error for undefined input', () => {
				expect(() => checklist.parse(undefined)).toThrow();
			});

			test('throws error for invalid input type', () => {
				expect(() => checklist.parse('string')).toThrow();
			});
		});
	});

	describe('checklist.safeParse()', () => {
		describe('success cases', () => {
			test('returns success for valid checklist', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test-checklist',
					title: 'Test Checklist',
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
						},
					],
				};
				const result = checklist.safeParse(input);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual(input);
				}
			});

			test('returns success for checklist with all properties', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'complete-checklist',
					title: 'Complete Checklist',
					description: 'Description',
					code: 'CODE-001',
					metadata: { version: '1.0' },
					items: [
						{
							id: 'task-1',
							title: 'Task 1',
							description: 'Task description',
							status: {
								kind: 'boolean',
								default: false,
							},
						},
					],
				};
				const result = checklist.safeParse(input);
				expect(result.success).toBe(true);
			});
		});

		describe('failure cases', () => {
			test('returns error for missing name', () => {
				const input = { kind: 'checklist', title: 'Test', items: [] };
				const result = checklist.safeParse(input);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error for missing title', () => {
				const input = { kind: 'checklist', name: 'test', items: [] };
				const result = checklist.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for missing items', () => {
				const input = { kind: 'checklist', name: 'test', title: 'Test' };
				const result = checklist.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for empty name', () => {
				const input = { kind: 'checklist', name: '', title: 'Test', items: [] };
				const result = checklist.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for empty title', () => {
				const input = { kind: 'checklist', name: 'test', title: '', items: [] };
				const result = checklist.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for null input', () => {
				const result = checklist.safeParse(null);
				expect(result.success).toBe(false);
			});

			test('returns error for undefined input', () => {
				const result = checklist.safeParse(undefined);
				expect(result.success).toBe(false);
			});

			test('returns error for invalid input type', () => {
				const result = checklist.safeParse('string');
				expect(result.success).toBe(false);
			});

			test('returns error for invalid name pattern', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: '-invalid',
					title: 'Test',
					items: [],
				};
				const result = checklist.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for name too long', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'a'.repeat(129),
					title: 'Test',
					items: [],
				};
				const result = checklist.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('strips additional properties', () => {
				const input = {
					kind: 'checklist',
					version: '1.0.0',
					name: 'test',
					title: 'Test',
					items: [],
					extra: 'removed',
				};
				const result = checklist.safeParse(input);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).not.toHaveProperty('extra');
				}
			});
		});
	});
});
