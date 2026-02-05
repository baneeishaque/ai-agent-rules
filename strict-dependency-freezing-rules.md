<!--
title: Strict Dependency Freezing Rules
description: Industrial protocol for ensuring reproducible builds by pinning exact versions of all external dependencies in package-level configuration.
category: Architecture & Dependency Management
-->

# Strict Dependency Freezing Rules

This rule defines the mandatory protocol for managing external dependencies to ensure 100% reproducible builds and compatibility with strict dependency update tools. It mandates the use of fixed versions rather than ranges for all non-workspace packages.

***

## 1. Core Principles

- **Total Reproducibility**: Build artifacts and local environments MUST be identical regardless of when they are initialized. Loose version ranges (`^`, `~`) are prohibited for external dependencies.
- **Explicit Resolved Versions**: The `package.json` MUST reflect the exact version that is currently resolved and stored in the project's lockfile (`package-lock.json`, `yarn.lock`, etc.).
- **Deterministic Updates**: Dependency updates MUST be deliberate and explicit. Using frozen versions prevents "accidental" updates during a fresh installation.

***

## 2. Implementation Protocol

### 2.1 External Dependencies

- **Mandatory Pinning**: Always use an exact version string (e.g., `"react": "18.3.1"`).
- **Prohibited Prefixes**: Do not use `^` (caret), `~` (tilde), or `>` / `<` operators.
- **Lockfile Alignment**: Before pinning, the agent MUST consult the project's lockfile to identify the *currently resolved* version to ensure no unintended upgrades occur during the pinning process.

### 2.2 Internal Workspace Packages (Exception)

- **Monorepo Scaling**: In a monorepo (npm workspaces, pnpm, yarn), internal packages managed within the same repository SHOULD use `*` or the `workspace:*` prefix.
- **Rationale**: Internal links are defined by the Git commit/checkout. Pinning internal versions creates unnecessary maintenance overhead and breaks "symlink-first" local development workflows.

### 2.3 Peer Dependencies

- **Range Support**: Peer dependencies MAY use ranges if the package is intended for public consumption and requires compatibility with multiple host versions. However, for internal apps, pinning peer dependencies is still preferred.

***

## 3. Prohibited Behaviors

- **DO NOT** use `*` for external packages (unless in temporary local experimentation).
- **DO NOT** use "latest" as a version string.
- **DO NOT** run `npm install --save <package>` without immediately pinning the resulting version if the CLI defaults to `^`.
- **DO NOT** update a project's `package.json` versions without verifying they exist in the `package-lock.json`.

***

## 4. Related Conversations & Traceability

- **Architectural Shift**: [Strict Dependency Freezing Implementation](./docs/implementation-plans/2026-02-06-strict-dependency-freezing.md)
- **Session Record**: [Dependency Freezing & Standardization](./docs/conversations/2026-02-06-dependency-freezing-and-rule-standardization.md)
- **Reference Implementation**: [Sync Architecture Template (Frozen)](./architectures/sync/package.json)
