#!/usr/bin/env node

// Simple test of the ycard package
const { parseYCard, yCardToVCard, stringifyVCard } = require('./dist/index');

const sampleYaml = `
people:
  - uid: john-doe
    name: John
    surname: Doe
    title: Software Engineer
    email: john.doe@example.com
    org: Example Corp
`;

console.log('=== yCard Package Test ===\n');

// Parse the YAML
console.log('1. Parsing yCard YAML...');
const org = parseYCard(sampleYaml);
console.log(`✓ Parsed ${org.people.length} people\n`);

// Convert to vCard
console.log('2. Converting to vCard...');
const cards = yCardToVCard(org);
console.log(`✓ Generated ${cards.length} vCard(s)\n`);

// Serialize to vCard format
console.log('3. Serializing to vCard format...');
const vcf = stringifyVCard(cards);
console.log('✓ Generated vCard content:\n');
console.log(vcf);
