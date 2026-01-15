# @open-form/renderer-docx

> DOCX renderer for OpenForm framework

[![npm version](https://img.shields.io/npm/v/@open-form/renderer-docx.svg)](https://www.npmjs.com/package/@open-form/renderer-docx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Renders OpenForm documents to DOCX (Microsoft Word) format using template-based rendering.

## Features

- **Template-based rendering** - Use DOCX files as templates with placeholders
- **Dynamic data injection** - Populate templates with form data
- **Binary output** - Returns Uint8Array for direct file writing or streaming
- **Type-safe** - Full TypeScript support with OpenForm core types

## Installation

```bash
npm install @open-form/renderer-docx
# or
pnpm add @open-form/renderer-docx
# or
yarn add @open-form/renderer-docx
```

## Usage

```typescript
import { docxRenderer } from "@open-form/renderer-docx";

// Use the renderer with OpenForm
const result = await docxRenderer.render(template, form, data);

// Write to file
await fs.writeFile("output.docx", result);
```

## API Reference

### `docxRenderer`

OpenForm renderer implementation for DOCX format.

**Properties:**
- `id: "docx"` - Renderer identifier
- `supports: ["docx"]` - Supported template types
- `outputExtension: "docx"` - Output file extension
- `outputMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"` - MIME type

**Methods:**
- `render(template, form, data): Promise<Uint8Array>` - Renders template with data

### `renderDocx(template, data)`

Low-level rendering function.

**Parameters:**
- `template: BinaryContent` - DOCX template buffer
- `data: Record<string, unknown>` - Data to inject into template

**Returns:** `Promise<Uint8Array>` - Rendered DOCX document

## Error Handling

```typescript
import { docxRenderer } from "@open-form/renderer-docx";

try {
  const result = await docxRenderer.render(template, form, data);

  // result is Uint8Array
  console.log(`DOCX generated: ${result.byteLength} bytes`);

  // Write to file
  await fs.writeFile("output.docx", result);
} catch (error) {
  if (error instanceof Error) {
    console.error('DOCX rendering failed:', error.message);
  } else {
    console.error('DOCX rendering failed:', error);
  }
}
```

## Related Packages

- [`@open-form/sdk`](../sdk) - Complete framework bundle

## License

MIT © [OpenForm](https://github.com/open-form)

## Acknowledgments

Built with these excellent libraries:

- [docx-templates](https://github.com/guigrpa/docx-templates) - Template-based DOCX generation
