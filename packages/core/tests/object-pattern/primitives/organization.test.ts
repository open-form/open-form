import { describe, test, expect } from 'vitest';
import { organization } from '@/builders/primitives/organization';
import type { Organization } from '@/schemas/primitives';

describe('Organization (Object Pattern)', () => {
	describe('organization() - direct validation', () => {
		test('creates valid organization with name only', () => {
			const input: Organization = { name: 'Acme Corp' };
			const result = organization(input);
			expect(result).toEqual({ name: 'Acme Corp' });
		});

		test('creates valid organization with all fields', () => {
			const input: Organization = {
				name: 'Acme Corp',
				legalName: 'Acme Corporation',
				domicile: 'Delaware',
				entityType: 'corporation',
				entityId: 'BIN-123456',
				taxId: '12-3456789',
			};
			const result = organization(input);
			expect(result).toEqual(input);
		});

		test('throws error when name is missing', () => {
			const input = { legalName: 'Acme Corporation' } as any;
			expect(() => organization(input)).toThrow();
		});

		test('throws error when name is empty', () => {
			const input = { name: '' } as any;
			expect(() => organization(input)).toThrow();
		});
	});

	describe('organization.parse()', () => {
		test('parses valid organization', () => {
			const input = { name: 'Acme Corp' };
			const result = organization.parse(input);
			expect(result).toEqual({ name: 'Acme Corp' });
		});
	});

	describe('organization.safeParse()', () => {
		test('returns success for valid organization', () => {
			const input = { name: 'Acme Corp', taxId: '12-3456789' };
			const result = organization.safeParse(input);
			expect(result.success).toBe(true);
		});

		test('returns error when name is missing', () => {
			const input = { taxId: '12-3456789' };
			const result = organization.safeParse(input);
			expect(result.success).toBe(false);
		});
	});
});
