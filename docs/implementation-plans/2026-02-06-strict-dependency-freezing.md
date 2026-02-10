# Strict Dependency Freezing: Implementation Record (2026-02-06)

This document serves as the permanent record of the shift to strict dependency freezing across the Sync Architectural
Template.

***

## 1. Original Implementation Plan

### Goal

Replace all loose dependency version ranges (using `^`, `~`, or `*`) with the exact versions currently resolved and
stored in `package-lock.json`. This ensures reproducibility and compatibility with strict dependency management tools.

### Proposed Changes

#### Root Workspace

- **assemblyscript**: `^0.27.0` -> `0.27.37`
- **typescript**: `^5.0.0` -> `5.9.3`

#### Core Package

- **rxdb**: `^15.0.0` -> `15.39.0`
- **nostr-tools**: `^2.1.0` -> `2.23.0`
- **rxjs**: `^7.8.0` -> `7.8.2`

#### Samples (Shared, CRA, Vite)

- **react**: Pinned to `18.3.1`
- **react-dom**: Pinned to `18.3.1`
- **Build Tools**: `@craco/craco` (7.1.0), `vite` (4.5.14)
- **Vite Plugins**: `plugin-react` (4.7.0), `vite-plugin-wasm` (3.5.0), `vite-plugin-top-level-await` (1.6.0)

***

## 2. Execution Walkthrough

### Codebase Updates

All external dependency versions across the monorepo were pinned to their exact resolved versions from `package-lock.json`.

### Rule-Level Formalization

The requirement was formalized into the global architectural rules:

1. **[NEW] [strict-dependency-freezing-rules.md](../../strict-dependency-freezing-rules.md)**: Established a new global
   rule.
2. **[MODIFY] [zero-backend-sync-rules.md](../../zero-backend-sync-rules.md)**: Updated architecture-specific rules to
   mandate the freezing standard.

### Industrial Standard for Workspace Packages
>
> [!IMPORTANT]
> Internal workspace dependencies (`@sync/core`, `@sync/shared`) remain using `*`. This is the **industrial standard**
> for monorepos as it ensures that local samples always point to the local source code without requiring manual version
> bumps across all packages during development.

***

## 3. Verification Results

### Reproducibility Check

- Ran `npm install` and verified that the lockfile is fully consistent with the new pinned versions.
- Audited all `package.json` files to ensure no remaining `^`, `~`, or `*` for external dependencies.

```bash
# Verification command used to find loose versions (returned no matches)
grep -rE '"[^"]+":\s*"[\^~\*]' . --include="package.json" --exclude-dir=node_modules | grep -v "@sync/"

```
