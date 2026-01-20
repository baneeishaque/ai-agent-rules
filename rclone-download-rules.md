<!--
title: Rclone Download Optimization Rules
description: Protocol for efficient, reliable, and user-controlled rclone downloads with progress tracking, size-based ordering, and integrity verification.
category: Data Transfer & Cloud Storage
-->

# Rclone Download Optimization Rules

When user requests to download files from rclone remotes, follow this context-aware workflow that balances efficiency, reliability, and user control. The protocol differentiates between initial downloads (where destination doesn't exist) and resume scenarios (where partial downloads exist).

***

### 1. Remote Name Verification

Before executing any rclone operations, always verify the correct remote name:

**Verification Command:**
```bash
rclone listremotes
```

**Key Behaviors:**
- Remote names are case-sensitive and include colons (e.g., `Guzty-Technician-GDrive:`)
- User-provided names may use simplified formatting (e.g., "guzty technician gdrive")
- Always confirm the exact remote name before proceeding with operations

***

### 2. Context-Aware Download Workflows

#### 2.1 Initial Download (Destination Does Not Exist)

**Step 1: List files for user review**
```bash
rclone ls "Remote-Name:Path" --human-readable
```

**Step 2: Download with optimal settings**
```bash
rclone copy "Remote-Name:Path" ./Destination --progress --transfers 1 --checkers 1 --order-by size,ascending --checksum --retries 3 --low-level-retries 10 -vv
```

**Rationale:**
- Listing files first allows user to review what will be downloaded
- `rclone copy` is inherently resume-safe (skips existing/identical files)
- No need for `rclone check` when destination doesn't exist

#### 2.2 Resume Interrupted Download (Destination Partially Exists)

**Step 1: Verify existing files and identify missing ones**
```bash
rclone check "Remote-Name:Path" ./Destination --checkers 8 --one-way --missing-on-dst ./missing-files.txt -vv
```

**Step 2: Resume download with same command**
```bash
rclone copy "Remote-Name:Path" ./Destination --progress --transfers 1 --checkers 1 --order-by size,ascending --checksum --retries 3 --low-level-retries 10 -vv
```

**Rationale:**
- `rclone check` efficiently identifies what's missing using parallel checkers
- Same download command works because `rclone copy` automatically skips completed files

***

### 3. Flag Usage & Optimization

#### 3.1 Core Flags (Always Use)

| Flag | Purpose | Value |
|------|---------|-------|
| `--progress` | Human-readable progress display | Shows speed, ETA, percentage |
| `--transfers 1` | Sequential downloads | One file at a time |
| `--checkers 1` | Sequential checking (download phase) | Required for strict ordering |
| `--order-by size,ascending` | Size-based ordering | Downloads small files first |
| `--checksum` | Integrity verification | Validates after download |
| `--retries 3` | High-level retry logic | Handles failed transfers |
| `--low-level-retries 10` | Low-level retry logic | Handles network errors |
| `-vv` | Verbose logging | Detailed output for debugging |

#### 3.2 Context-Specific Flags

**For checking existing files (resume scenario):**
- `--checkers 8`: Parallel checking for efficiency (does not affect download ordering)
- `--one-way`: Only check source → destination
- `--missing-on-dst ./missing-files.txt`: Output list of missing files

**For dry runs (optional):**
- `--dry-run`: Simulate operation without actual download

#### 3.3 Critical Trade-offs

**Checkers vs. Ordering:**
- Multiple checkers (`--checkers 8`) improve checking efficiency but can disrupt `--order-by` sorting during downloads
- For strict sequential ordering: Always use `--checkers 1` during the download phase
- Parallel checkers (`--checkers 8`) are safe during the verification phase only

***

### 4. Command Chaining

When combining check and download operations, use shell chaining:

```bash
rclone check "Remote:Path" ./Destination --checkers 8 --one-way --missing-on-dst ./missing-files.txt -vv && rclone copy "Remote:Path" ./Destination --progress --transfers 1 --checkers 1 --order-by size,ascending --checksum --retries 3 --low-level-retries 10 -vv
```

**Behavior:**
- `&&` ensures download only proceeds if check succeeds
- User can review check results before execution
- Single command for reproducibility

***

### 5. User Communication Protocol

**Always explain these key points:**
1. **Resume Safety**: `rclone copy` automatically skips completed files
2. **Ordering Trade-off**: `--checkers 1` required for strict size-based ordering
3. **Reliability Features**: Automatic retries and checksum verification
4. **Progress Visibility**: Human-readable progress with ETA

**Do NOT:**
- Suggest `rclone check` for non-existent destinations (pointless operation)
- Use parallel checkers during download phase when ordering is required
- Omit verification flags (`--checksum`) for large transfers

***

### 6. Size Analysis Commands

**List top-level folder sizes:**
```bash
rclone size "Remote-Name:" --max-depth 1
```

**List all directories:**
```bash
rclone lsd "Remote-Name:"
```

**Get specific folder size:**
```bash
rclone size "Remote-Name:Folder-Path"
```

***

### 7. Related Conversations & Traceability

- **Session Log**: [2026-01-19-rclone-download-optimization.md](./conversations/2026-01-19-rclone-download-optimization.md)
- **Date Created**: 2026-01-19
- **Context**: User requested efficient workflow for downloading large datasets from rclone remotes with progress tracking and size-based ordering
