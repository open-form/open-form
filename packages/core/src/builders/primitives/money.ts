import { coerceTypes } from '@/validators/coerce';
import { validateMoney } from '@/validators';
import { type Money } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Money') as Record<string, unknown>;

function parse(input: unknown): Money {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>;

	// Check for NaN and Infinity values (JSON Schema doesn't handle these)
	if (typeof coerced.amount === 'number') {
		if (isNaN(coerced.amount)) {
			throw new Error('Invalid Money: amount must be a valid number');
		}
		if (!isFinite(coerced.amount)) {
			throw new Error('Invalid Money: amount cannot be Infinity');
		}
	}

	if (!validateMoney(coerced)) {
		const errors = (validateMoney as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Money: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Money;
}

class MoneyBuilder {
	private _def: Partial<Money> = {};

	from(moneyValue: Money): this {
		this._def = { ...parse(moneyValue) };
		return this;
	}

	amount(value: number): this {
		this._def.amount = value;
		return this;
	}

	currency(value: string): this {
		this._def.currency = value;
		return this;
	}

	build(): Money {
		return parse(this._def);
	}
}

type MoneyAPI = {
	(): MoneyBuilder;
	(input: Money): Money;
	parse(input: unknown): Money;
	safeParse(
		input: unknown,
	): { success: true; data: Money } | { success: false; error: Error };
};

function moneyImpl(): MoneyBuilder;
function moneyImpl(input: Money): Money;
function moneyImpl(input?: Money): MoneyBuilder | Money {
	if (input !== undefined) {
		return parse(input);
	}
	return new MoneyBuilder();
}

export const money: MoneyAPI = Object.assign(moneyImpl, {
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Money } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
