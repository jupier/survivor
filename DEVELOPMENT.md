# Development Tools

This project uses several development tools to maintain code quality and consistency.

## Tools Installed

### Prettier
Code formatter for consistent styling across the codebase.

**Configuration:** `.prettierrc`
**Ignore file:** `.prettierignore`

**Commands:**
- `npm run format` - Format all code
- `npm run format:check` - Check if code is formatted (CI-friendly)

### ESLint
Linter for catching bugs and enforcing code quality.

**Configuration:** `eslint.config.js` (ESLint v9 flat config format)
**Rules:**
- TypeScript-aware linting
- Prettier integration
- Warns on `any` types
- Allows unused variables starting with `_`

**Commands:**
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Auto-fix linting issues

### Husky
Git hooks for running checks before commits.

**Configuration:** `.husky/pre-commit`
**Setup:** Automatically runs `lint-staged` on pre-commit

### lint-staged
Runs linters/formatters only on staged files.

**Configuration:** `.lintstagedrc.json`
**Actions:**
- Formats staged `.ts` and `.json` files with Prettier
- Runs ESLint with auto-fix on staged `.ts` files

### EditorConfig
Ensures consistent editor settings across different IDEs.

**Configuration:** `.editorconfig`

## Usage

### Before Committing
The pre-commit hook will automatically:
1. Format staged files with Prettier
2. Run ESLint with auto-fix on staged files

If there are unfixable issues, the commit will be blocked.

### Manual Formatting
```bash
npm run format        # Format all code
npm run format:check  # Check formatting without changing files
```

### Manual Linting
```bash
npm run lint      # Check for issues
npm run lint:fix  # Auto-fix issues
```

## Configuration Files

- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to ignore when formatting
- `eslint.config.js` - ESLint rules and configuration
- `.editorconfig` - Editor settings
- `.lintstagedrc.json` - lint-staged configuration
- `.husky/pre-commit` - Pre-commit git hook

## Notes

- ESLint warnings (not errors) won't block commits
- Unused variables starting with `_` are ignored
- `any` types will show warnings but won't block commits
- The build process is independent of linting (TypeScript compiler handles type checking)
