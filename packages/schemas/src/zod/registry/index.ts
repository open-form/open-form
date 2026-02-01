/**
 * Registry-related schemas for OpenForm CLI
 *
 * These schemas define the structure for:
 * - Global user config (~/.open-form/config.json)
 * - Lock files (.open-form/lock.json)
 * - Registry index (registry.json)
 * - Registry items (r/{name}.json)
 */

export * from './global-config';
export * from './lock';
export * from './registry-index';
export * from './registry-item';
