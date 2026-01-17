/**
 * Tests for README examples in @open-form/core
 * Verifies all code examples from the README work correctly
 */

import { describe, test, expect } from "vitest";
import {
  open,
  type InferFormData,
  type MoneyField,
  type AddressField,
  type UuidField,
} from "../src";

describe("@open-form/core - README Examples", () => {
  describe("Define forms with parties, fields, and validation rules", () => {
    test("creates residential lease agreement form", () => {
      const leaseAgreement = open
        .form()
        .name("residential-lease-agreement")
        .version("1.0.0")
        .title("Residential Lease Agreement")
        .defaultLayer("markdown")
        .layers({
          markdown: open
            .layer()
            .file()
            .mimeType("text/markdown")
            .path("fixtures/lease-agreement.md"),
        })
        .parties({
          landlord: open
            .party()
            .label("Landlord")
            .signature((sig) => sig.required()),
          tenant: open
            .party()
            .label("Tenant")
            .multiple(true)
            .min(1)
            .max(4)
            .signature((sig) => sig.required()),
        })
        .fields({
          leaseId: { type: "uuid", label: "Lease ID" },
          propertyAddress: {
            type: "address",
            label: "Property Address",
            required: true,
          },
          monthlyRent: { type: "money", label: "Monthly Rent", required: true },
          leaseStartDate: { type: "date", label: "Lease Start Date" },
        })
        .build();

      expect(leaseAgreement).toBeDefined();
      expect(leaseAgreement.schema.name).toBe("residential-lease-agreement");
      expect(leaseAgreement.schema.version).toBe("1.0.0");
      expect(leaseAgreement.schema.title).toBe("Residential Lease Agreement");
      expect(Object.keys(leaseAgreement.schema.parties || {})).toHaveLength(2);
      expect(leaseAgreement.schema.fields).toBeDefined();
    });
  });

  describe("Add file attachments and advanced field types", () => {
    test("creates commercial lease with annexes", () => {
      const advancedLease = open
        .form()
        .name("commercial-lease")
        .version("1.0.0")
        .title("Commercial Lease Agreement")
        .allowAnnexes(true)
        .annexes([
          open.annex().id("photoId").title("Photo ID").required(true),
          open
            .annex()
            .id("proofOfIncome")
            .title("Proof of Income")
            .required(true),
        ])
        .parties({
          landlord: open
            .party()
            .label("Landlord")
            .signature((sig) => sig.required()),
          tenant: open
            .party()
            .label("Tenant")
            .multiple(true)
            .signature((sig) => sig.required()),
        })
        .fields({
          leaseId: { type: "uuid", label: "Lease ID", required: true },
          leaseTermMonths: {
            type: "number",
            label: "Lease Term (months)",
            required: true,
          },
          monthlyRent: { type: "money", label: "Monthly Rent", required: true },
          petPolicy: {
            type: "enum",
            enum: ["no-pets", "small-pets", "all-pets"],
            label: "Pet Policy",
            required: true,
          },
        })
        .build();

      expect(advancedLease).toBeDefined();
      expect(advancedLease.schema.name).toBe("commercial-lease");
      expect(advancedLease.schema.annexes).toHaveLength(2);
      expect(advancedLease.schema.fields?.petPolicy.type).toBe("enum");
    });
  });

  describe("Define static documents with metadata", () => {
    test("creates lead paint disclosure document", () => {
      const leadPaintDisclosure = open
        .document()
        .name("lead-paint-disclosure")
        .version("1.0.0")
        .title("Lead Paint Disclosure")
        .code("EPA-747-K-12-001")
        .releaseDate("2025-12-01")
        .metadata({ agency: "EPA/HUD", cfr: "40 CFR 745" })
        .layers({
          pdf: open
            .layer()
            .file()
            .path("fixtures/lead-paint-disclosure.pdf")
            .mimeType("application/pdf"),
        })
        .defaultLayer("pdf")
        .build();

      expect(leadPaintDisclosure).toBeDefined();
      expect(leadPaintDisclosure.schema.name).toBe("lead-paint-disclosure");
      expect(leadPaintDisclosure.schema.kind).toBe("document");
      expect(leadPaintDisclosure.schema.code).toBe("EPA-747-K-12-001");
      expect(leadPaintDisclosure.schema.releaseDate).toBe("2025-12-01");
      expect(leadPaintDisclosure.schema.metadata).toEqual({
        agency: "EPA/HUD",
        cfr: "40 CFR 745",
      });
    });
  });

  describe("Define workflow checklists with status tracking", () => {
    test("creates lease application checklist", () => {
      const leaseChecklist = open
        .checklist()
        .name("lease-application-checklist")
        .version("1.0.0")
        .title("Lease Application Checklist")
        .items([
          {
            id: "application_received",
            title: "Application Received",
            status: { kind: "boolean" },
          },
          {
            id: "credit_check",
            title: "Credit Check Complete",
            status: { kind: "boolean" },
          },
          {
            id: "background_check",
            title: "Background Check Complete",
            status: { kind: "boolean" },
          },
          {
            id: "lease_signed",
            title: "Lease Signed",
            status: { kind: "boolean" },
          },
        ])
        .build();

      expect(leaseChecklist).toBeDefined();
      expect(leaseChecklist.schema.kind).toBe("checklist");
      expect(leaseChecklist.schema.items).toHaveLength(4);
      expect(leaseChecklist.schema.items[0].id).toBe("application_received");
    });
  });

  describe("Compose artifacts into bundles", () => {
    test("creates bundle with multiple artifacts", () => {
      const propertyAddress: AddressField = {
        type: "address",
        label: "Property Address",
        required: true,
      };
      const monthlyRent: MoneyField = {
        type: "money",
        label: "Monthly Rent",
        required: true,
      };

      const residentialLease = open
        .form()
        .name("residential-lease")
        .version("1.0.0")
        .fields({ leaseId: { type: "uuid" }, propertyAddress, monthlyRent })
        .build();

      const commercialLease = open
        .form()
        .name("commercial-lease")
        .version("1.0.0")
        .fields({ leaseId: { type: "uuid" }, propertyAddress, monthlyRent })
        .build();

      const leadPaintDisclosure = open
        .document()
        .name("lead-paint-disclosure")
        .version("1.0.0")
        .title("Lead Paint Disclosure")
        .layers({
          pdf: {
            kind: "file",
            path: "fixtures/lead-paint-disclosure.pdf",
            mimeType: "application/pdf",
          },
        })
        .build();

      const leaseChecklist = open
        .checklist()
        .name("lease-application-checklist")
        .version("1.0.0")
        .title("Lease Application Checklist")
        .items([
          {
            id: "application_received",
            title: "Application Received",
            status: { kind: "boolean" },
          },
          {
            id: "credit_check",
            title: "Credit Check Complete",
            status: { kind: "boolean" },
          },
        ])
        .build();

      const leaseBundle = open
        .bundle()
        .name("residential-lease-bundle")
        .version("1.0.0")
        .contents([
          {
            type: "inline",
            key: "residential",
            artifact: residentialLease.schema,
          },
          {
            type: "inline",
            key: "commercial",
            artifact: commercialLease.schema,
          },
          {
            type: "inline",
            key: "disclosure",
            artifact: leadPaintDisclosure.schema,
          },
          { type: "inline", key: "checklist", artifact: leaseChecklist.schema },
        ])
        .build();

      expect(leaseBundle).toBeDefined();
      expect(leaseBundle.schema.kind).toBe("bundle");
      expect(leaseBundle.schema.contents).toHaveLength(4);
    });
  });

  describe("Extract TypeScript types from artifacts and validate", () => {
    test("infers form data type and validates with correct data", () => {
      const leaseAgreement = open
        .form()
        .name("residential-lease-agreement")
        .version("1.0.0")
        .title("Residential Lease Agreement")
        .fields({
          leaseId: { type: "uuid", label: "Lease ID" },
          propertyAddress: {
            type: "address",
            label: "Property Address",
            required: true,
          },
          monthlyRent: { type: "money", label: "Monthly Rent", required: true },
          leaseStartDate: { type: "date", label: "Lease Start Date" },
        })
        .build();

      type LeaseData = InferFormData<typeof leaseAgreement>;

      const data: LeaseData = {
        fields: {
          leaseId: "550e8400-e29b-41d4-a716-446655440000" as const,
          propertyAddress: {
            line1: "123 Main St",
            locality: "Portland",
            region: "OR",
            postalCode: "97201",
            country: "USA",
          },
          monthlyRent: { amount: 1500, currency: "USD" },
          leaseStartDate: "2024-02-01",
        },
        annexes: {},
      };

      // Verify form is valid
      expect(leaseAgreement.isValid()).toBe(true);

      // Fill form with data
      const filled = leaseAgreement.fill(data);
      expect(filled).toBeDefined();
      expect(filled.data).toBeDefined();
      expect(filled.get("leaseId")).toBe(
        "550e8400-e29b-41d4-a716-446655440000"
      );
    });
  });
});
