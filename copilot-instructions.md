# Copilot Instructions: yCard Development Guide

## Overview

This document provides development guidance for the yCard project, focusing on implementation details and workflow that complement the README.md.

## Project Structure

```
yCard/
├── src/
│   ├── zod-spec.ts      # Zod schema definitions with aliases & i18n
│   ├── parser.ts        # Reference parser using Zod validation
│   └── lsp.ts           # Language Server Protocol implementation
├── scripts/
│   └── generate-openapi.js  # Auto-generates openapi.yaml
├── openapi.yaml         # Auto-generated OpenAPI spec (DO NOT EDIT)
├── package.json         # Dependencies and build scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation
```

## Implementation Status

### ✅ Completed Features
- **Zod Schema**: Comprehensive schema with full alias support (Spanish, Japanese, LDAP)
- **OpenAPI Generation**: Automatic generation from Zod schema with preservation of comments
- **Reference Parser**: Zod-based validation with detailed error messages
- **LSP Server**: Full implementation with auto-completion, diagnostics, and hover
- **Alias Resolution**: Transform functions that normalize aliases to canonical fields
- **Internationalization**: Multi-language support with ISO 639-1 validation

### 🔄 Current Architecture
- **Schema-driven**: All validation, parsing, and LSP features derive from the Zod schema
- **Auto-generation**: OpenAPI spec is automatically generated and kept in sync
- **Type-safe**: Full TypeScript integration with generated types
- **Extensible**: Easy to add new aliases, fields, or languages

## Development Workflow

### Adding New Fields or Aliases
1. **Update Schema** (`src/zod-spec.ts`):
   ```typescript
   // Add new field to PersonSchema
   newField: z.string().optional(),
   newAlias: z.string().optional(), // Add alias
   ```

2. **Update Transform** (if needed):
   ```typescript
   newField: person.newField || person.newAlias,
   ```

3. **Regenerate OpenAPI**:
   ```bash
   npm run generate-openapi
   ```

4. **Update LSP Completion** (`src/lsp.ts`):
   ```typescript
   { label: 'newField', kind: CompletionItemKind.Field, data: XX },
   ```

### Testing Changes
1. Build: `npm run build`
2. Test LSP: `npm run start`
3. Validate parsing with example files
4. Check auto-completion and diagnostics

## Key Implementation Details

### Alias Resolution Strategy
- **Input Flexibility**: Accept multiple aliases for the same field
- **Canonical Output**: Transform to standard field names
- **Validation**: Ensure at least one form is provided for required fields
- **Documentation**: LSP provides hover info for all aliases

### Internationalization Architecture
- **Language Codes**: ISO 639-1 validation for consistency
- **Field-level**: Per-field translations (not document-level)
- **Fallback**: Use base language if translation missing
- **Extensible**: Easy to add new languages without schema changes

### LSP Integration
- **Schema-driven**: All completions and validations derive from Zod
- **Context-aware**: Different completions for different contexts
- **Error Recovery**: Helpful suggestions for fixing validation errors
- **Performance**: Efficient parsing and validation for real-time feedback

## File Management Guidelines

### 🔴 DO NOT EDIT (Auto-generated)
- `openapi.yaml` - Regenerated via `npm run generate-openapi`
- `dist/` - Compiled TypeScript output

### 🟢 SAFE TO EDIT (Source files)
- `src/zod-spec.ts` - Schema definitions and transforms
- `src/parser.ts` - Parsing logic and validation
- `src/lsp.ts` - LSP features and completions
- `scripts/generate-openapi.js` - Generation script
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Quality Assurance

### Schema Validation
- All aliases properly resolve to canonical fields
- Internationalization fields follow ISO standards
- Required fields are properly validated
- Transform functions handle edge cases

### LSP Features
- Auto-completion covers all fields and aliases
- Error messages are clear and actionable
- Hover documentation is accurate
- Performance is suitable for real-time editing

### Build Process
- TypeScript compilation succeeds without errors
- OpenAPI generation produces valid YAML
- All npm scripts execute successfully
- Dependencies are properly managed

## Troubleshooting

### Common Issues
- **OpenAPI generation fails**: Check TypeScript compilation first
- **LSP not starting**: Ensure all dependencies are installed
- **Schema validation errors**: Check transform functions for undefined values
- **Missing completions**: Verify LSP completion list includes new fields

### Debug Steps
1. Clean build: `rm -rf dist && npm run build`
2. Check dependencies: `npm ls`
3. Test individual components: `node dist/parser.js`
4. Validate schema: `node -e "require('./dist/zod-spec').PersonSchema.parse({uid: 'test'})"`

## Future Enhancements

### Potential Improvements
- Tree-Sitter grammar integration for syntax highlighting
- VS Code extension packaging
- Additional language support for aliases
- Performance optimizations for large files
- Integration with other editors (not just VS Code)

### Architecture Considerations
- Consider separating schema from transforms for better testability
- Evaluate caching strategies for LSP performance
- Consider plugin architecture for custom validations
- Explore WebAssembly for cross-platform Tree-Sitter integration

---

*This document focuses on implementation details. For project overview, examples, and general usage, see README.md.*
