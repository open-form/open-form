import { Type } from '@sinclair/typebox';

/**
 * Witness requirements for form execution.
 */
export const WitnessRequirementSchema = Type.Object(
	{
		/** Whether witnesses are required. */
		required: Type.Boolean({
			description: 'Whether witnesses are required',
		}),
		/** Minimum number of witnesses required. */
		min: Type.Optional(
			Type.Number({
				minimum: 1,
				default: 1,
				description: 'Minimum number of witnesses required',
			}),
		),
		/** Maximum number of witnesses allowed. */
		max: Type.Optional(
			Type.Number({
				minimum: 1,
				description: 'Maximum number of witnesses allowed',
			}),
		),
		/** Whether witnesses must be notarized. */
		notarized: Type.Optional(
			Type.Boolean({
				default: false,
				description: 'Whether witnesses must be notarized',
			}),
		),
	},
	{
		title: 'WitnessRequirement',
		description: 'Witness requirements for form execution',
	},
);
