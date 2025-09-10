// Core types generated from Zod schemas
export type {
  Address,
  Phone,
  Job,
  I18n,
  Person,
  YCard
} from './types';

// Parsing & Serialization
export { parseYCard, stringifyYCard } from './parsers/ycard';
export { parseVCard, stringifyVCard } from './parsers/vcard';

// Conversions
export {
  yCardPersonToVCard,
  yCardToVCard,
  vCardToYCardPerson,
  vCardToYCard
} from './converters';

// Utilities
export {
  yCardToLDIF,
  yCardToCSV,
  normalizeYCard,
  validateYCard,
  getYCardSummary
} from './utils';

// Re-export the Zod schemas for advanced usage
export {
  PersonSchema,
  JobSchema,
  YCardSchema
} from './types';
