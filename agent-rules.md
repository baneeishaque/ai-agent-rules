# Warp AI Agent Rules

This file documents all personal rules configured in Warp AI Agent for backup and version control purposes.

## Current Rules (in precedence order)

### 1. Flutter Build: Maximum Logging
**Rule ID:** `SAMPLE_RULE_ID_1`
**Description:** When running Flutter build commands (flutter build), always use maximum logging by adding --verbose flag to see detailed build process information.

**Usage Examples:**
- `flutter build apk` → `flutter build apk --verbose`
- `flutter build ios` → `flutter build ios --verbose`
- `flutter build web` → `flutter build web --verbose`

### 2. Git Repository: Auto-index Codebases
**Rule ID:** `SAMPLE_RULE_ID_2`
**Description:** When the user's current working directory (pwd) is within a git repository, automatically treat it as an indexed codebase for search_codebase tool usage, even if not explicitly listed in the codebases configuration.

**Benefits:**
- Automatic codebase search capability when navigating to any git repo
- No need to manually configure codebase indexing for each project

### 3. Brew: Prefer Head/Source Builds Over Binaries
**Rule ID:** `SAMPLE_RULE_ID_3`
**Description:** User prefers to install the latest head version/source version (if head not found) of formula/cask using brew, ensuring it is not the binary version. Use https://formulae.brew.sh/formula/X, https://github.com/Homebrew/homebrew-core/blob/*/Formula/*/X.rb (will get actual url from first URL) & https://formulae.brew.sh/api/formula/X.json URLs for more details. Similarly https://formulae.brew.sh/cask/X, https://github.com/Homebrew/homebrew-cask/blob/*/Casks/*/X.rb & https://formulae.brew.sh/api/cask/X.json in the case of Casks. Since the build from source is multi step process, ensure maximum logging from brew.

**Reference URLs for Research:**
- Formulas: `https://formulae.brew.sh/formula/{package-name}`
- Formula Source: `https://github.com/Homebrew/homebrew-core/blob/*/Formula/*/{package-name}.rb`
- Formula API: `https://formulae.brew.sh/api/formula/{package-name}.json`
- Casks: `https://formulae.brew.sh/cask/{package-name}`
- Cask Source: `https://github.com/Homebrew/homebrew-cask/blob/*/Casks/*/{package-name}.rb`
- Cask API: `https://formulae.brew.sh/api/cask/{package-name}.json`

**Installation Priority:**
1. Head version (if available): `brew install --HEAD {package-name}`
2. Source build (if head not available): `brew install --build-from-source {package-name}`
3. Always use verbose logging: `--verbose` flag

## Configured Codebases

### sample-app
**Path:** `/path/to/sample-app`
**Status:** Indexed and searchable

## Rule Management

- **Location:** Rules are stored in Warp's SQLite database
- **Sync:** Automatically synced with Warp account
- **Backup:** This markdown file serves as version-controlled backup
- **Updates:** Remember to update this file when rules are modified

## Last Updated
**Date:** 2025-08-15
**By:** sample-user
**Total Rules:** 3
