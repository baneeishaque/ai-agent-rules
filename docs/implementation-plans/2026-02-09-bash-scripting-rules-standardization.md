# Implementation Plan: Bash Scripting Rules & Rule Ecosystem Normalization

Establish industrial bash scripting standards and normalize the rule ecosystem to ensure absolute portability
and traceability.

## Change History

| Timestamp | Summary of Changes | Rationale |
| :--- | :--- | :--- |
| `[2026-02-09 02:25]` | Paired markdown standards in all mandates. | Address user feedback. |
| `[2026-02-09 02:22]` | Expanded User Q&A with explicit YES/NO answers. | Mandated by `ai-agent-planning-rules.md`. |
| `[2026-02-09 02:11]` | Added User Questions & Answers section. | Mandated by `ai-agent-planning-rules.md`. |

## User Questions & Answers

| Question | Yes/No | Rationale & Action |
| :--- | :--- | :--- |
| **Q1**: Does `ai-rule-standardization-rules.md` state to follow `markdown-generation-rules.md` & `markdown-generation-rules-additions.md`? | **NO** | It referenced `markdown-generation-rules.md` but not the `additions.md`. **ACTION**: Updated and mandated both. |
| **Q2**: Does `ai-rule-standardization-rules.md` state to follow `ai-agent-session-documentation-rules.md` for session documentation? | **NO** | It mentioned linking to logs but didn't explicitly name the rule file. **ACTION**: Updated to mandate its use. |
| **Q3**: Does `ai-agent-session-documentation-rules.md` state to follow `markdown-generation-rules.md` & `markdown-generation-rules-additions.md`? | **YES** | Section 2.2 / Line 64 explicitly mandates this pair. |
| **Q4**: Do `markdown-generation-rules.md` & `markdown-generation-rules-additions.md` clearly speak about portability? | **YES** | Section 4.2.1 of `markdown-generation-rules.md` explicitly prohibits absolute paths. |

## Proposed Changes

### [ai-agent-rules]

#### [MODIFY] [`ai-rule-standardization-rules.md`](../../ai-rule-standardization-rules.md)

- **Section 4 (Traceability Portability)**: Explicitly mandate following BOTH `markdown-generation-rules.md` and
    `markdown-generation-rules-additions.md`.
- **Section 4**: Explicitly mandate following `ai-agent-session-documentation-rules.md` for session logs.
- **Section 5 (Verification & Commit)**: Explicitly reference both markdown generation rule files for lint checks.

#### [MODIFY] [`ai-agent-planning-rules.md`](../../ai-agent-planning-rules.md)

- **Section 8 (Task Artifact Synchronization)**: Mandate compliance with BOTH `markdown-generation-rules.md` and
    `markdown-generation-rules-additions.md` for all planning artifacts.

#### [NEW] [`docs/conversations/2026-02-09-bash-scripting-standards-establishment.md`](../conversations/2026-02-09-bash-scripting-standards-establishment.md)

Permanent conversation log following the strict structure of `ai-agent-session-documentation-rules.md`.

#### [NEW] [`docs/walkthroughs/2026-02-09-bash-scripting-standards-walkthrough.md`](../walkthroughs/2026-02-09-bash-scripting-standards-walkthrough.md)

Permanent walkthrough record, 100% compliant with portable relative path requirements and both standards.

#### [MODIFY] [`bash-scripting-rules.md`](../../bash-scripting-rules.md)

- Update "Related Conversations & Traceability" to use a portable relative link to the permanent log.
- Re-verify all content for `file:///` violations and compliance with BOTH markdown standards.

## Verification Plan

### Automated Tests

- Run `markdownlint-cli2` on all modified files.
- Verify zero absolute paths: `grep -rE "file:///|/Users/" .` in the `ai-agent-rules` directory.

### Manual Verification

- Confirm all relative links are navigable and correctly structured.
