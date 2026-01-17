<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=renderers" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/renderers</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=renderers)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=renderers) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

Umbrella package that re-exports all OpenForm renderers for convenient installation and usage.

- **All-in-one** - Single package containing all renderers
- **Batteries included** - support for text, HTML, Markdown, DOCX, PDF
- **Type-safe** - Full TypeScript support

## Installation

```bash
npm install @open-form/renderers
```

## Usage

Import desired renderer and pass to the render method's `renderer` configuration. Included renderers are `textRenderer`, `docxRenderer`, and `pdfRenderer`.

```typescript
import { open } from "@open-form/sdk";
import { textRenderer } from "@open-form/renderers";

const textString = await open
  .form({
    name: "my-form",
    title: "My Form",
    // ...
    fields: {
      name: { type: "string", required: true },
    },
    layers: {
      markdown: {
        kind: "inline",
        mimeType: "text/markdown",
        text: "Hello {{fields.name}}",
      },
    },
  })
  .fill({
    fields: { name: "Alice" },
  })
  .render({
    renderer: textRenderer, // Plug in renderer
    layer: "markdown", // Specify target layer
  });

console.log(textString); // => "Hello Alice"
```

## Changelog

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/renderers/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/sdk`](../sdk) - OpenForm framework SDK
- [`@open-form/renderer-text`](../renderer-text) - Text Renderer
- [`@open-form/renderer-docx`](../renderer-docx) - DOCX Renderer
- [`@open-form/renderer-pdf`](../renderer-pdf) - PDF Renderer

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
