<!--
title: Git Submodule History Repair Rules
description: Protocols for repairing broken submodule pointers caused by history rewrites in submodule repositories.
category: Git & Repository Management
-->

# Git Submodule History Repair Rules

Broken submodule pointers occur when the commit hash referenced by a parent repository is removed or rewritten in the
submodule repository. This rule defines the procedure for identifying and repairing these markers.

***

## 1. Detection Phase

The agent MUST identify all stales pointers before proposing a fix.

### 1.1 List Referenced Submodule Commits

Use the following command in the parent repository to find all unique submodule hashes ever referenced:

```bash
git log --all --pretty=format:"%H" -- <submodule-path> | xargs -I {} git rev-parse {}:<submodule-path> | sort | uniq

```bash

### 1.2 Identify Missing Commits

Verify existence of these commits in the submodule repository:

```bash
cd <submodule-path>
git rev-list --all

```bash

Intersect the lists to find hashes present in the parent but missing in the submodule.

***

## 2. Mapping Phase

The agent MUST map missing commits to their modern counterparts.

### 2.1 Criteria for Mapping

The priority for mapping is:

1. **Commit Message Match**: Identifying commits in the rewritten history with identical or near-identical summaries.

1. **Temporal Proximity**: Comparing commit timestamps if messages have changed.

1. **Content Analysis**: Comparing the tree state if the previous methods fail.

***

## 3. Repair Phase

History repair MUST be performed carefully to avoid unintended data loss.

### 3.1 Pointer Rewriting

Depending on the scope, use one of the following:

- **`git filter-repo`**: For large-scale rewriting of historical pointers.

- **`git rebase -i`**: For small-scale, recent history fixes.

- **Industrial Rewrite Script (`commit-tree`)**: For **High-Fidelity** repairs where commit parity (dates, authors)

    must be preserved 100%. This is preferred over rebase for complex history to avoid "flattening" or dropping empty
    commits.

- **Commit Amendment**: For fixing only the HEAD or recent commits.

***

## 4. Verification

After repair, the agent MUST confirm:

1. `git submodule update` completes without error.

1. `git status` shows no unexpected changes.

1. Parental history remains intact (besides the hash changes).

***

## 5. Related Conversations & Traceability

- [2026-02-01 Submodule History Repair](./conversations/2026-02-01-submodule-history-repair.md)
