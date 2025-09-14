# Fuzzy Date Support in yCard

The yCard project now supports fuzzy dates through the integrated `vcard4` library, which provides full RFC 6350 compliance for vCard 4.0 date formats.

## Supported Fuzzy Date Formats

The following date formats are supported for properties like `BDAY` and `ANNIVERSARY`:

| Format | Example | Description |
|--------|---------|-------------|
| `YYYY-MM-DD` | `1985-05-15` | Complete date |
| `YYYY-MM` | `1985-05` | Year and month only |
| `YYYY` | `1985` | Year only |
| `--MM-DD` | `--05-15` | Month and day only (recurring) |
| `--MM` | `--05` | Month only (recurring) |
| `---DD` | `---15` | Day only (recurring) |

## Examples

### Basic Usage

```javascript
const { parseVCard } = require('./dist/npm/parsers/vcard');

// Parse a vCard with fuzzy birthday
const vcardString = `BEGIN:VCARD
VERSION:4.0
FN:John Doe
BDAY:--05-15
END:VCARD`.replace(/\n/g, '\r\n');

const parsed = parseVCard(vcardString);
console.log(parsed[0].fn); // "John Doe"
// The BDAY property is preserved with fuzzy format: "--05-15"
```

### yCard Integration

When converting yCard YAML to vCard format, fuzzy dates can be included:

```yaml
people:
  - uid: john-doe
    name: John
    surname: Doe
    # Fuzzy dates will be properly handled when exporting to vCard
    birthday: "--12-25"  # Christmas birthday, year unknown
    anniversary: "1995"   # Anniversary year only
```

## Technical Details

The fuzzy date support is provided by the `vcard4` library, which:

- Fully implements RFC 6350 date-time formats
- Validates date formats according to the vCard 4.0 specification
- Preserves fuzzy date information during parse/stringify round-trips
- Handles edge cases and malformed dates gracefully

## Use Cases

Fuzzy dates are particularly useful for:

- **Recurring events** where the year is not relevant (birthdays, anniversaries)
- **Incomplete information** where only partial date information is available
- **Historical records** where exact dates may be unknown
- **Privacy concerns** where full dates should not be disclosed

## Compatibility

This fuzzy date support is fully compatible with:

- vCard 4.0 specification (RFC 6350)
- Standard vCard readers and applications
- The existing yCard schema validation
- Round-trip conversion (yCard ↔ vCard)