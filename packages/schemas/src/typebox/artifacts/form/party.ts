import { Type } from '@sinclair/typebox';

const FormSignatureSchema = Type.Object(
	{
		/** Whether signature is required for this role. Defaults to false. */
		required: Type.Optional(
			Type.Boolean({
				default: false,
				description: 'Whether signature is required for this role',
			}),
		),
		/** Number of witnesses required for this signature. 0 or omitted means no witnesses. */
		witnesses: Type.Optional(
			Type.Number({
				minimum: 0,
				default: 0,
				description: 'Number of witnesses required for this signature',
			}),
		),
		/** Whether at least one witness must be a notary. Requires witnesses >= 1. */
		notarized: Type.Optional(
			Type.Boolean({
				default: false,
				description: 'Whether at least one witness must be a notary',
			}),
		),
	},
	{
		title: 'FormSignature',
		description: 'Design-time signature requirements for a party role',
	},
);


/**
 * Design-time party role definition.
 * Defines what roles exist and what constraints apply when filling a form.
 *
 * Party data format is determined by max:
 * - max = 1 (default): single party object with required `id`
 * - max > 1: array of party objects, each with required `id`
 *
 * ID convention: `{role}-{index}` (e.g., "tenant-0", "landlord-1")
 */
export const FormPartySchema = Type.Object(
	{
		/** Human-readable role name. */
		label: Type.String({
			minLength: 1,
			maxLength: 100,
			description: 'Display name for this role',
		}),
		/** Description of this role. */
		description: Type.Optional(
			Type.String({
				maxLength: 500,
				description: 'Description of this role',
			}),
		),
		/** Constraint on party type (person, organization, or any). */
		partyType: Type.Optional(
			Type.Union(
				[
					Type.Literal('person'),
					Type.Literal('organization'),
					Type.Literal('any'),
				],
				{
					default: 'any',
					description: 'Constraint on party type',
				},
			),
		),
		/** Minimum parties required. Defaults to 1. */
		min: Type.Optional(
			Type.Number({
				minimum: 0,
				default: 1,
				description: 'Minimum parties required',
			}),
		),
		/** Maximum parties allowed. Defaults to 1. */
		max: Type.Optional(
			Type.Number({
				minimum: 1,
				default: 1,
				description: 'Maximum parties allowed',
			}),
		),
		/** Whether this role is required. Can be boolean or expression. */
		required: Type.Optional(Type.Ref('CondExpr')),
		/** Signature requirements for this role. */
		signature: Type.Optional(FormSignatureSchema),
	},
	{
		title: 'FormParty',
		description:
			'Design-time party role definition. Defines what roles exist and what constraints apply when filling a form.',
	},
);
