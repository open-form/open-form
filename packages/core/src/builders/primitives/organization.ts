import { coerceTypes } from '@/validators/coerce';
import { validateOrganization } from '@/validators';
import { type Organization } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Organization') as Record<string, unknown>;

function parse(input: unknown): Organization {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>;
	if (!validateOrganization(coerced)) {
		const errors = (validateOrganization as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Organization: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Organization;
}

class OrganizationBuilder {
	private _def: Partial<Organization> = {};

	from(organizationValue: Organization): this {
		this._def = { ...parse(organizationValue) };
		return this;
	}

	name(value: string): this {
		this._def.name = value;
		return this;
	}

	legalName(value: string | undefined): this {
		this._def.legalName = value;
		return this;
	}

	domicile(value: string | undefined): this {
		this._def.domicile = value;
		return this;
	}

	entityType(value: string | undefined): this {
		this._def.entityType = value;
		return this;
	}

	entityId(value: string | undefined): this {
		this._def.entityId = value;
		return this;
	}

	taxId(value: string | undefined): this {
		this._def.taxId = value;
		return this;
	}

	build(): Organization {
		return parse(this._def);
	}
}

type OrganizationAPI = {
	(): OrganizationBuilder;
	(input: Organization): Organization;
	parse(input: unknown): Organization;
	safeParse(
		input: unknown,
	): { success: true; data: Organization } | { success: false; error: Error };
};

function organizationImpl(): OrganizationBuilder;
function organizationImpl(input: Organization): Organization;
function organizationImpl(
	input?: Organization,
): OrganizationBuilder | Organization {
	if (input !== undefined) {
		return parse(input);
	}
	return new OrganizationBuilder();
}

export const organization: OrganizationAPI = Object.assign(organizationImpl, {
	parse,
	safeParse: (
		input: unknown,
	):
		| { success: true; data: Organization }
		| { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
