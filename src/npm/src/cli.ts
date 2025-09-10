#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { parseYCard, stringifyYCard, yCardToVCard, stringifyVCard, vCardToYCard, parseVCard } from './index';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage:');
  console.error('  ycard export --input <file> --format <vcard|csv|ldif> [--output <file>]');
  console.error('  ycard import --input <file> --format <vcard> [--output <file>]');
  process.exit(1);
}

const command = args[0];
const inputIndex = args.indexOf('--input');
const formatIndex = args.indexOf('--format');
const outputIndex = args.indexOf('--output');

if (inputIndex === -1 || formatIndex === -1) {
  console.error('Missing required --input or --format arguments');
  process.exit(1);
}

const inputFile = args[inputIndex + 1];
const format = args[formatIndex + 1];
const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;

try {
  if (command === 'export') {
    // Read yCard file
    const yamlContent = readFileSync(inputFile, 'utf8');
    const org = parseYCard(yamlContent);

    let output: string;

    switch (format.toLowerCase()) {
      case 'vcard':
        const cards = yCardToVCard(org);
        output = stringifyVCard(cards);
        break;
      case 'csv':
        const { yCardToCSV } = require('./utils');
        output = yCardToCSV(org);
        break;
      case 'ldif':
        const { yCardToLDIF } = require('./utils');
        output = yCardToLDIF(org, 'dc=example,dc=com');
        break;
      default:
        console.error(`Unsupported export format: ${format}`);
        console.error('Supported formats: vcard, csv, ldif');
        process.exit(1);
    }

    if (outputFile) {
      writeFileSync(outputFile, output, 'utf8');
      console.log(`Exported to ${outputFile}`);
    } else {
      console.log(output);
    }

  } else if (command === 'import') {
    if (format.toLowerCase() !== 'vcard') {
      console.error('Import only supports vcard format');
      process.exit(1);
    }

    // Read vCard file
    const vcfContent = readFileSync(inputFile, 'utf8');
    const cards = parseVCard(vcfContent);
    const org = vCardToYCard(cards);
    const output = stringifyYCard(org);

    if (outputFile) {
      writeFileSync(outputFile, output, 'utf8');
      console.log(`Imported to ${outputFile}`);
    } else {
      console.log(output);
    }

  } else {
    console.error(`Unknown command: ${command}`);
    console.error('Supported commands: export, import');
    process.exit(1);
  }

} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
