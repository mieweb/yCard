const { parse, VCARD } = require('vcard4');

console.log('Testing vcard4...');

// Test parsing
const testVCard = 'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nEMAIL:jane@example.com\r\nUID:jane-doe\r\nEND:VCARD';

try {
  const parsed = parse(testVCard);
  console.log('Parse result type:', typeof parsed);
  console.log('Parse result constructor:', parsed.constructor.name);
  
  // Check if it has a getProperty method
  if (parsed.getProperty) {
    console.log('\nUsing getProperty:');
    console.log('FN:', parsed.getProperty('fn') ? parsed.getProperty('fn').getValue() : 'not found');
    console.log('EMAIL:', parsed.getProperty('email') ? parsed.getProperty('email').getValue() : 'not found');
    console.log('UID:', parsed.getProperty('uid') ? parsed.getProperty('uid').getValue() : 'not found');
  }
  
  // Check properties object
  if (parsed.properties) {
    console.log('\nProperties object keys:', Object.keys(parsed.properties));
    
    // Try accessing properties directly
    Object.keys(parsed.properties).forEach(key => {
      const prop = parsed.properties[key];
      console.log(`${key}:`, prop ? (prop.getValue ? prop.getValue() : prop) : 'undefined');
    });
  }
  
  console.log('\nFull object structure:');
  console.log(JSON.stringify(parsed, null, 2));
  
} catch (e) {
  console.error('Error:', e.message);
}

// Test creation
console.log('\n--- Testing vCard creation ---');
try {
  const newCard = new VCARD();
  console.log('Created new VCARD:', typeof newCard);
  console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(newCard)));
} catch (e) {
  console.error('Creation error:', e.message);
}