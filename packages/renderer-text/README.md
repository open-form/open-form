# @open-form/renderer-text

> Text renderer for OpenForm framework

[![npm version](https://img.shields.io/npm/v/@open-form/renderer-text.svg)](https://www.npmjs.com/package/@open-form/renderer-text)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Renders OpenForm documents to plain text format using template-based rendering with Handlebars.

## Features

- **Template-based rendering** - Use Handlebars templates for dynamic text generation
- **Variable substitution** - Inject form data into text templates
- **Plain text output** - Returns string for easy file writing or display
- **Type-safe** - Full TypeScript support with OpenForm core types

## Installation

```bash
npm install @open-form/renderer-text
# or
pnpm add @open-form/renderer-text
# or
yarn add @open-form/renderer-text
```

## Usage

```typescript
import { textRenderer } from "@open-form/renderer-text";

// Use the renderer with OpenForm
const result = textRenderer.render(template, form, data);

// Write to file
await fs.writeFile("output.txt", result);
```

### Using Templates

```typescript
import { renderText } from "@open-form/renderer-text";

const template = "Hello {{name}}, your order #{{orderId}} is ready!";
const data = { name: "Alice", orderId: "12345" };

const result = renderText(template, data);
// Output: "Hello Alice, your order #12345 is ready!"
```

## API Reference

### `textRenderer`

OpenForm renderer implementation for plain text format.

**Properties:**
- `id: "text"` - Renderer identifier
- `supports: ["text"]` - Supported template types
- `outputExtension: "txt"` - Output file extension
- `outputMime: "text/plain"` - MIME type

**Methods:**
- `render(template, form, data): string` - Renders template with data

### `renderText(template, data)`

Low-level rendering function using Handlebars.

**Parameters:**
- `template: string` - Text template with Handlebars placeholders
- `data: Record<string, unknown>` - Data to inject into template

**Returns:** `string` - Rendered text

## Error Handling

```typescript
import { textRenderer } from "@open-form/renderer-text";

try {
  const result = textRenderer.render(template, form, data);

  // result is a string
  console.log(`Text generated: ${result.length} characters`);

  // Write to file
  await fs.writeFile("output.txt", result);
} catch (error) {
  if (error instanceof Error) {
    console.error('Text rendering failed:', error.message);
  } else {
    console.error('Text rendering failed:', error);
  }
}

// Direct template rendering
try {
  const result = renderText("Hello {{name}}", { name: "World" });
  console.log(result); // "Hello World"
} catch (error) {
  console.error('Template rendering failed:', error);
}
```

## Related Packages

- [`@open-form/sdk`](../sdk) - Complete framework bundle

## License

MIT © [OpenForm](https://github.com/open-form)

## Acknowledgments

Built with these excellent libraries:

- [Handlebars](https://handlebarsjs.com/) - Minimal templating on steroids
