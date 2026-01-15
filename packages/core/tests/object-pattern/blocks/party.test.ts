import { describe, test, expect } from 'vitest';
import { partyData } from '@/builders/blocks/party-data';
import type { Party } from '@/schemas/blocks';

describe('PartyData (Object Pattern)', () => {
	describe('partyData() - direct validation', () => {
		describe('Person variant - success cases', () => {
			test('creates valid person party with minimal config', () => {
				const input: Party = {
					type: 'person',
					fullName: 'John Doe',
				};
				const result = partyData(input);
				expect(result.type).toBe('person');
				expect((result as any).fullName).toBe('John Doe');
			});

			test('creates person party with all name components', () => {
				const input: Party = {
					type: 'person',
					fullName: 'Dr. Jane Mary Smith Jr.',
					title: 'Dr.',
					firstName: 'Jane',
					middleName: 'Mary',
					lastName: 'Smith',
					suffix: 'Jr.',
				};
				const result = partyData(input);
				expect(result).toEqual(input);
			});

			test('creates person party with signature', () => {
				const input: Party = {
					type: 'person',
					fullName: 'John Doe',
					signature: 'https://example.com/signatures/johndoe.png',
				};
				const result = partyData(input);
				expect((result as any).signature).toBe('https://example.com/signatures/johndoe.png');
			});

			test('creates person party with first and last name only', () => {
				const input: Party = {
					type: 'person',
					fullName: 'Jane Smith',
					firstName: 'Jane',
					lastName: 'Smith',
				};
				const result = partyData(input);
				expect((result as any).firstName).toBe('Jane');
				expect((result as any).lastName).toBe('Smith');
			});

			test('creates person party with title prefix', () => {
				const input: Party = {
					type: 'person',
					fullName: 'Mr. John Doe',
					title: 'Mr.',
					firstName: 'John',
					lastName: 'Doe',
				};
				const result = partyData(input);
				expect((result as any).title).toBe('Mr.');
			});

			test('creates person party with name suffix', () => {
				const input: Party = {
					type: 'person',
					fullName: 'John Doe III',
					firstName: 'John',
					lastName: 'Doe',
					suffix: 'III',
				};
				const result = partyData(input);
				expect((result as any).suffix).toBe('III');
			});

			test('creates person party with middle name', () => {
				const input: Party = {
					type: 'person',
					fullName: 'John Michael Doe',
					firstName: 'John',
					middleName: 'Michael',
					lastName: 'Doe',
				};
				const result = partyData(input);
				expect((result as any).middleName).toBe('Michael');
			});
		});

		describe('Organization variant - success cases', () => {
			test('creates valid organization party with minimal config', () => {
				const input: Party = {
					type: 'organization',
					name: 'Acme Corporation',
				};
				const result = partyData(input);
				expect(result.type).toBe('organization');
				expect((result as any).name).toBe('Acme Corporation');
			});

			test('creates organization party with all properties', () => {
				const input: Party = {
					type: 'organization',
					name: 'Acme Corporation',
					legalName: 'Acme Corporation, Inc.',
					domicile: 'Delaware',
					entityType: 'corporation',
					entityId: 'DE-123456',
					taxId: '12-3456789',
				};
				const result = partyData(input);
				expect(result).toEqual(input);
			});

			test('creates organization party with signature', () => {
				const input: Party = {
					type: 'organization',
					name: 'Acme Corp',
					signature: 'signature-id-12345',
				};
				const result = partyData(input);
				expect((result as any).signature).toBe('signature-id-12345');
			});

			test('creates organization party with legal name', () => {
				const input: Party = {
					type: 'organization',
					name: 'TechStart',
					legalName: 'TechStart, LLC',
				};
				const result = partyData(input);
				expect((result as any).legalName).toBe('TechStart, LLC');
			});

			test('creates organization party with domicile', () => {
				const input: Party = {
					type: 'organization',
					name: 'Global Inc',
					domicile: 'New York',
				};
				const result = partyData(input);
				expect((result as any).domicile).toBe('New York');
			});

			test('creates organization party with entity type', () => {
				const input: Party = {
					type: 'organization',
					name: 'MyCompany',
					entityType: 'LLC',
				};
				const result = partyData(input);
				expect((result as any).entityType).toBe('LLC');
			});

			test('creates organization party with tax ID', () => {
				const input: Party = {
					type: 'organization',
					name: 'Corp Inc',
					taxId: '98-7654321',
				};
				const result = partyData(input);
				expect((result as any).taxId).toBe('98-7654321');
			});
		});

		describe('validation failures', () => {
			test('throws error when type is missing', () => {
				const input = {
					fullName: 'John Doe',
				} as any;
				expect(() => partyData(input)).toThrow();
			});

			test('throws error when person fullName is missing', () => {
				const input = {
					type: 'person',
					firstName: 'John',
				} as any;
				expect(() => partyData(input)).toThrow();
			});

			test('throws error when organization name is missing', () => {
				const input = {
					type: 'organization',
					legalName: 'Acme Corp, Inc.',
				} as any;
				expect(() => partyData(input)).toThrow();
			});

			test('throws error for invalid type', () => {
				const input = {
					type: 'invalid',
					name: 'Test',
				} as any;
				expect(() => partyData(input)).toThrow();
			});

			test('strips additional properties during coercion (Union type behavior)', () => {
				const input = {
					type: 'person',
					fullName: 'John Doe',
					extra: 'should be removed',
				} as any;
				// Extra properties are stripped during coercion, not rejected
				const result = partyData(input);
				expect(result.type).toBe('person');
				expect((result as { fullName?: string }).fullName).toBe('John Doe');
				expect((result as any).extra).toBeUndefined();
			});
		});
	});

	describe('partyData.parse()', () => {
		describe('success cases', () => {
			test('parses valid person party', () => {
				const input = {
					type: 'person',
					fullName: 'John Doe',
				};
				const result = partyData.parse(input);
				expect(result).toEqual(input);
			});

			test('parses valid organization party', () => {
				const input = {
					type: 'organization',
					name: 'Acme Corp',
				};
				const result = partyData.parse(input);
				expect(result).toEqual(input);
			});

			test('parses person party with all properties', () => {
				const input = {
					type: 'person',
					fullName: 'Dr. Jane Smith',
					title: 'Dr.',
					firstName: 'Jane',
					lastName: 'Smith',
					signature: 'sig-123',
				};
				const result = partyData.parse(input);
				expect(result).toEqual(input);
			});
		});

		describe('validation failures', () => {
			test('throws error for invalid input', () => {
				expect(() => partyData.parse({ type: 'person' })).toThrow();
			});

			test('throws error when input is null', () => {
				expect(() => partyData.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => partyData.parse(undefined)).toThrow();
			});
		});
	});

	describe('partyData.safeParse()', () => {
		describe('success cases', () => {
			test('returns success for valid person party', () => {
				const input = {
					type: 'person',
					fullName: 'John Doe',
				};
				const result = partyData.safeParse(input);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual(input);
				}
			});

			test('returns success for valid organization party', () => {
				const input = {
					type: 'organization',
					name: 'Acme Corp',
				};
				const result = partyData.safeParse(input);
				expect(result.success).toBe(true);
			});

			test('returns success for person with signature', () => {
				const input = {
					type: 'person',
					fullName: 'Jane Smith',
					signature: 'https://example.com/sig.png',
				};
				const result = partyData.safeParse(input);
				expect(result.success).toBe(true);
			});

			test('returns success for organization with all properties', () => {
				const input = {
					type: 'organization',
					name: 'Corp Inc',
					legalName: 'Corp Inc, LLC',
					domicile: 'CA',
					entityType: 'LLC',
					taxId: '12-3456789',
				};
				const result = partyData.safeParse(input);
				expect(result.success).toBe(true);
			});
		});

		describe('failure cases', () => {
			test('returns error when person fullName is missing', () => {
				const input = { type: 'person' };
				const result = partyData.safeParse(input);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when organization name is missing', () => {
				const input = { type: 'organization' };
				const result = partyData.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for invalid type', () => {
				const input = { type: 'invalid', name: 'Test' };
				const result = partyData.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error when type is missing', () => {
				const input = { fullName: 'John Doe' };
				const result = partyData.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for null input', () => {
				const result = partyData.safeParse(null);
				expect(result.success).toBe(false);
			});

			test('returns error for undefined input', () => {
				const result = partyData.safeParse(undefined);
				expect(result.success).toBe(false);
			});
		});
	});
});
