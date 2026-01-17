import { Type } from '@sinclair/typebox';

/**
 * Signature requirements for a party role.
 */
const SignatureRequirementSchema = Type.Object(
	{
		/** Whether signature is required for this role. */
		required: Type.Boolean({
			description: 'Whether signature is required for this role',
		}),
		/** Type of signature accepted. */
		type: Type.Optional(
			Type.Union(
				[
					Type.Literal('electronic'),
					Type.Literal('wet'),
					Type.Literal('any'),
				],
				{
					default: 'any',
					description: 'Type of signature accepted',
				},
			),
		),
		/** Signing order (1 = first signer). */
		order: Type.Optional(
			Type.Number({
				minimum: 1,
				description: 'Signing sequence (1 = first signer)',
			}),
		),
	},
	{
		title: 'SignatureRequirement',
		description: 'Signature requirements for a party role',
	},
);

/**
 * Design-time party role definition.
 * Defines what roles exist and what constraints apply when filling a form.
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
		/** Whether multiple parties can fill this role. */
		multiple: Type.Optional(
			Type.Boolean({
				default: false,
				description: 'Whether multiple parties can fill this role',
			}),
		),
		/** Minimum parties required (when multiple=true). */
		min: Type.Optional(
			Type.Number({
				minimum: 0,
				description: 'Minimum parties required (when multiple=true)',
			}),
		),
		/** Maximum parties allowed (when multiple=true). */
		max: Type.Optional(
			Type.Number({
				minimum: 1,
				description: 'Maximum parties allowed (when multiple=true)',
			}),
		),
		/** Whether this role is required. Can be boolean or expression. */
		required: Type.Optional(Type.Ref('CondExpr')),
		/** Signature requirements for this role. */
		signature: Type.Optional(SignatureRequirementSchema),
	},
	{
		title: 'FormParty',
		description:
			'Design-time party role definition. Defines what roles exist and what constraints apply when filling a form.',
	},
);
