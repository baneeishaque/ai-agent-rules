<!--
title: TypeScript Rules
description: Industrial standards for TypeScript configuration, strictness, and strict dependency freezing.
category: Languages & Stacks
-->

# TypeScript Rules

This document defines the "Ultra-Lean Industrial" standards for TypeScript projects. These rules ensure type safety, build performance, and long-term maintainability.

***

## 1. Standard Configuration (`tsconfig.json`)

All projects MUST start with the **Industrial Standard** configuration.

- **Strictness**: `strict: true` is MANDATORY.
- **Module Resolution**: `Bundler` (for Vite/ESBuild) or `Node` (for Serverless/Backends).
- **No Emit**: TypeScript is for type-checking ONLY. Emission is handled by bundlers (Vite/SWC).

### 1.1 Mandatory Base Config

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true
  }
}
```

***

## 2. Hardening Levels

Projects are categorized by their strictness requirements.

### 2.1 Industrial Standard (Default)

The base config above. Required for all new prototypes and internal tools.

### 2.2 Mission-Critical (Hardened)

For verified architectures (like `sync`), libraries, or financial logic, the following MUST be enabled:

- `"useUnknownInCatchVariables": true`
- `"noImplicitOverride": true`
- `"noPropertyAccessFromIndexSignature": true`
- `"exactOptionalPropertyTypes": true`
- `"noUncheckedIndexedAccess": true` (The "Nuclear" Option)
- `"noImplicitReturns": true`
- `"allowUnreachableCode": false`
- `"checkJs": true`

**Note**: The core `sync` architecture uses this **Nuclear** hardening level.

***

## 3. Coding Standards

- **No Any**: The use of `any` is PROHIBITED. Use `unknown` with type guards or distinct types.
- **Type-Only Imports**: When `verbatimModuleSyntax` is on, YOU MUST use `import type { ... }` for interfaces/types.
- **Enums vs Unions**: Prefer **Enums** for named constants (e.g., Worker messages) to prevent strict string typos. Prefer **Union Types** for data shapes.

***

## 4. Documentation

Every `tsconfig.json` MUST have an adjacent `tsconfig.json.md` following the [Code Documentation Rules](./code-documentation-rules.md). This explainer must include:

1. Compliance Assessment table.
2. Line-by-line justification.
3. "Recommended Enhancements" section for future hardening.

***

## 5. Related Conversations

- [Standardizing TypeScript Configuration (Current Session)](./docs/conversations/2026-02-06-standardizing-typescript-config.md)
