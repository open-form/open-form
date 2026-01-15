import { validateDuration } from '@/validators';
import { type Duration } from '@open-form/types';

function parse(input: unknown): Duration {
	if (!validateDuration(input)) {
		const errors = (validateDuration as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Duration: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return input as Duration;
}

class DurationBuilder {
	private _def: Duration = '';

	from(durationValue: Duration): this {
		this._def = parse(durationValue);
		return this;
	}

	value(val: Duration): this {
		this._def = parse(val);
		return this;
	}

	build(): Duration {
		return this._def;
	}
}

type DurationAPI = {
	(): DurationBuilder;
	(input: Duration): Duration;
	parse(input: unknown): Duration;
	safeParse(
		input: unknown,
	): { success: true; data: Duration } | { success: false; error: Error };
};

function durationImpl(): DurationBuilder;
function durationImpl(input: Duration): Duration;
function durationImpl(input?: Duration): DurationBuilder | Duration {
	if (input !== undefined) {
		return parse(input);
	}
	return new DurationBuilder();
}

export const duration: DurationAPI = Object.assign(durationImpl, {
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Duration } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
