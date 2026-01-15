import { describe, test, expect } from 'vitest';
import { partyData } from '@/builders/blocks/party-data';

describe('PartyData (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('Person variant - success cases', () => {
			test('builds valid person party with minimal config', () => {
				const result = partyData.person().fullName('John Doe').build();
				expect(result.type).toBe('person');
				expect((result as any).fullName).toBe('John Doe');
			});

			test('builds person party using default partyData()', () => {
				const result = partyData().fullName('Jane Smith').build();
				expect(result.type).toBe('person');
				expect((result as any).fullName).toBe('Jane Smith');
			});

			test('builds person party with all name components', () => {
				const result = partyData
					.person()
					.fullName('Dr. Jane Mary Smith Jr.')
					.title('Dr.')
					.firstName('Jane')
					.middleName('Mary')
					.lastName('Smith')
					.suffix('Jr.')
					.build();
				expect((result as any).fullName).toBe('Dr. Jane Mary Smith Jr.');
				expect((result as any).title).toBe('Dr.');
				expect((result as any).firstName).toBe('Jane');
				expect((result as any).middleName).toBe('Mary');
				expect((result as any).lastName).toBe('Smith');
				expect((result as any).suffix).toBe('Jr.');
			});

			test('builds person party with signature', () => {
				const result = partyData
					.person()
					.fullName('John Doe')
					.signature('https://example.com/signatures/johndoe.png')
					.build();
				expect((result as any).signature).toBe('https://example.com/signatures/johndoe.png');
			});

			test('builds person party with first and last name only', () => {
				const result = partyData
					.person()
					.fullName('Jane Smith')
					.firstName('Jane')
					.lastName('Smith')
					.build();
				expect((result as any).firstName).toBe('Jane');
				expect((result as any).lastName).toBe('Smith');
			});

			test('builds person party with title prefix', () => {
				const result = partyData
					.person()
					.fullName('Mr. John Doe')
					.title('Mr.')
					.firstName('John')
					.lastName('Doe')
					.build();
				expect((result as any).title).toBe('Mr.');
			});

			test('builds person party with name suffix', () => {
				const result = partyData
					.person()
					.fullName('John Doe III')
					.firstName('John')
					.lastName('Doe')
					.suffix('III')
					.build();
				expect((result as any).suffix).toBe('III');
			});

			test('builds person party with middle name', () => {
				const result = partyData
					.person()
					.fullName('John Michael Doe')
					.firstName('John')
					.middleName('Michael')
					.lastName('Doe')
					.build();
				expect((result as any).middleName).toBe('Michael');
			});

			test('supports method chaining', () => {
				const result = partyData
					.person()
					.fullName('Jane Doe')
					.firstName('Jane')
					.lastName('Doe')
					.signature('sig-123')
					.build();
				expect((result as any).fullName).toBe('Jane Doe');
				expect((result as any).signature).toBe('sig-123');
			});

			test('allows overwriting fullName', () => {
				const result = partyData
					.person()
					.fullName('Original Name')
					.fullName('Updated Name')
					.build();
				expect((result as any).fullName).toBe('Updated Name');
			});

			test('allows undefined values for optional fields', () => {
				const result = partyData
					.person()
					.fullName('John Doe')
					.title(undefined)
					.firstName(undefined)
					.build();
				expect((result as any).fullName).toBe('John Doe');
				expect((result as any).title).toBeUndefined();
				expect((result as any).firstName).toBeUndefined();
			});
		});

		describe('Organization variant - success cases', () => {
			test('builds valid organization party with minimal config', () => {
				const result = partyData.organization().name('Acme Corporation').build();
				expect(result.type).toBe('organization');
				expect((result as any).name).toBe('Acme Corporation');
			});

			test('builds organization party with all properties', () => {
				const result = partyData
					.organization()
					.name('Acme Corporation')
					.legalName('Acme Corporation, Inc.')
					.domicile('Delaware')
					.entityType('corporation')
					.entityId('DE-123456')
					.taxId('12-3456789')
					.build();
				expect((result as any).name).toBe('Acme Corporation');
				expect((result as any).legalName).toBe('Acme Corporation, Inc.');
				expect((result as any).domicile).toBe('Delaware');
				expect((result as any).entityType).toBe('corporation');
				expect((result as any).entityId).toBe('DE-123456');
				expect((result as any).taxId).toBe('12-3456789');
			});

			test('builds organization party with signature', () => {
				const result = partyData
					.organization()
					.name('Acme Corp')
					.signature('signature-id-12345')
					.build();
				expect((result as any).signature).toBe('signature-id-12345');
			});

			test('builds organization party with legal name', () => {
				const result = partyData
					.organization()
					.name('TechStart')
					.legalName('TechStart, LLC')
					.build();
				expect((result as any).legalName).toBe('TechStart, LLC');
			});

			test('builds organization party with domicile', () => {
				const result = partyData
					.organization()
					.name('Global Inc')
					.domicile('New York')
					.build();
				expect((result as any).domicile).toBe('New York');
			});

			test('builds organization party with entity type', () => {
				const result = partyData
					.organization()
					.name('MyCompany')
					.entityType('LLC')
					.build();
				expect((result as any).entityType).toBe('LLC');
			});

			test('builds organization party with tax ID', () => {
				const result = partyData
					.organization()
					.name('Corp Inc')
					.taxId('98-7654321')
					.build();
				expect((result as any).taxId).toBe('98-7654321');
			});

			test('supports method chaining', () => {
				const result = partyData
					.organization()
					.name('Corp Inc')
					.legalName('Corp Inc, LLC')
					.taxId('12-3456789')
					.build();
				expect((result as any).name).toBe('Corp Inc');
				expect((result as any).taxId).toBe('12-3456789');
			});

			test('allows overwriting name', () => {
				const result = partyData
					.organization()
					.name('Original Corp')
					.name('Updated Corp')
					.build();
				expect((result as any).name).toBe('Updated Corp');
			});

			test('allows undefined values for optional fields', () => {
				const result = partyData
					.organization()
					.name('Acme Corp')
					.legalName(undefined)
					.domicile(undefined)
					.build();
				expect((result as any).name).toBe('Acme Corp');
				expect((result as any).legalName).toBeUndefined();
				expect((result as any).domicile).toBeUndefined();
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when person fullName is not set', () => {
				expect(() => partyData.person().build()).toThrow();
			});

			test('throws error when organization name is not set', () => {
				expect(() => partyData.organization().build()).toThrow();
			});

			test('throws error when default partyData() has no fullName', () => {
				expect(() => partyData().build()).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns PersonPartyDataBuilder instance when called with no arguments', () => {
				const builder = partyData();
				expect(builder).toBeDefined();
				expect(typeof builder.fullName).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('returns PersonPartyDataBuilder instance from person()', () => {
				const builder = partyData.person();
				expect(builder).toBeDefined();
				expect(typeof builder.fullName).toBe('function');
				expect(typeof builder.title).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('returns OrganizationPartyDataBuilder instance from organization()', () => {
				const builder = partyData.organization();
				expect(builder).toBeDefined();
				expect(typeof builder.name).toBe('function');
				expect(typeof builder.legalName).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = partyData.person();
				const afterFullName = builder.fullName('John Doe');
				const afterFirstName = afterFullName.firstName('John');
				expect(afterFullName).toBe(builder);
				expect(afterFirstName).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = partyData.person().fullName('Person 1');
				const builder2 = partyData.person().fullName('Person 2');
				expect((builder1.build() as any).fullName).toBe('Person 1');
				expect((builder2.build() as any).fullName).toBe('Person 2');
			});

			test('builder can be reused after build', () => {
				const builder = partyData.person().fullName('John Doe');
				const result1 = builder.build();
				const result2 = builder.build();
				expect(result1).toEqual(result2);
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = partyData.person().fullName('Original');
				const result1 = builder.build();

				builder.fullName('Modified');
				const result2 = builder.build();

				expect((result1 as any).fullName).toBe('Original');
				expect((result2 as any).fullName).toBe('Modified');
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('person builder produces same result as object pattern', () => {
				const builderResult = partyData
					.person()
					.fullName('John Doe')
					.firstName('John')
					.lastName('Doe')
					.build();

				const objectResult = partyData({
					type: 'person',
					fullName: 'John Doe',
					firstName: 'John',
					lastName: 'Doe',
				});

				expect(builderResult).toEqual(objectResult);
			});

			test('organization builder produces same result as object pattern', () => {
				const builderResult = partyData
					.organization()
					.name('Acme Corp')
					.legalName('Acme Corp, Inc.')
					.build();

				const objectResult = partyData({
					type: 'organization',
					name: 'Acme Corp',
					legalName: 'Acme Corp, Inc.',
				});

				expect(builderResult).toEqual(objectResult);
			});

			test('builder validates on build(), object validates immediately', () => {
				// Builder - no error until build()
				const builder = partyData.person();
				expect(() => builder.build()).toThrow();

				// Object - error immediately
				expect(() => partyData({ type: 'person' } as any)).toThrow();
			});
		});

		describe('common usage patterns', () => {
			test('creates individual signer', () => {
				const result = partyData
					.person()
					.fullName('Jane Smith')
					.firstName('Jane')
					.lastName('Smith')
					.signature('https://example.com/sig/janesmith.png')
					.build();

				expect(result.type).toBe('person');
				expect((result as any).signature).toBeDefined();
			});

			test('creates corporate signer', () => {
				const result = partyData
					.organization()
					.name('Acme Corporation')
					.legalName('Acme Corporation, Inc.')
					.entityType('corporation')
					.taxId('12-3456789')
					.signature('corporate-seal-id')
					.build();

				expect(result.type).toBe('organization');
				expect((result as any).signature).toBeDefined();
			});

			test('creates person with professional title', () => {
				const result = partyData
					.person()
					.fullName('Dr. Robert Johnson')
					.title('Dr.')
					.firstName('Robert')
					.lastName('Johnson')
					.build();

				expect((result as any).title).toBe('Dr.');
			});

			test('creates person with name suffix', () => {
				const result = partyData
					.person()
					.fullName('William Brown Jr.')
					.firstName('William')
					.lastName('Brown')
					.suffix('Jr.')
					.build();

				expect((result as any).suffix).toBe('Jr.');
			});

			test('creates LLC entity', () => {
				const result = partyData
					.organization()
					.name('TechStart')
					.legalName('TechStart, LLC')
					.domicile('Delaware')
					.entityType('LLC')
					.build();

				expect((result as any).entityType).toBe('LLC');
				expect((result as any).domicile).toBe('Delaware');
			});
		});
	});
});
