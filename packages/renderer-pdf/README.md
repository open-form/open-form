# @open-form/renderer-pdf

> PDF renderer for OpenForm framework

[![npm version](https://img.shields.io/npm/v/@open-form/renderer-pdf.svg)](https://www.npmjs.com/package/@open-form/renderer-pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Renders OpenForm documents to PDF format with form field filling and template support.

## Features

- **PDF form filling** - Fill PDF form fields with dynamic data
- **Field inspection** - Inspect available form fields in PDF templates
- **Binary output** - Returns Uint8Array for direct file writing or streaming
- **Type-safe** - Full TypeScript support with OpenForm core types

## Installation

```bash
npm install @open-form/renderer-pdf
# or
pnpm add @open-form/renderer-pdf
# or
yarn add @open-form/renderer-pdf
```

## Usage

```typescript
import { pdfRenderer } from "@open-form/renderer-pdf";

// Use the renderer with OpenForm
const result = await pdfRenderer.render(template, form, data);

// Write to file
await fs.writeFile("output.pdf", result);
```

### Inspecting PDF Fields

```typescript
import { inspectPdfFields } from "@open-form/renderer-pdf";

// Inspect available form fields in a PDF
const fields = await inspectPdfFields(pdfBuffer);
console.log(fields); // Array of field names and types
```

## API Reference

### `pdfRenderer`

OpenForm renderer implementation for PDF format.

**Properties:**
- `id: "pdf"` - Renderer identifier
- `supports: ["pdf"]` - Supported template types
- `outputExtension: "pdf"` - Output file extension
- `outputMime: "application/pdf"` - MIME type

**Methods:**
- `render(template, form, data): Promise<Uint8Array>` - Renders template with data

### `renderPdf(template, form, data, bindings)`

Low-level rendering function.

**Parameters:**
- `template: BinaryContent` - PDF template buffer
- `form: unknown` - Form definition
- `data: Record<string, unknown>` - Data to inject into PDF fields
- `bindings: unknown` - Field bindings configuration

**Returns:** `Promise<Uint8Array>` - Rendered PDF document

### `inspectPdfFields(pdfBuffer)`

Inspect form fields in a PDF template.

**Parameters:**
- `pdfBuffer: BinaryContent` - PDF buffer to inspect

**Returns:** `Promise<Array>` - Array of form field information

## Error Handling

```typescript
import { pdfRenderer } from "@open-form/renderer-pdf";

try {
  const result = await pdfRenderer.render(template, form, data);

  // result is Uint8Array
  console.log(`PDF generated: ${result.byteLength} bytes`);
} catch (error) {
  if (error instanceof Error) {
    console.error('PDF rendering failed:', error.message);
  } else {
    console.error('PDF rendering failed:', error);
  }
}

// Field inspection with error handling
try {
  const fields = await inspectPdfFields(pdfBuffer);
  console.log('Available fields:', fields);
} catch (error) {
  console.error('Failed to inspect PDF fields:', error);
}
```

## Related Packages

- [`@open-form/sdk`](../sdk) - Complete framework bundle

## License

MIT © [OpenForm](https://github.com/open-form)

## Acknowledgments

Built with these excellent libraries:

- [pdf-lib](https://pdf-lib.js.org/) - Create and modify PDF documents
