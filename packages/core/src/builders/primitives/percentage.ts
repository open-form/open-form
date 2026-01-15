/**
 * Percentage primitive builder with range validation (0-100 by default)
 */

type PercentageOptions = {
	min?: number;
	max?: number;
	precision?: number;
};

const DEFAULT_OPTIONS: Required<PercentageOptions> = {
	min: 0,
	max: 100,
	precision: 2,
};

function isValidPercentage(
	value: number,
	options: PercentageOptions = {},
): boolean {
	const { min, max } = { ...DEFAULT_OPTIONS, ...options };
	return (
		typeof value === 'number' &&
		!isNaN(value) &&
		isFinite(value) &&
		value >= min &&
		value <= max
	);
}

function parse(input: unknown, options: PercentageOptions = {}): number {
	const { min, max, precision } = { ...DEFAULT_OPTIONS, ...options };

	if (typeof input !== 'number') {
		throw new Error(`Invalid Percentage: expected number, got ${typeof input}`);
	}
	if (isNaN(input) || !isFinite(input)) {
		throw new Error(`Invalid Percentage: value must be a finite number`);
	}
	if (input < min || input > max) {
		throw new Error(
			`Invalid Percentage: ${input} is outside the valid range (${min}-${max})`,
		);
	}

	// Round to specified precision
	const factor = Math.pow(10, precision);
	return Math.round(input * factor) / factor;
}

type PercentageAPI = {
	(input: number): number;
	parse(input: unknown, options?: PercentageOptions): number;
	safeParse(
		input: unknown,
		options?: PercentageOptions,
	): { success: true; data: number } | { success: false; error: Error };
	isValid(input: number, options?: PercentageOptions): boolean;
	/** Convert a decimal (0-1) to percentage (0-100) */
	fromDecimal(decimal: number): number;
	/** Convert a percentage (0-100) to decimal (0-1) */
	toDecimal(percentage: number): number;
};

function percentageImpl(input: number): number {
	return parse(input);
}

export const percentage: PercentageAPI = Object.assign(percentageImpl, {
	parse,
	safeParse: (
		input: unknown,
		options?: PercentageOptions,
	): { success: true; data: number } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input, options) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
	isValid: (input: number, options?: PercentageOptions): boolean => {
		return isValidPercentage(input, options);
	},
	fromDecimal: (decimal: number): number => {
		return parse(decimal * 100);
	},
	toDecimal: (pct: number): number => {
		return parse(pct) / 100;
	},
});
