<p align="center">
  <a href="https://ofm.dev?utm_source=github&utm_medium=npm" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">ofm</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=npm)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=npm) is **documents as code**. This is the convenience package for the OpenForm CLI — install it to get the `ofm` and `open-form` commands.

> This package is a wrapper around [`@open-form/cli`](https://www.npmjs.com/package/@open-form/cli). All functionality lives there.

## Installation

```bash
npm install -g ofm
```

Or use with npx:

```bash
npx ofm --help
```

## Quick start

```bash
# Initialize a new project
ofm init my-project
cd my-project

# Search for artifacts
ofm search "lease agreement"

# Install an artifact
ofm add @acme/residential-lease

# List installed artifacts
ofm list
```

## Commands

| Command | Description |
|---------|-------------|
| `ofm add <artifact>` | Install an artifact from a registry |
| `ofm list` | List installed artifacts |
| `ofm view <artifact>` | View artifact details |
| `ofm search [query]` | Search for artifacts |
| `ofm init [directory]` | Initialize a new project |
| `ofm new <kind> <name>` | Create a new artifact |
| `ofm validate <artifact>` | Validate an artifact |
| `ofm render <artifact>` | Render an artifact layer |
| `ofm registry add` | Add a registry |
| `ofm registry list` | List configured registries |

For the full command reference, see the [`@open-form/cli` README](https://www.npmjs.com/package/@open-form/cli).

## Related packages

- [`@open-form/cli`](https://www.npmjs.com/package/@open-form/cli) — Full CLI package (this wrapper depends on it)
- [`@open-form/sdk`](https://www.npmjs.com/package/@open-form/sdk) — All-in-one SDK package
- [`@open-form/core`](https://www.npmjs.com/package/@open-form/core) — Core artifacts and builders
- [`@open-form/schemas`](https://www.npmjs.com/package/@open-form/schemas) — JSON Schema definitions

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
