<!--
title: Git Rebase Standardization Rules
description: Industrial protocol for hierarchical branch rebasing, cross-branch deduplication, and literal commit fidelity.
category: Git & Repository Management
-->

# Git Rebase Standardization Rules

This document defines the mandatory protocol for managing complex, multi-branch Git rebases. It ensures hierarchical alignment, eliminates redundancy across branch chains, and maintains absolute commit fidelity.

***

## 1. Hierarchical Dependency Mapping

Before any rebase execution, the agent **MUST** map the branch dependencies using a Mermaid graph. This graph serves as the architectural blueprint for the rebase.

### 1.1 Dependency Visualization

Every complex rebase plan MUST include a `mermaid` diagram defining:

- **Base Anchor**: The target branch (e.g., `main` or `origin/main`).
- **Chain Segments**: Groupings of branches by concern (e.g., Foundation, Logic, Tooling).
- **Branch Relationships**: Clear directional arrows showing the rebase path.

***

## 2. Commit Action Mapping (CAM)

The agent **MUST** categorize every significant commit in the chain using a Commit Action Map (CAM) table.

| Action | Definition | Constraint |
| :--- | :--- | :--- |
| **KEEP** | Functional changes unique to the branch. | Verify no duplication in parent branches. |
| **REWORD** | Commit requires better fidelity or "Dig Down" details. | MUST include literal message payload in plan. |
| **DROP** | Commit is redundant or already present in a parent. | State the specific redundant SHA or Logic. |
| **SQUASH** | Related commits merged for atomicity. | Title MUST follow Conventional Commits. |

***

## 3. The "Dig Down" Fidelity Principle

For every **REWORD** action,尤其是涉及 binary, LFS, or complex config files, the agent **MUST** "dig down" into the content.

- **Content Analysis**: Inspect the actual hunk or blob (e.g., `cat -v`, `jq`, or `file` analysis).
- **Explicit Mention**: The commit body MUST list specific package changes, configuration keys, or binary assets added/modified.
- **Rationale**: Explain *why* these specific changes were grouped together or why they are critical for the branch context.

***

## 4. Literal Execution Protocol (SSOT)

Implementation plans for history-altering operations MUST be **Single Source of Truth (SSOT)** and **Exhaustive**.

- **Exact Commands**: Include the literal CLI commands (e.g., `git rebase --onto`).
- **Literal Payloads**: Message bodies MUST be provided as literal strings to prevent "hallucination" during execution.
- **Atomic Hygiene**: Every step MUST include the necessary cleanup commands (`git gc --prune=now`, tag deletion).

***

## 5. Operational Verification & Guardrails

### 5.1 The Rebase-Reset Reset

If a reword accidentally applies to the wrong branch (detected via `git status` or `git log`), the agent MUST:

1. **Stop immediately**.
2. **Reverse using Reflog**: identify the clean state and `git reset --hard` back to it.
3. **Re-execute** from the correct branch.

### 5.2 Empty Commit Guardrail

The agent is **PROHIBITED** from skipping empty commits (`git rebase --skip`) without explicit user confirmation.

### 5.3 Post-Operation Hygiene

After every successfully completed branch rebase:

1. **Garbage Collection**: Run `git gc --prune=now`.
2. **Tag Cleanup**: Delete temporary backup tags created for the operation.
3. **Graph Verification**: Present `git log --oneline --graph -n 5` to confirm the new anchorage.

***

## 6. Related Conversations & Traceability

- Standard established based on the hierarchical rebase session (Jan 2026).
- Follows [AI Rule Standardization Rules](./ai-rule-standardization-rules.md).
