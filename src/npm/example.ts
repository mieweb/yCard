// Example usage of the ycard package
// Run this after building: npm run build && node dist/example.js

import { parseYCard, yCardToVCard, stringifyVCard, validateYCard } from './index';

const sampleYaml = `
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
  - uid: jane-smith
    name: Jane
    surname: Smith
    title: Product Manager
    email: jane.smith@example.com
    org: Example Corp
    manager: john-doe
`;

console.log('=== yCard Package Example ===\n');

// Parse the YAML
console.log('1. Parsing yCard YAML...');
const org = parseYCard(sampleYaml);
console.log(`✓ Parsed ${org.people.length} people\n`);

// Validate the data
console.log('2. Validating yCard data...');
const validation = validateYCard(org);
console.log(`✓ Validation: ${validation.valid ? 'PASSED' : 'FAILED'}\n`);

// Convert to vCard
console.log('3. Converting to vCard...');
const cards = yCardToVCard(org);
console.log(`✓ Generated ${cards.length} vCard(s)\n`);

// Serialize to vCard format
console.log('4. Serializing to vCard format...');
const vcf = stringifyVCard(cards);
console.log('✓ Generated vCard content:\n');
console.log(vcf);
