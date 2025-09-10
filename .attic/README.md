# .attic Directory

This directory contains historical/dead code that has been archived for reference purposes.

## Purpose

- **Historical Reference**: Preserve significant code that may be useful for future reference
- **Architectural Documentation**: Document past implementation decisions and why they changed
- **Learning Resource**: Serve as examples of what not to do or alternative approaches

## Guidelines

### When to Archive Here
- Complex algorithms that might be reused
- Alternative implementations of current features
- Experimental features that were abandoned
- Legacy compatibility code with significant architectural decisions

### When to Delete Immediately
- Simple utility functions with no dependencies
- Obsolete configuration or comments
- Unused imports or variables
- Code that violates current architectural decisions

### Archival Process
1. Move code to appropriate subdirectory
2. Add README.md explaining:
   - Why the code was moved
   - When it was moved
   - What replaced it (if applicable)
   - Any lessons learned
3. Update git history if significant

## Maintenance

- Review quarterly for truly obsolete code
- Consider moving to git tags for very old code
- Keep directory structure organized by feature/domain
