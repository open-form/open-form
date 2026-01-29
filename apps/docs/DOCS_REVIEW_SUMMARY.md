# Documentation Review Summary

## Changes Made

### Schema Documentation (`apps/docs/content/docs/schemas/`)

#### FormParty (`schemas/artifacts/form/party.mdx`)
- **Removed** `multiple` property (deprecated)
- **Updated** `min`/`max` descriptions - no longer dependent on `multiple`
- **Added** party data format explanation based on `max` value
- **Added** ID convention (`{role}-{index}`)
- **Updated** examples to show single-party vs multi-party patterns with `id` field

#### Form Index (`schemas/artifacts/form/index.mdx`)
- **Updated** YAML and JSON examples to remove `multiple: true` from tenant party
- **Updated** comment to clarify `max > 1` enables array format

#### Signature Primitive (`schemas/primitives/signature.mdx`)
- **Updated** examples to show witness attestation use case
- **Added** section linking to new runtime signature system (AdoptedSignature, SignatureCapture)

### SDK Documentation (`apps/docs/content/docs/sdk/`)

#### Party Builder (`sdk/core/artifacts/form/party.mdx`)
- **Removed** `.multiple()` method from builder pattern
- **Added** `.optional()` method (sets min: 0)
- **Updated** `min`/`max` descriptions in properties table
- **Updated** "Multiple Parties" section to use just `max` without `multiple`
- **Updated** "Runtime Party Data" section to include required `id` field
- **Updated** object pattern example to remove `multiple: false`

#### Form Index (`sdk/core/artifacts/form/index.mdx`)
- **Updated** "Filling a form" example to use new signature workflow
- **Updated** RuntimeForm properties table:
  - Replaced `signatures` with `adopted` and `captures`
  - Replaced `getSignature`, `hasSigned`, `setSignature` with new methods
  - Added: `adoptSignature`, `adoptInitials`, `captureSignature`, `captureInitials`, `hasAdoptedSignature`, `isLocationCaptured`
  - Renamed `set` to `setField`, `update` to `updateFields`
  - Added witness methods: `getWitness`, `hasWitness`, `removeWitness`, `updateWitness`
  - Added attestation methods: `getAttestationsByWitness`, `getAttestationsForParty`, `isSignatureWitnessed`, `removeAttestation`
  - Added adopted signature methods: `getAdoptedSignature`, `getAdoptedInitials`, `hasAdoptedInitials`, `removeAdoptedSignature`, `removeAdoptedInitials`
  - Added capture methods: `getCapture`, `getCapturesForLocation`, `getCapturesForParty`, `removeCapture`
- **Updated** Related links to point to new runtime types

#### Runtime Index (`sdk/runtime/index.mdx`)
- **Reorganized** into sections: Party Types, Signature Types, Data Types
- **Fixed** links to use `/sdk/runtime/` prefix
- **Updated** Design-Time vs Runtime table

#### Attestation (`sdk/runtime/attestation.mdx`)
- **Added** `locationId` property to AttestationTarget table

### New Documentation Created

| File | Description |
|------|-------------|
| `sdk/runtime/adopted-signature.mdx` | AdoptedSignature and AdoptedSignatures types |
| `sdk/runtime/signature-capture.mdx` | SignatureCapture type with template helper examples |
| `sdk/runtime/form-data.mdx` | FormData runtime payload structure |
| `sdk/runtime/checklist-data.mdx` | ChecklistData runtime payload structure |

Updated `sdk/runtime/meta.json` to include new pages.

---

## Items for Review

### Verified Against Code ✅

1. **RuntimeForm method names**: VERIFIED ✅
   - `setField()` - confirmed at `runtime-form.ts:603`
   - `updateFields()` - confirmed at `runtime-form.ts:630`
   - `getField()` - confirmed at `runtime-form.ts:372`
   - `getAllFields()` - confirmed at `runtime-form.ts:383`

2. **`getSignatureStatus()` return type**: VERIFIED ✅
   - Returns `{ required: number, collected: number, complete: boolean, parties: Array<{ partyId, hasAdopted, witnessed }> }`
   - Confirmed at `runtime-form.ts:1368-1399`

3. **Template helpers**: VERIFIED ✅
   - 3-argument pattern `{{signature "role" partyId "locationId"}}` confirmed at `signature-helpers.ts:167-170`
   - `{{initials "role" partyId "locationId"}}` confirmed at `signature-helpers.ts:217-220`

4. **Links verification**: VERIFIED ✅
   - All links in documentation point to valid pages
   - FormSignature link correctly points to `/schemas/artifacts/form/party` (FormSignature is documented within FormParty)
   - Runtime links (`/sdk/runtime/*`) all have corresponding `.mdx` files

### Potentially Missing Documentation

1. **SDK primitives**: The `sdk/core/primitives/` folder has docs for individual primitives but may need updates to include `id` field usage for party data.

2. **Renderer docs**: The renderers (`sdk/renderers/`) may need updates to document how template helpers work with the new signature capture system.

3. **WitnessStatus type**: Referenced in RuntimeForm but not documented separately.

4. **OverallSignatureStatus type**: Referenced in RuntimeForm but not documented separately.

---

## Files Modified

```
apps/docs/content/docs/schemas/artifacts/form/party.mdx
apps/docs/content/docs/schemas/artifacts/form/index.mdx
apps/docs/content/docs/schemas/primitives/signature.mdx
apps/docs/content/docs/sdk/core/artifacts/form/party.mdx
apps/docs/content/docs/sdk/core/artifacts/form/index.mdx
apps/docs/content/docs/sdk/runtime/index.mdx
apps/docs/content/docs/sdk/runtime/attestation.mdx
apps/docs/content/docs/sdk/runtime/meta.json
```

## Files Created

```
apps/docs/content/docs/sdk/runtime/adopted-signature.mdx
apps/docs/content/docs/sdk/runtime/signature-capture.mdx
apps/docs/content/docs/sdk/runtime/form-data.mdx
apps/docs/content/docs/sdk/runtime/checklist-data.mdx
```
