/**
 * @open-form/resolvers
 *
 * Environment-specific resolvers for OpenForm.
 * Import from subpaths for tree-shaking:
 *
 * @example
 * ```typescript
 * // Direct subpath import (recommended for tree-shaking)
 * import { createFsResolver } from '@open-form/resolvers/fs'
 *
 * // Umbrella import (convenience)
 * import { createFsResolver } from '@open-form/resolvers'
 * ```
 */

// Re-export all resolvers for convenience
export * from './fs/index.js'
