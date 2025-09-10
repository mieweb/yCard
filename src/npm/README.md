# ycard

Convert between yCard (YAML) and vCard formats with clean APIs for one-shot and stream/batch use cases.

## Installation

```bash
npm install ycard
```

## Quick Start

```typescript
import { parseYCard, yCardToVCard, stringifyVCard } from 'ycard';
import fs from 'node:fs';

const yaml = fs.readFileSync('org.yaml', 'utf8');
const org = parseYCard(yaml);

const cards = yCardToVCard(org);
fs.writeFileSync('org.vcf', stringifyVCard(cards), 'utf8');
```

## API Reference

### Parsing & Serialization

```typescript
// Parse YAML string → YCard
function parseYCard(yaml: string): YCard;

// Serialize YCard → YAML string
function stringifyYCard(org: YCard): string;

// Parse vCard 4.0 string → VCard[]
function parseVCard(vcf: string): VCard[];

// Serialize VCard[] → vCard 4.0 string
function stringifyVCard(cards: VCard[]): string;
```

### Conversions

```typescript
// Convert Person → VCard (expands jobs as multiple TITLEs)
function yCardPersonToVCard(person: Person, orgName?: string): VCard;

// Convert YCard → VCard[]
function yCardToVCard(org: YCard): VCard[];

// Convert VCard → Person
function vCardToYCardPerson(card: VCard): Person;

// Convert VCard[] → YCard
function vCardToYCard(cards: VCard[]): YCard;
```

### Utilities

```typescript
// Convert YCard → LDIF format
function yCardToLDIF(org: YCard, baseDn: string): string;

// Convert YCard → CSV format
function yCardToCSV(org: YCard): string;

// Normalize yCard (resolve aliases)
function normalizeYCard(input: unknown): YCard;

// Validate yCard data
function validateYCard(org: unknown): { valid: boolean; errors?: string[] };

// Get organization summary
function getYCardSummary(org: YCard): {
  totalPeople: number;
  organizations: string[];
  titles: string[];
  hasMultiHat: boolean;
};
```

## CLI Usage

```bash
# Convert yCard → vCard
npx ycard export --input org.yaml --format vcard > org.vcf

# Convert yCard → CSV
npx ycard export --input org.yaml --format csv > org.csv

# Convert yCard → LDIF
npx ycard export --input org.yaml --format ldif > org.ldif

# Convert vCard → yCard
npx ycard import --input contacts.vcf --format vcard > org.yaml
```

## Features

- **Schema-driven**: Full Zod validation with alias resolution
- **Multi-hat support**: Jobs expand to multiple vCard TITLE entries
- **Internationalization**: Support for multiple languages
- **Clean APIs**: Composable functions for different use cases
- **CLI support**: Command-line conversion tools
- **Type-safe**: Full TypeScript support with generated types

## Example yCard

```yaml
people:
  - uid: john-doe
    name: John
    surname: Doe
    title: Software Engineer
    email: john.doe@example.com
    org: Example Corp
    phone:
      - type: work
        number: "+1-555-0123"
    jobs:
      - role: Senior Engineer
        org: Tech Division
      - role: Team Lead
        org: Product Team
```

## License

MIT
