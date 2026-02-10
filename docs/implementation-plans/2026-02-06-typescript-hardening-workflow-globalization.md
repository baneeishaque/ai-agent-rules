# Implementation Plan - Globalizing Agent Rule Standards

This plan addresses the user's request to generalize the "Hardening & Troubleshooting" documentation pattern across the
agent rules ecosystem.

## User Review Required

> [!NOTE]
>
> This plan modifies core rule definitions (`typescript-rules.md` and `code-documentation-rules.md`). These changes
> will affect how future Agents structure documentation and code fixes.

## Proposed Changes

### 1. Generalize `typescript-rules.md`

Transform the "Migration" section into a "Hardening & Verification Workflow" to document the process:
"Apply Rules -> Verify Build -> Fix Regressions".

#### [MODIFY] [typescript-rules.md](../../typescript-rules.md)

- **Rename Section 4** to "Hardening & Verification Workflow".
- **Step 1**: Apply `tsconfig.json` standard.
- **Step 2**: Run Build Verification (`npm run build`).
- **Step 3**: Fix Regressions.
    - Provide **Generalized Examples** (e.g., `import type { MyInterface }` instead of `SyncData`) to serve as
      universal templates for any repository.
    - Document the pattern: "Error Message" -> "Generic Fix Code".

### 2. Standardize Documentation Rules

Formalize the requirement that any rule file prescribing strictness must document the verification loop.

#### [MODIFY] [code-documentation-rules.md](../../code-documentation-rules.md)

- **New Section 2.1 "The Hardening Protocol"**:
- Rule: If a ruleset prescribing strictness breaks existing code (Hardening), it MUST document the **Verification &
  Fix Loop**:
    1. Command to Verify (e.g., `npm run build`).
    2. Common Regression Patterns & Fix templates.

## Verification Plan

### Manual Verification

1. **Review `typescript-rules.md`**: Verify examples are generic and syntactically correct TypeScript.
2. **Review `code-documentation-rules.md`**: Verify the new standard is clear and follows the existing document style.
3. **Cross-Check**: Ensure the new section in `typescript-rules.md` complies with the new standard in `code-documentation-rules.md`.
