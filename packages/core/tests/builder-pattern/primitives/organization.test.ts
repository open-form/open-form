import { describe, test, expect } from 'vitest';
import { organization } from '@/builders/primitives/organization';

describe('Organization (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		test('builds valid organization with name only', () => {
			const result = organization().name('Acme Corp').build();
			expect(result).toEqual({ name: 'Acme Corp' });
		});

		test('builds valid organization with all fields', () => {
			const result = organization()
				.name('Acme Corp')
				.legalName('Acme Corporation')
				.domicile('Delaware')
				.entityType('corporation')
				.entityId('BIN-123456')
				.taxId('12-3456789')
				.build();
			expect(result).toEqual({
				name: 'Acme Corp',
				legalName: 'Acme Corporation',
				domicile: 'Delaware',
				entityType: 'corporation',
				entityId: 'BIN-123456',
				taxId: '12-3456789',
			});
		});

		test('throws error when name is not set', () => {
			expect(() => organization().taxId('12-3456789').build()).toThrow();
		});

		test('throws error when name is empty', () => {
			expect(() => organization().name('').build()).toThrow();
		});
	});
});
