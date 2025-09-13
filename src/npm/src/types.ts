// Re-export everything from the main project to avoid duplication
export * from '../../ycard-schema';

// Also export the utility functions explicitly for convenience
export { resolveAlias, stringOrArrayField } from '../../ycard-schema';
