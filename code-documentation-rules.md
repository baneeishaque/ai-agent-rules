<!--
title: Code Documentation & Pedagogical Explainer Rules
description: Standards for deep-dive, pedagogical code documentation including adjacent markdown files and various folder patterns.
category: Documentation & Standards
-->

# Code Documentation & Pedagogical Explainer Rules

This document defines the mandatory standards for documenting code across all "Ultra-Lean Industrial" projects. It prioritizes deep pedagogical clarity, allowing developers (and future agents) to understand not just *what* the code does, but *why* specific logic paths were chosen.

***

## 1. Documentation Taxonomy (Pattern Hierarchy)

Projects MUST adopt one of the following patterns based on their complexity and structural goals.

### 1.1 The "Component-as-a-Folder" Pattern (Gold Standard)

Standard for high-scale React/Frontend projects. Each logical unit is encapsulated in its own directory.

- **Structure**:

  ```text
  /MyComponent/
    MyComponent.tsx
    MyComponent.scss
    README.md  <-- Primary documentation
    index.ts
  ```

- **Rationale**: Highly portable and automatically rendered by source control platforms (GitHub/GitLab) when navigating the tree.

### 1.2 The "Descriptive Suffix" Pattern

Used when documentation needs to coexist with other non-code files (tests, stories) in a flat folder.

- **Structure**: `TableFilterComponent.docs.md`
- **Rationale**: Distinct from generic markdown; signals that the content is technical documentation for the sibling code file.

### 1.3 The "Direct Mapping" Pattern (Legacy/Initial)

- **Structure**: `TableFilterComponent.md`
- **Rationale**: Simple 1:1 mapping. Acceptable for initial drafts but should be evolved to Patterns 1.2 or 1.4 for industrial releases.

### 1.4 The "Industrial Explainer" Pattern (Mandatory for Architectures)

Mandatory for code within the `/architectures/` or `/lib/` directories.

- **Structure**: `[filename].[extension].md` (e.g., `engine.ts.md`, `storage.ts.md`)
- **Rationale**: Provides an unambiguous link to a specific logic file. Essential for deep technical training and auditability.

***

## 2. The Pedagogical Explainer Standard

All adjacent markdown files (Patterns 1.2, 1.3, and 1.4) MUST meet the following pedagogical standards:

- **Line-by-Line Mapping**: Every critical logic block MUST be explained with its corresponding line numbers or code snippets. For high-priority or complex logic, a **Deep Technical Breakdown Table** (Line, Logic, Pedagogical Rationale) is mandatory.
- **The "Why" vs. "What"**: Do not simply restate the code. Explain the rationale behind implementation choices (e.g., "We use a preset name here to avoid UI clutter from redundant date strings").
- **Use Case Scenarios**: Include a section for "Common Use Cases" and "Edge Cases" showing how the logic handles various input states.
- **Recommended Enhancements**: All explainers MUST include a "Recommended Enhancements" section at the end. This allows for documenting "State-of-the-Art" or strictness improvements.
  - **Non-Redundancy**: This section MUST NOT list flags/settings that are already enabled in the active configuration. It is strictly for *future* hardening.
- **Inline Documentation (JSDoc/TSDoc)**: All exported interfaces, props, and components MUST have standard JSDoc/TSDoc comments. This ensures IDE intellisense works for consumers of the shared code.
- **Relative Linking**: All documentation MUST use relative paths for internal references (siblings, parents, or session logs in the same repo). This ensures the folder remains a self-contained, portable unit.
- **Anchor Stability**: When linking to specific sections, prioritize descriptive section headings over line numbers or section digits. Headings change rarely, while line numbers drift after every refactor.
- **Zero Noise**: Avoid introductory fluff. Start directly with the technical breakdown.
- **Architectural Decision Matrix**: If the component makes a specific architectural choice (e.g., "Using `sx` over `scss`" or "Using a specific Validation Library"), this MUST be documented with a comparison table explaining the "Why", "Pros", and "Cons".

***

## 3. Implementation Plan (IP) Integration

For major features or architectural changes, documentation MUST include an **Implementation Plan (Goal Document)** stored in a `/docs/` or `/architectures/` directory.

- **Traceability**: The IP must link to the resulting code and its explainers.
- **Approval Log**: Document user approval of the design before the execution phase begins.

***

## 4. Verification & Formatting

- **Linting**: All documentation MUST pass **[Markdown Generation Rules](./markdown-generation-rules.md)**.
- **Language Tags**: Code blocks MUST use the correct language identifier (e.g., `typescript`, `bash`, `markdown`).
- **Diff Blocks**: When documenting changes, use `diff` blocks to show the exact delta.

***

## 5. Related Conversations & Traceability

- **Session Log Localization**: Session logs that explain specific logic within a repository MUST be moved to that repository's `/docs/conversations/` directory.
- **Traceability**: Documentation resulting from a specific session MUST be linked back to the localized log using a relative path.

## 6. Documentation Maintenance & Drift Protocol

Technical documentation MUST remain a living extension of the code.

- **Atomic Updates**: Any modification to logic that changes line numbers or functionality in a "Gold Standard" or "Industrial Explainer" component MUST include a corresponding update to the adjacent `.md` file in the same change set.
- **Line Number Verification**: Line references in pedagogical tables or snippets MUST be audited after any refactor using `view_file_outline` or equivalent tools to ensure they haven't drifted.
- **Structural Integrity**: Manual edits to documentation MUST preserve the **Deep Technical Breakdown Table** format defined in Section 2.
- **Session Linking**: If a session results in significant architectural clarification, the resulting documentation SHOULD link to the relevant session log.
- **Git Repo Permalinks**: All external or cross-repository links MUST use commit-specific SHAs (permalinks) instead of branch names (e.g., `main`, `master`) to prevent link rot.
- **Submodule Reference Protocol**: When referencing specialized rules stored in a submodule, the link MUST point directly to the submodule's dedicated repository URL (e.g., `github.com/org/submodule-repo`) rather than its path within the parent repository.

## 7. Auto-Generated Documentation & Templates

When documentation files themselves are auto-generated (e.g., repository index files):

- **Template First**: Structural edits (headers, diagrams, tables) MUST be performed on the `.template` file.
- **Placeholder Integrity**: Do not manually replace placeholders like `<!-- RULES_INDEX -->` or `<!-- RULES_README -->`. These are managed by system scripts.
- **Direct Edit Prohibition**: The agent **is BLOCKED** from directly editing or committing the output files (e.g., `README.md`, `agent-rules.md`). These are updated exclusively via CI/CD.
