<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=renderer_pdf" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/renderer-pdf</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=renderer_pdf)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=renderer_pdf) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

Renders OpenForm documents to PDF format with automatic field type detection and serialization.

- **Automatic field serialization** - Detects field types (Money, Person, Phone, Address, Organization) from form schema and automatically formats them
- **PDF form filling** - Fill PDF form fields with dynamic data
- **Field inspection** - Inspect available form fields in PDF templates
- **Binary output** - Returns Uint8Array for direct file writing or streaming
- **Type-safe** - Full TypeScript support with OpenForm core types

## Installation

```bash
npm install @open-form/renderer-pdf
```

## Usage

### Direct Rendering with renderPdf()

Render PDF templates directly with automatic field serialization:

```typescript
import { renderPdf } from "@open-form/renderer-pdf";
import fs from "node:fs";
import { petAddendumForm } from "./forms/pet-addendum";

const template = fs.readFileSync("pet-addendum.pdf");

const output = await renderPdf(
  new Uint8Array(template),
  petAddendumForm,
  {
    petName: {
      firstName: "Fluffy",
      lastName: "Whiskers",
      fullName: "Fluffy Whiskers",
    },
    monthlyFee: {
      amount: 100,
      currency: "USD",
    },
  }
);

// output is Uint8Array - write to file
fs.writeFileSync("output.pdf", output);
```

**`renderPdf()` Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template` | `BinaryContent` | Yes | PDF template as binary |
| `form` | `Form` | Yes | Form definition containing field schemas |
| `data` | `Record<string, unknown>` | Yes | Data object to populate form fields |
| `bindings` | `Record<string, string>` | No | Optional mapping from PDF field names to form field names |
| `serializers` | `SerializerRegistry` | No | Custom serializer registry (defaults to USA serializers) |

**Returns:** `Promise<BinaryContent>` - Rendered PDF as binary

### Using the Form Builder API

Render PDF using the OpenForm builder pattern with method chaining:

```typescript
import { pdfRenderer } from "@open-form/renderer-pdf";
import { createFsResolver } from "@open-form/resolvers/fs";
import { petAddendumForm } from "./forms/pet-addendum";

const resolver = createFsResolver({ root: "./templates" });

const output = await petAddendumForm
  .fill({
    fields: {
      petName: {
        firstName: "Fluffy",
        lastName: "Whiskers",
        fullName: "Fluffy Whiskers",
      },
      monthlyFee: {
        amount: 100,
        currency: "USD",
      },
    },
  })
  .render({
    renderer: pdfRenderer,
    layer: "pdf",
    resolver,
  });

// output is Uint8Array
```

**`pdfRenderer` Instance:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Renderer identifier: "pdf" |
| `render()` | `function` | Async render function accepting RenderRequest |

**Form `.render()` Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `renderer` | `OpenFormRenderer` | Yes | Renderer instance (`pdfRenderer`) |
| `layer` | `string` | Yes | Name of the template layer to render |
| `resolver` | `FileResolver` | No | File resolver for loading template files |

**Returns:** `Promise<BinaryContent>` - Rendered PDF as binary

## Changelog

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/renderer-pdf/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/sdk`](../sdk) - OpenForm framework SDK
- [`@open-form/renderers`](../renderers) - All renderers in one package

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.

## Acknowledgments

Built with these excellent libraries:

- [pdf-lib](https://pdf-lib.js.org/) - Create and modify PDF documents
