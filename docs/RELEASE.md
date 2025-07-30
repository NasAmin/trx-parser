# Release Process

This repository uses automated releases powered by [release-please](https://github.com/googleapis/release-please) action.

## How It Works

1. **Conventional Commits**: Use conventional commit messages in your commits:
   - `feat:` for new features (minor version bump)
   - `fix:` for bug fixes (patch version bump)
   - `feat!:` or `fix!:` for breaking changes (major version bump)
   - `chore:`, `docs:`, `style:`, `refactor:`, `test:` for other changes

2. **Automatic Release PRs**: When commits are pushed to `main`, release-please will:
   - Analyze commit messages since the last release
   - Determine the next version number based on conventional commits
   - Create or update a "Release PR" with changelog and version bumps

3. **Automatic Releases**: When the Release PR is merged:
   - A new GitHub release is created with generated release notes
   - A git tag is created with the new version
   - Release assets (like `dist/index.js`) are automatically uploaded

## Manual Releases

You can still create manual releases if needed. The system will detect if a release was created by release-please or manually and handle them appropriately.

## Example Commit Messages

```bash
feat: add support for custom report prefixes
fix: resolve issue with trx file parsing
docs: update README with new usage examples
chore: update dependencies
feat!: change action input parameter names (breaking change)
```

## Release Notes

Release notes are automatically generated from conventional commits and organized by type (Features, Bug Fixes, etc.). The format can be customized in `.release-please-config.json`.