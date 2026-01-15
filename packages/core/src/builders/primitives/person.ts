import { coerceTypes } from '@/validators/coerce';
import { validatePerson } from '@/validators';
import { type Person } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Person') as Record<string, unknown>;

function parse(input: unknown): Person {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>;
	if (!validatePerson(coerced)) {
		const errors = (validatePerson as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Person: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Person;
}

class PersonBuilder {
	private _def: Partial<Person> = {};

	from(personValue: Person): this {
		this._def = { ...parse(personValue) };
		return this;
	}

	fullName(value: string): this {
		this._def.fullName = value;
		return this;
	}

	title(value: string | undefined): this {
		this._def.title = value;
		return this;
	}

	firstName(value: string | undefined): this {
		this._def.firstName = value;
		return this;
	}

	middleName(value: string | undefined): this {
		this._def.middleName = value;
		return this;
	}

	lastName(value: string | undefined): this {
		this._def.lastName = value;
		return this;
	}

	suffix(value: string | undefined): this {
		this._def.suffix = value;
		return this;
	}

	build(): Person {
		return parse(this._def);
	}
}

type PersonAPI = {
	(): PersonBuilder;
	(input: Person): Person;
	parse(input: unknown): Person;
	safeParse(
		input: unknown,
	): { success: true; data: Person } | { success: false; error: Error };
};

function personImpl(): PersonBuilder;
function personImpl(input: Person): Person;
function personImpl(input?: Person): PersonBuilder | Person {
	if (input !== undefined) {
		return parse(input);
	}
	return new PersonBuilder();
}

export const person: PersonAPI = Object.assign(personImpl, {
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Person } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
