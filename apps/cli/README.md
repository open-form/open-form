<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=cli" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/cli</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=cli)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=cli) is **documents as code**. The CLI provides a registry-first workflow for installing, managing, and creating OpenForm artifacts — forms, documents, checklists, and bundles.

## Package overview

- 📦 **Registry-first** — Install artifacts from public or private registries
- 🔍 **Search & discover** — Find artifacts by name, kind, or tags
- 🏗️ **Project management** — Initialize projects with proper configuration
- ✏️ **Authoring tools** — Create and validate your own artifacts
- 🔒 **Lock file support** — Reproducible installations across environments
- 🌐 **Private registries** — Authenticate with custom headers and tokens

## Installation

```bash
npm install -g @open-form/cli
```

Or use with npx:

```bash
npx @open-form/cli --help
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

# View artifact details
ofm view @acme/residential-lease
```

## Commands

### Registry commands

| Command | Description |
|---------|-------------|
| `ofm add <artifact>` | Install an artifact from a registry |
| `ofm list` | List installed artifacts |
| `ofm view <artifact>` | View details of an installed artifact |
| `ofm search [query]` | Search for artifacts in a registry |

### Registry management

| Command | Description |
|---------|-------------|
| `ofm registry add <namespace> <url>` | Add a registry |
| `ofm registry remove <namespace>` | Remove a registry |
| `ofm registry list` | List configured registries |
| `ofm registry info <namespace>` | Show registry details |

### Authoring commands

| Command | Description |
|---------|-------------|
| `ofm new form <name>` | Create a new form |
| `ofm new document <name>` | Create a new document |
| `ofm new checklist <name>` | Create a new checklist |
| `ofm new bundle <name>` | Create a new bundle |
| `ofm validate <artifact>` | Validate an artifact |
| `ofm fix <artifact>` | Fix artifact metadata |

### Project commands

| Command | Description |
|---------|-------------|
| `ofm init [directory]` | Initialize a new project |
| `ofm render <artifact>` | Render an artifact layer |
| `ofm show <artifact>` | Display artifact structure |
| `ofm diff <file1> <file2>` | Compare two artifacts |

## Installing artifacts

Install artifacts from any configured registry:

```bash
# Basic install
ofm add @acme/residential-lease

# Install with layers (templates, PDFs, etc.)
ofm add @acme/residential-lease --layers all

# Install specific layers
ofm add @acme/residential-lease --layers default,pdf-template

# Choose output format
ofm add @acme/residential-lease --format json

# Force reinstall
ofm add @acme/residential-lease --force
```

Artifacts are referenced using scoped names: `@namespace/artifact-name`

## Searching registries

```bash
# Search by keyword
ofm search "lease agreement"

# Search a specific registry
ofm search --registry @acme

# Filter by artifact kind
ofm search --kind form

# Filter by tags
ofm search --tags real-estate,california

# Output as JSON (for scripting)
ofm search --json
```

## Managing registries

Add registries to your global or project configuration:

```bash
# Add a public registry (prompts for location when in a project)
ofm registry add @acme https://registry.acme.com

# Add to global config explicitly
ofm registry add @acme https://registry.acme.com --global

# Add to project config explicitly
ofm registry add @acme https://registry.acme.com --project

# Add with authentication
ofm registry add @private https://registry.private.com \
  --header "Authorization: Bearer \${PRIVATE_TOKEN}"

# List all registries
ofm registry list

# Remove a registry
ofm registry remove @acme
```

## Configuration

### Project configuration

Created when you run `ofm init`. Located at `open-form.json` in your project root.

```json
{
  "$schema": "https://schema.open-form.dev/manifest.json",
  "name": "@myorg/my-project",
  "title": "My OpenForm Project",
  "visibility": "private",
  "registries": {
    "@acme": "https://registry.acme.com"
  },
  "artifacts": {
    "dir": "artifacts",
    "format": "yaml"
  }
}
```

### Global configuration

User-level settings at `~/.open-form/config.json`. Applies to all projects.

```json
{
  "$schema": "https://schema.open-form.dev/config.json",
  "registries": {
    "@acme": "https://registry.acme.com",
    "@private": {
      "url": "https://registry.private.com",
      "headers": {
        "Authorization": "Bearer ${PRIVATE_TOKEN}"
      }
    }
  },
  "defaults": {
    "format": "yaml",
    "artifactsDir": "artifacts"
  }
}
```

Environment variables in `${VAR_NAME}` format are automatically expanded.

### Configuration precedence

1. **Project config** — checked first
2. **Global config** — fallback
3. **Built-in defaults**

## Project structure

```
my-project/
├── open-form.json           # Project manifest
├── .open-form/
│   └── lock.json            # Lock file (commit this)
└── artifacts/
    └── @acme/
        ├── residential-lease.yaml
        └── commercial-lease.yaml
```

## Lock file

The `.open-form/lock.json` file tracks installed artifacts with their versions and integrity hashes. This ensures reproducible installations. Commit this file to version control.

## Related packages

- [`@open-form/sdk`](../../packages/sdk) — All-in-one SDK package
- [`@open-form/core`](../../packages/core) — Core artifacts and builders
- [`@open-form/schemas`](../../packages/schemas) — JSON Schema definitions
- [`@open-form/renderers`](../../packages/renderers) — PDF, DOCX, Text renderers

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
