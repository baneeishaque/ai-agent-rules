<!--
title: Zero Data Loss Cloud Cleanup Rules
description: Mandatory verification protocol before deleting cloud-synced local files to prevent data loss.
category: Data Safety & Integrity
-->

# Zero Data Loss Cloud Cleanup Rules

This document defines the mandatory verification protocol that agents MUST follow before deleting any local files
that are intended to be backed up to cloud storage. The primary directive is to ensure 100% data safety by verifying
that all local files exist in the cloud before deletion.

***

## 1. Core Safety Directive

Before deleting any local files that are intended to be cloud-backed, the agent MUST verify that all local files are
safely stored in the cloud. This verification is NOT optional and MUST be completed before any deletion operation.

### 1.1 Prohibited Verification Methods

The following methods are PROHIBITED for safety verification:

- **`rclone sync --dry-run`**: This command reports files that would be copied due to timestamp/metadata differences,
    NOT files that are missing from the destination. It produces false positives and cannot be trusted for safety
    verification.

- **Visual inspection**: Manual checking of file lists is error-prone and does not scale.

- **Assumptions based on sync history**: Previous sync operations do not guarantee current cloud state, especially if
    files were modified locally after the last sync.

***

## 2. Mandatory Verification Protocol

### 2.1 Required Command Pattern

The agent MUST use `rclone check` with the following flags:

```bash
rclone check <local-path> <remote-name>: \
  --filter "- .DS_Store" \
  --filter "+ /<folder-pattern>/**" \
  --filter "- *" \
  --one-way \
  --missing-on-dst <output-file>
```

### 2.2 Flag Explanations

- **`--one-way`**: Checks only for files in the source (local) that are missing in the destination (cloud). This is
    the correct direction for pre-deletion verification.

- **`--missing-on-dst <output-file>`**: Writes the list of missing files to a file for review. This creates a
    permanent record of the verification.

- **`--filter`**: Applies the same filters used during sync to ensure consistency. The pattern must match the original
    sync configuration.

### 2.3 Verification Report Requirements

After running the verification command, the agent MUST:

1. **Count Missing Files**: Use `wc -l <output-file>` to count the number of missing files.

2. **Sample Missing Files**: Use `head -n 20 <output-file>` to show examples of missing files.

3. **Present to User**: Create a clear summary report showing:
    - Total number of missing files
    - Examples of missing files (first 20)
    - Explicit recommendation (safe to delete OR sync required)

***

## 3. Decision Protocol

### 3.1 Safe to Delete

If the verification shows **0 missing files**, the agent MAY proceed with deletion after explicit user approval.

**Example Report:**

```markdown
**Verification Complete:**
- Folder: `WhatsApp Video`
- Missing files: 0
- Status: ✅ Safe to delete
```

### 3.2 Sync Required

If the verification shows **any missing files**, the agent MUST:

1. **Block deletion**: Do NOT proceed with deletion under any circumstances.

2. **Recommend sync**: Suggest running a sync operation to upload the missing files first.

3. **Provide sync command**: Offer the exact `rclone sync` command to upload the missing files.

**Example Report:**

```markdown
**Verification Complete:**
- Folder: `Redmi-Note-10-Lite`
- Missing files: 1,701
- Status: ❌ NOT safe to delete
- Action required: Sync missing files to cloud first
```

***

## 4. Multi-Folder Verification

When verifying multiple folders, the agent MUST run separate verification commands for each folder and present
individual reports. Do NOT combine folders into a single verification unless they share identical filter patterns.

**Example:**

```bash
# Folder 1: Redmi Note
rclone check ../One-Drive-Banee-Hotmail/ One-Drive-Banee-Hotmail: \
  --filter "- .DS_Store" \
  --filter "+ /Redmi-Note-10-Lite/**" \
  --filter "+ /Redmi-Note-10-Lite-SD-card/**" \
  --filter "- *" \
  --one-way \
  --missing-on-dst files_missing_redmi.txt

# Folder 2: WhatsApp
rclone check ../One-Drive-Banee-Hotmail/ One-Drive-Banee-Hotmail: \
  --filter "- .DS_Store" \
  --filter "+ /WhatsApp Video/**" \
  --filter "+ /WhatsApp Video Private/**" \
  --filter "+ /WhatsApp Video Sent/**" \
  --filter "- *" \
  --one-way \
  --missing-on-dst files_missing_whatsapp.txt
```

***

## 5. User Communication

### 5.1 Clarity Mandate

All verification reports MUST be clear, concise, and actionable. Use visual indicators (✅/❌) to make the safety
status immediately obvious.

### 5.2 Blocking on User Approval

Even if verification shows 0 missing files, the agent MUST NOT proceed with deletion without explicit user approval.
The `notify_user` tool MUST be used with `BlockedOnUser: true` to request approval.

***

## 6. Edge Cases

### 6.1 Partial Folder Deletion

If the user wants to delete only a subset of files within a folder, the agent MUST:

1. Verify the entire folder first (to establish baseline safety).
2. If safe, allow deletion of the subset.
3. If not safe, recommend syncing the entire folder before any deletion.

### 6.2 Filter Pattern Mismatch

If the user's sync filters have changed since the last sync, the agent MUST use the CURRENT filter pattern for
verification, not the historical pattern. This ensures the verification matches the user's current intent.

***

## 7. Traceability

All verification commands and their outputs MUST be preserved in the conversation artifacts directory for audit
purposes. This includes:

- The exact command used
- The output file with missing files list
- The verification report presented to the user
- The user's approval decision
