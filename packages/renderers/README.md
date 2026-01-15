# @open-form/renderers

> All OpenForm renderers in one package

[![npm version](https://img.shields.io/npm/v/@open-form/renderers.svg)](https://www.npmjs.com/package/@open-form/renderers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Umbrella package that re-exports all OpenForm renderers for convenient installation and usage.

## Features

- **All-in-one** - Single package containing all renderers
- **DOCX rendering** - Microsoft Word document generation
- **PDF rendering** - PDF form filling and generation
- **Text rendering** - Plain text template rendering
- **Type-safe** - Full TypeScript support

## Installation

```bash
npm install @open-form/renderers
# or
pnpm add @open-form/renderers
# or
yarn add @open-form/renderers
```

## Usage

### Import all renderers

```typescript
import {
  docxRenderer,
  pdfRenderer,
  textRenderer
} from "@open-form/renderers";

// Use any renderer
const docxResult = await docxRenderer.render(template, form, data);
const pdfResult = await pdfRenderer.render(template, form, data);
const textResult = textRenderer.render(template, form, data);
```

### Import specific renderers (recommended for smaller bundles)

Use subpath exports to import only what you need:

```typescript
// Only PDF
import { pdfRenderer } from "@open-form/renderers/pdf";

// Only DOCX
import { docxRenderer } from "@open-form/renderers/docx";

// Only Text
import { textRenderer } from "@open-form/renderers/text";
```

This helps bundlers tree-shake unused renderers from your final build.

## Included Renderers

This package re-exports the following renderers:

### DOCX Renderer
- Template-based DOCX generation
- Dynamic data injection
- From [`@open-form/renderer-docx`](../renderer-docx)

### PDF Renderer
- PDF form field filling
- Field inspection utilities
- From [`@open-form/renderer-pdf`](../renderer-pdf)

### Text Renderer
- Handlebars template rendering
- Plain text output
- From [`@open-form/renderer-text`](../renderer-text)

## Individual Packages

If you only need specific renderers, you can install them individually:

```bash
# Install only what you need
npm install @open-form/renderer-docx
npm install @open-form/renderer-pdf
npm install @open-form/renderer-text
```

## Related Packages

- [`@open-form/sdk`](../sdk) - Complete framework bundle

## License

MIT © [OpenForm](https://github.com/open-form)
