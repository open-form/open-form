import { describe, test, expect } from 'vitest';
import { annex } from '@/builders/blocks/annex';
import type { Annex } from '@/schemas/blocks';

describe('Annex (Object Pattern)', () => {
	describe('annex() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid annex with minimal config', () => {
				const input: Annex = {
					id: 'exhibit-a',
					title: 'Exhibit A',
				};
				const result = annex(input);
				expect(result.id).toBe('exhibit-a');
				expect(result.title).toBe('Exhibit A');
			});

			test('creates annex with description', () => {
				const input: Annex = {
					id: 'appendix-b',
					title: 'Appendix B',
					description: 'Technical specifications and requirements',
				};
				const result = annex(input);
				expect(result.description).toBe(
					'Technical specifications and requirements',
				);
			});

			test('creates annex with required flag', () => {
				const input: Annex = {
					id: 'mandatory-annex',
					title: 'Mandatory Annex',
					required: true,
				};
				const result = annex(input);
				expect(result.required).toBe(true);
			});

			test('creates annex with required false', () => {
				const input: Annex = {
					id: 'optional-annex',
					title: 'Optional Annex',
					required: false,
				};
				const result = annex(input);
				expect(result.required).toBe(false);
			});

			test('creates annex with all properties', () => {
				const input: Annex = {
					id: 'complete-annex',
					title: 'Complete Annex',
					description: 'A complete annex example',
					required: true,
				};
				const result = annex(input);
				expect(result).toEqual(input);
			});

			test('creates annex with valid id patterns', () => {
				const validIds = [
					'simple',
					'with-dash',
					'with_underscore',
					'camelCase',
					'PascalCase',
					'with123numbers',
					'a1-b2_c3',
					'exhibit-a',
					'schedule-1',
					'appendix-b',
				];

				for (const id of validIds) {
					const input: Annex = { id, title: 'Test Title' };
					const result = annex(input);
					expect(result.id).toBe(id);
				}
			});

			test('creates annex with long valid id', () => {
				const input: Annex = {
					id: 'a'.repeat(100),
					title: 'Long ID Annex',
				};
				const result = annex(input);
				expect(result.id).toHaveLength(100);
			});

			test('creates annex with long title', () => {
				const input: Annex = {
					id: 'test',
					title: 'a'.repeat(200),
				};
				const result = annex(input);
				expect(result.title).toHaveLength(200);
			});

			test('creates annex with long description', () => {
				const input: Annex = {
					id: 'test',
					title: 'Test Title',
					description: 'a'.repeat(1000),
				};
				const result = annex(input);
				expect(result.description).toHaveLength(1000);
			});
		});

		describe('validation failures', () => {
			test('throws error when id is missing', () => {
				const input = {
					title: 'Missing ID',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when title is missing', () => {
				const input = {
					id: 'missing-title',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when id is empty string', () => {
				const input = {
					id: '',
					title: 'Test',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when title is empty string', () => {
				const input = {
					id: 'test',
					title: '',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when id exceeds maxLength', () => {
				const input = {
					id: 'a'.repeat(101),
					title: 'Test',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when id has invalid pattern (starts with dash)', () => {
				const input = {
					id: '-invalid',
					title: 'Test',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when id has invalid pattern (starts with underscore)', () => {
				const input = {
					id: '_invalid',
					title: 'Test',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when id has special characters', () => {
				const input = {
					id: 'invalid@id',
					title: 'Test',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when id has spaces', () => {
				const input = {
					id: 'invalid id',
					title: 'Test',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when title exceeds maxLength', () => {
				const input = {
					id: 'test',
					title: 'a'.repeat(201),
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when description is empty string', () => {
				const input = {
					id: 'test',
					title: 'Test',
					description: '',
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('throws error when description exceeds maxLength', () => {
				const input = {
					id: 'test',
					title: 'Test',
					description: 'a'.repeat(1001),
				} as any;
				expect(() => annex(input)).toThrow();
			});

			test('strips additional properties', () => {
				const input = {
					id: 'test',
					title: 'Test',
					extra: 'should be removed',
				} as any;
				const result = annex(input);
				expect(result).not.toHaveProperty('extra');
			});
		});
	});

	describe('annex.parse()', () => {
		describe('success cases', () => {
			test('parses valid annex', () => {
				const input = {
					id: 'test',
					title: 'Test',
				};
				const result = annex.parse(input);
				expect(result).toEqual(input);
			});

			test('parses annex with all properties', () => {
				const input = {
					id: 'complete',
					title: 'Complete',
					description: 'A complete annex',
					required: true,
				};
				const result = annex.parse(input);
				expect(result).toEqual(input);
			});
		});

		describe('validation failures', () => {
			test('throws error for invalid input', () => {
				expect(() => annex.parse({ id: '', title: 'Test' })).toThrow();
			});

			test('throws error when input is null', () => {
				expect(() => annex.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => annex.parse(undefined)).toThrow();
			});

			test('throws error when id is missing', () => {
				expect(() => annex.parse({ title: 'Test' })).toThrow();
			});

			test('throws error when title is missing', () => {
				expect(() => annex.parse({ id: 'test' })).toThrow();
			});
		});
	});

	describe('annex.safeParse()', () => {
		describe('success cases', () => {
			test('returns success for valid annex', () => {
				const input = {
					id: 'test',
					title: 'Test',
				};
				const result = annex.safeParse(input);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual(input);
				}
			});

			test('returns success for annex with all properties', () => {
				const input = {
					id: 'complete',
					title: 'Complete',
					description: 'Description',
					required: true,
				};
				const result = annex.safeParse(input);
				expect(result.success).toBe(true);
			});
		});

		describe('failure cases', () => {
			test('returns error for invalid id', () => {
				const input = { id: '', title: 'Test' };
				const result = annex.safeParse(input);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error for missing id', () => {
				const input = { title: 'Test' };
				const result = annex.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for missing title', () => {
				const input = { id: 'test' };
				const result = annex.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for null input', () => {
				const result = annex.safeParse(null);
				expect(result.success).toBe(false);
			});

			test('returns error for undefined input', () => {
				const result = annex.safeParse(undefined);
				expect(result.success).toBe(false);
			});

			test('returns error when id exceeds maxLength', () => {
				const input = { id: 'a'.repeat(101), title: 'Test' };
				const result = annex.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error when id has invalid pattern', () => {
				const input = { id: '-invalid', title: 'Test' };
				const result = annex.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error when title exceeds maxLength', () => {
				const input = {
					id: 'test',
					title: 'a'.repeat(201),
				};
				const result = annex.safeParse(input);
				expect(result.success).toBe(false);
			});
		});
	});
});
