// Re-export everything from the main project to avoid duplication
export * from '../../zod-spec';

// Also export the utility functions explicitly for convenience
export { resolveAlias, stringOrArrayField } from '../../zod-spec';
