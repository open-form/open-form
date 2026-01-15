import { coerceTypes } from '@/validators/coerce';
import { validateField } from '@/validators';
import { deepClone } from '@/utils/clone';
import type {
	Field,
	FieldsetField,
	TextField,
	BooleanField,
	NumberField,
	CoordinateField,
	BboxField,
	MoneyField,
	AddressField,
	PhoneField,
	DurationField,
	EmailField,
	UuidField,
	UriField,
	EnumField,
	// New field types:
	DateField,
	DatetimeField,
	TimeField,
	PersonField,
	OrganizationField,
	IdentificationField,
	MultiselectField,
	PercentageField,
	RatingField,
	// Primitives:
	Coordinate,
	Bbox,
	Money,
	Address,
	Phone,
	Duration,
	Person,
	Organization,
	Identification,
} from '@open-form/types';

import { extractSchema } from '@/schemas/extract';
import type { CondExpr } from '@/logic';

const schema = extractSchema('Field') as Record<string, unknown>;

function parse(input: unknown): Field {
	// Deep clone the input first to ensure immutability when building
	const cloned = deepClone(input);
	const coerced = coerceTypes(schema, cloned) as Record<string, unknown>;
	if (!validateField(coerced)) {
		const errors = (validateField as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Field: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Field;
}

// ============================================================================
// Builders
// ============================================================================

abstract class AbstractFieldBuilder<T extends Field> {
	protected _def: Record<string, unknown>;

	protected constructor(type: string) {
		this._def = { type };
	}

	label(value: string): this {
		this._def.label = value;
		return this;
	}

	description(value: string): this {
		this._def.description = value;
		return this;
	}

	/**
	 * Sets whether the field is required.
	 * @param value - Boolean or expression string. Defaults to true.
	 */
	required(value: CondExpr = true): this {
		this._def.required = value;
		return this;
	}

	/**
	 * Sets whether the field is visible.
	 * @param value - Boolean or expression string. Defaults to true.
	 */
	visible(value: CondExpr = true): this {
		this._def.visible = value;
		return this;
	}

	build(): T {
		return parse(this._def) as T;
	}
}

class TextFieldBuilder extends AbstractFieldBuilder<TextField> {
	constructor() {
		super('text');
	}

	minLength(value: number): this {
		this._def.minLength = value;
		return this;
	}

	maxLength(value: number): this {
		this._def.maxLength = value;
		return this;
	}

	pattern(value: string): this {
		this._def.pattern = value;
		return this;
	}

	default(value: string): this {
		this._def.default = value;
		return this;
	}
}

class BooleanFieldBuilder extends AbstractFieldBuilder<BooleanField> {
	constructor() {
		super('boolean');
	}

	default(value: boolean): this {
		this._def.default = value;
		return this;
	}
}

class NumberFieldBuilder extends AbstractFieldBuilder<NumberField> {
	constructor() {
		super('number');
	}

	min(value: number): this {
		this._def.min = value;
		return this;
	}

	max(value: number): this {
		this._def.max = value;
		return this;
	}

	default(value: number): this {
		this._def.default = value;
		return this;
	}
}

class CoordinateFieldBuilder extends AbstractFieldBuilder<CoordinateField> {
	constructor() {
		super('coordinate');
	}

	default(value: Coordinate): this {
		this._def.default = value;
		return this;
	}
}

class BboxFieldBuilder extends AbstractFieldBuilder<BboxField> {
	constructor() {
		super('bbox');
	}

	default(value: Bbox): this {
		this._def.default = value;
		return this;
	}
}

class MoneyFieldBuilder extends AbstractFieldBuilder<MoneyField> {
	constructor() {
		super('money');
	}

	min(value: number): this {
		this._def.min = value;
		return this;
	}

	max(value: number): this {
		this._def.max = value;
		return this;
	}

	default(value: Money): this {
		this._def.default = value;
		return this;
	}
}

class AddressFieldBuilder extends AbstractFieldBuilder<AddressField> {
	constructor() {
		super('address');
	}

	default(value: Address): this {
		this._def.default = value;
		return this;
	}
}

class PhoneFieldBuilder extends AbstractFieldBuilder<PhoneField> {
	constructor() {
		super('phone');
	}

	default(value: Phone): this {
		this._def.default = value;
		return this;
	}
}

class DurationFieldBuilder extends AbstractFieldBuilder<DurationField> {
	constructor() {
		super('duration');
	}

	default(value: Duration): this {
		this._def.default = value;
		return this;
	}
}

class EmailFieldBuilder extends AbstractFieldBuilder<EmailField> {
	constructor() {
		super('email');
	}

	minLength(value: number): this {
		this._def.minLength = value;
		return this;
	}

	maxLength(value: number): this {
		this._def.maxLength = value;
		return this;
	}

	pattern(value: string): this {
		this._def.pattern = value;
		return this;
	}

	default(value: string): this {
		this._def.default = value;
		return this;
	}
}

class UuidFieldBuilder extends AbstractFieldBuilder<UuidField> {
	constructor() {
		super('uuid');
	}

	minLength(value: number): this {
		this._def.minLength = value;
		return this;
	}

	maxLength(value: number): this {
		this._def.maxLength = value;
		return this;
	}

	pattern(value: string): this {
		this._def.pattern = value;
		return this;
	}

	default(value: string): this {
		this._def.default = value;
		return this;
	}
}

class UriFieldBuilder extends AbstractFieldBuilder<UriField> {
	constructor() {
		super('uri');
	}

	minLength(value: number): this {
		this._def.minLength = value;
		return this;
	}

	maxLength(value: number): this {
		this._def.maxLength = value;
		return this;
	}

	pattern(value: string): this {
		this._def.pattern = value;
		return this;
	}

	default(value: string): this {
		this._def.default = value;
		return this;
	}
}

class EnumFieldBuilder extends AbstractFieldBuilder<EnumField> {
	constructor() {
		super('enum');
	}

	enum(...values: (string | number)[]): this {
		this._def.enum = values;
		return this;
	}

	default(value: string | number): this {
		this._def.default = value;
		return this;
	}
}

// ============================================================================
// New Field Builders: Temporal, Entity, Selection, Numeric
// ============================================================================

class DateFieldBuilder extends AbstractFieldBuilder<DateField> {
	constructor() {
		super('date');
	}

	min(value: string): this {
		this._def.min = value;
		return this;
	}

	max(value: string): this {
		this._def.max = value;
		return this;
	}

	default(value: string): this {
		this._def.default = value;
		return this;
	}
}

class DatetimeFieldBuilder extends AbstractFieldBuilder<DatetimeField> {
	constructor() {
		super('datetime');
	}

	min(value: string): this {
		this._def.min = value;
		return this;
	}

	max(value: string): this {
		this._def.max = value;
		return this;
	}

	default(value: string): this {
		this._def.default = value;
		return this;
	}
}

class TimeFieldBuilder extends AbstractFieldBuilder<TimeField> {
	constructor() {
		super('time');
	}

	min(value: string): this {
		this._def.min = value;
		return this;
	}

	max(value: string): this {
		this._def.max = value;
		return this;
	}

	default(value: string): this {
		this._def.default = value;
		return this;
	}
}

class PersonFieldBuilder extends AbstractFieldBuilder<PersonField> {
	constructor() {
		super('person');
	}

	default(value: Person): this {
		this._def.default = value;
		return this;
	}
}

class OrganizationFieldBuilder extends AbstractFieldBuilder<OrganizationField> {
	constructor() {
		super('organization');
	}

	default(value: Organization): this {
		this._def.default = value;
		return this;
	}
}

class IdentificationFieldBuilder extends AbstractFieldBuilder<IdentificationField> {
	constructor() {
		super('identification');
	}

	allowedTypes(...types: string[]): this {
		this._def.allowedTypes = types;
		return this;
	}

	default(value: Identification): this {
		this._def.default = value;
		return this;
	}
}

class MultiselectFieldBuilder extends AbstractFieldBuilder<MultiselectField> {
	constructor() {
		super('multiselect');
	}

	options(...values: (string | number)[]): this {
		this._def.options = values;
		return this;
	}

	min(value: number): this {
		this._def.min = value;
		return this;
	}

	max(value: number): this {
		this._def.max = value;
		return this;
	}

	default(value: (string | number)[]): this {
		this._def.default = value;
		return this;
	}
}

class PercentageFieldBuilder extends AbstractFieldBuilder<PercentageField> {
	constructor() {
		super('percentage');
	}

	min(value: number): this {
		this._def.min = value;
		return this;
	}

	max(value: number): this {
		this._def.max = value;
		return this;
	}

	precision(value: number): this {
		this._def.precision = value;
		return this;
	}

	default(value: number): this {
		this._def.default = value;
		return this;
	}
}

class RatingFieldBuilder extends AbstractFieldBuilder<RatingField> {
	constructor() {
		super('rating');
	}

	min(value: number): this {
		this._def.min = value;
		return this;
	}

	max(value: number): this {
		this._def.max = value;
		return this;
	}

	step(value: number): this {
		this._def.step = value;
		return this;
	}

	default(value: number): this {
		this._def.default = value;
		return this;
	}
}

class FieldsetFieldBuilder extends AbstractFieldBuilder<FieldsetField> {
	constructor() {
		super('fieldset');
	}

	fields(fieldsObj: Record<string, Field>): this {
		this._def.fields = fieldsObj;
		return this;
	}

	build(): FieldsetField {
		// Parse nested fields recursively
		const fields = this._def.fields as Record<string, unknown>;
		const parsedFields: Record<string, Field> = {};
		for (const [id, fieldDef] of Object.entries(fields)) {
			parsedFields[id] = parse(fieldDef) as Field;
		}
		this._def.fields = parsedFields;
		return parse(this._def) as FieldsetField;
	}
}

type FieldAPI = {
	(): TextFieldBuilder;
	(input: Field): Field;
	text(): TextFieldBuilder;
	boolean(): BooleanFieldBuilder;
	number(): NumberFieldBuilder;
	coordinate(): CoordinateFieldBuilder;
	bbox(): BboxFieldBuilder;
	money(): MoneyFieldBuilder;
	address(): AddressFieldBuilder;
	phone(): PhoneFieldBuilder;
	duration(): DurationFieldBuilder;
	email(): EmailFieldBuilder;
	uuid(): UuidFieldBuilder;
	uri(): UriFieldBuilder;
	enum(): EnumFieldBuilder;
	// New field types:
	date(): DateFieldBuilder;
	datetime(): DatetimeFieldBuilder;
	time(): TimeFieldBuilder;
	person(): PersonFieldBuilder;
	organization(): OrganizationFieldBuilder;
	identification(): IdentificationFieldBuilder;
	multiselect(): MultiselectFieldBuilder;
	percentage(): PercentageFieldBuilder;
	rating(): RatingFieldBuilder;
	fieldset(): FieldsetFieldBuilder;
	parse(input: unknown): Field;
	safeParse(
		input: unknown,
	): { success: true; data: Field } | { success: false; error: Error };
};

function fieldImpl(): TextFieldBuilder;
function fieldImpl(input: Field): Field;
function fieldImpl(input?: Field): TextFieldBuilder | Field {
	if (input !== undefined) {
		return parse(input) as Field;
	}
	return new TextFieldBuilder();
}

export const field: FieldAPI = Object.assign(fieldImpl, {
	text: () => new TextFieldBuilder(),
	boolean: () => new BooleanFieldBuilder(),
	number: () => new NumberFieldBuilder(),
	coordinate: () => new CoordinateFieldBuilder(),
	bbox: () => new BboxFieldBuilder(),
	money: () => new MoneyFieldBuilder(),
	address: () => new AddressFieldBuilder(),
	phone: () => new PhoneFieldBuilder(),
	duration: () => new DurationFieldBuilder(),
	email: () => new EmailFieldBuilder(),
	uuid: () => new UuidFieldBuilder(),
	uri: () => new UriFieldBuilder(),
	enum: () => new EnumFieldBuilder(),
	// New field types:
	date: () => new DateFieldBuilder(),
	datetime: () => new DatetimeFieldBuilder(),
	time: () => new TimeFieldBuilder(),
	person: () => new PersonFieldBuilder(),
	organization: () => new OrganizationFieldBuilder(),
	identification: () => new IdentificationFieldBuilder(),
	multiselect: () => new MultiselectFieldBuilder(),
	percentage: () => new PercentageFieldBuilder(),
	rating: () => new RatingFieldBuilder(),
	fieldset: () => new FieldsetFieldBuilder(),
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Field } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
