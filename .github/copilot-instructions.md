# Copilot Instructions: yCard Development Guide

## Overview

This document provides development guidance for the yCard project, focusing on implementation details and workflow that complement the README.md.

## Project Structure

```
yCard/
├── .attic/               # Historical/dead code archive
├── .github/
│   ├── workflows/
│   │   └── ci.yml          # GitHub Actions CI/CD pipeline
│   └── copilot-instructions.md  # Development guide and implementation details
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

## Code Quality Principles

### 🎯 DRY (Don't Repeat Yourself)
- **Never duplicate code**: If you find yourself copying code, extract it into a reusable function
- **Single source of truth**: Each piece of knowledge should have one authoritative representation
- **Refactor mercilessly**: When you see duplication, eliminate it immediately
- **Shared utilities**: Common patterns should be abstracted into utility functions

### 💋 KISS (Keep It Simple, Stupid)
- **Simple solutions**: Prefer the simplest solution that works
- **Avoid over-engineering**: Don't add complexity for hypothetical future needs
- **Clear naming**: Functions and variables should be self-documenting
- **Small functions**: Break down complex functions into smaller, focused ones
- **Readable code**: Code should be obvious to understand at first glance

### 🔄 Refactoring Guidelines
- **Continuous improvement**: Refactor as you work, not as a separate task
- **Safe refactoring**: Always run tests before and after refactoring
- **Incremental changes**: Make small, safe changes rather than large rewrites
- **Preserve behavior**: Refactoring should not change external behavior
- **Code reviews**: All refactoring should be reviewed for correctness

### ⚰️ Dead Code Management
- **Immediate removal**: Delete unused code immediately when identified
- **Historical preservation**: Move significant dead code to `.attic/` directory with context
- **Documentation**: Include comments explaining why code was moved to attic
- **Regular cleanup**: Review and clean attic directory periodically
- **No accumulation**: Don't let dead code accumulate in active codebase

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

### 🗂️ ARCHIVAL (Historical code)
- `.attic/` - Dead code archive with historical context
  - Include comments explaining why code was moved
  - Preserve git history when possible
  - Regular cleanup of truly obsolete code

### Dead Code Workflow
1. **Identify**: Find unused functions, imports, or modules
2. **Evaluate**: Determine if code has historical significance
3. **Document**: Add comments explaining the removal context
4. **Archive**: Move to `.attic/` if historically significant
5. **Delete**: Remove immediately if truly obsolete
6. **Test**: Ensure removal doesn't break anything

### When to Archive vs Delete
- **🗂️ Archive to `.attic/`**:
  - Complex algorithms that might be reused
  - Alternative implementations of current features
  - Code with significant architectural decisions
  - Experimental features that were abandoned
  - Legacy compatibility code

- **🗑️ Delete immediately**:
  - Simple utility functions with no dependencies
  - Obsolete configuration or comments
  - Unused imports or variables
  - Dead code with no historical value
  - Code that violates current architectural decisions

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

## Quick Reference

### Code Quality Checklist
- [ ] **DRY**: No code duplication - extracted reusable functions?
- [ ] **KISS**: Simplest solution that works?
- [ ] **Naming**: Self-documenting function/variable names?
- [ ] **Size**: Functions small and focused?
- [ ] **Dead Code**: Removed or archived appropriately?

### Before Committing
1. Run tests: `npm test`
2. Check for unused code: Review imports and functions
3. Verify DRY: Look for duplicated logic
4. Simplify: Can any function be made simpler?
5. Archive/Delete: Handle any dead code appropriately

---

*Remember: Code is read far more than it's written. Prioritize clarity and maintainability over cleverness.*
