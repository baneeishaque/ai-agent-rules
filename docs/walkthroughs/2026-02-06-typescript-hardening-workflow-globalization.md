# Globalizing Agent Rule Standards - Walkthrough

## Objective

Transform the "Hardening -> Verification -> Fix" workflow from a specific `sync` architecture pattern into a universal
standard applicable to all 100+ projects using the agent rule system.

## Changes Made

### 1. [typescript-rules.md](../../typescript-rules.md)

#### Section 4: "Hardening & Verification Workflow"

- Renamed from "Migration & Troubleshooting" to emphasize the **process** over isolated fixes
- Structured as a 3-step protocol:
    1. **Apply Configuration**: Apply Industrial Standard `tsconfig.json`
    2. **Verification Loop**: Run `npm run build` to identify regressions
    3. **Fix Regressions**: Use generalized templates to resolve errors

**Generalized Examples:**

- Replaced `SyncData` → `MyInterface`
- Replaced `state.theme` → `data.dynamicKey`
- Templates now apply universally to any TypeScript project

render_diffs(file://../../typescript-rules.md)

---

### 2. [code-documentation-rules.md](../../code-documentation-rules.md)

#### Section 2.1: "The Hardening Protocol"

- New mandatory section for any rule file prescribing strictness
- Requires:
    1. **Verification Command**: Exact command to verify compliance
    2. **Regression Templates**: Error/Fix pairs using generalized examples (not repo-specific)

render_diffs(file://../../code-documentation-rules.md)

---

## Verification Results

**Cross-Check:** `typescript-rules.md` Section 4 now complies with the newly mandated "Hardening Protocol" in `code-documentation-rules.md`:

- ✅ Includes verification command (`npm run build`)
- ✅ Provides generalized regression templates
- ✅ Examples are syntactically correct TypeScript

## Impact

This change ensures that **any future strictness rule** (TypeScript, ESLint, etc.) will:

1. Document the verification process
2. Provide actionable fix templates
3. Work universally across all projects in the ecosystem
