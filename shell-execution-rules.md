---
title: Shell Execution
description: Guidelines for shell command execution,
    ensuring transparency, user control, and adherence to security protocols.
category: Core Agent Behavior
---


# Enhanced Shell Execution Rules

This document provides a comprehensive set of guidelines for an AI agent on the safe, transparent, and effective
execution of shell commands. It is a critical component of the overall security and control framework, ensuring that
all command-line operations are predictable, auditable, and user-approved.

***

## 1. Core Principles

All shell command execution by the agent must be governed by these fundamental principles:

- **Explain Critical Commands**: Before running any command that could modify the file system, codebase, or system

    state, the agent must provide a brief, clear explanation of the command's purpose and potential impact. This
    prioritizes user understanding and safety.

- **Full Output Visibility**: The agent **must** display the full, unmodified output from both standard output

    (`stdout`) and standard error (`stderr`) for every command executed. This ensures complete transparency and
    provides the user with all the necessary information for debugging.

- **Prioritize Safety and Non-Destructive Actions**: The agent's default behavior should be cautious. When in doubt

    about a command's safety, it should seek user clarification or confirmation before proceeding.

***

### 2. Operational Protocol

Every shell command execution must be integrated into the agent's overall planning framework and follow a structured
protocol.

#### 2.1 Plan Before Action

As mandated by the `ai-agent-planning-rules.md` document, all shell commands must be part of an explicit, user-approved
plan. This prevents the agent from executing commands in an ad-hoc or unapproved manner.

#### 2.2 Interactive Commands

- **Avoidance**: The agent must prefer and use non-interactive versions of commands whenever possible (e.g., `npm

    init -y`instead of`npm init`).

- **Handling Necessity**: If an interactive command is absolutely necessary, the agent must inform the user that it

    cannot be supported and may cause the process to hang until canceled.

#### 2.3 Background Processes

The agent must use background processes (via `&`) for commands that are not expected to terminate on their own (e.g., a
development server). If the agent is unsure, it must ask the user for guidance.

#### 2.4 UTF-8-Safe Bulk Text Edits in PowerShell (FORBIDDEN PATTERNS)

When the agent edits files via the terminal (e.g., bulk URL replacements, in-place string substitution, applying a
patch through a shell pipeline), the chosen toolchain MUST preserve UTF-8 byte-for-byte. Windows PowerShell 5.1 — the
default shell on Windows — silently corrupts non-ASCII characters (`§`, `—`, `–`, `→`, emoji, accented letters) unless
explicit encodings are used at BOTH the read and write step. This produces *mojibake* (`Â§`, `â€"`, `â€"`) that survives
every subsequent edit and pollutes the repository.

##### Root cause (one-line summary)

Windows PowerShell 5.1's `Get-Content` defaults to the system ANSI code page (typically Windows-1252), and `Out-File` /
`Set-Content -Encoding utf8` writes a **BOM-prefixed** UTF-8. Reading UTF-8 as Win-1252 doubles every multi-byte
character into two Latin-1 characters; re-encoding that as UTF-8 then writes the corrupted form on disk.

##### Forbidden patterns (Windows PowerShell 5.1)

| Pattern | Failure mode |
|---|---|
| `Get-Content -Raw $p` (no `-Encoding`) on a UTF-8 file | Reads as Win-1252 → `§` becomes `Â§` |
| `Set-Content -Encoding utf8 $p $text` | Writes UTF-8 **with BOM**; combined with the above, persists mojibake |
| `Out-File -Encoding utf8 $p` for content that contains non-ASCII | Same BOM problem; also defaults to Win-1252 on input redirection |
| `(Get-Content $p) -replace 'a','b' \| Set-Content $p` | Both ends default-encoded — round-trip corruption guaranteed |
| `type file.md > out.md` in PowerShell 5.1 | Re-encodes via the console code page |

##### Required patterns (Windows PowerShell 5.1)

For any read-modify-write of a file that may contain non-ASCII, the agent MUST use the .NET API directly:

```powershell
# Read — always specify UTF-8 explicitly
$text = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)

# Modify
$text = $text.Replace('old', 'new')

# Write — UTF-8 WITHOUT BOM (matches the existing file convention; BOMs break shell scripts,
# diff tools, and many Linux toolchains)
$u8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($p, $text, $u8NoBom)
```

For pipelines, `Get-Content -Encoding UTF8` and `Set-Content -Encoding UTF8` are acceptable in PowerShell 5.1 ONLY
when both sides specify `-Encoding UTF8`, BUT `Set-Content -Encoding UTF8` still writes a BOM — prefer the .NET API
above for BOM-free output.

##### Preferred path — PowerShell 7+ or the edit tools

- **PowerShell 7+ (`pwsh`)**: defaults to BOM-less UTF-8 for both read and write. Bulk edits SHOULD prefer `pwsh`
  when available.
- **In-editor tools first**: For agent-driven edits, `replace_string_in_file` / `multi_replace_string_in_file` /
  `edit_notebook_file` are the FIRST choice. They preserve encoding. The terminal route is a fallback for
  multi-file bulk transforms only.

##### Mandatory post-edit verification

After any terminal-based bulk text edit on files containing non-ASCII, the agent MUST scan for mojibake markers
before considering the edit complete. This is the same encoding sanity-check defined in the
**[Redaction & Portability Skill](https://github.com/Baneeishaque/ai-agents/blob/de777420fe2931e8ef43ea7a0aa9b27f7e6bf296/.agents/skills/redaction-portability/SKILL.md)
§8 Step 5** and applies identically here:

```powershell
Select-String -Path '<edited-files>' -Pattern 'Ã|â€|Â|ï¿½'
# (no output expected; any hit MUST be repaired before commit)
```

Mojibake repair recipe (reverses the Win-1252 → UTF-8 double-encode):

```powershell
$bytes  = [System.IO.File]::ReadAllBytes($p)

# CRITICAL: strip any leading UTF-8 BOM (EF BB BF) BEFORE the round-trip.
# The BOM is U+FEFF, which has NO representation in Windows-1252; .NET will
# silently substitute it with `?` (0x3F), corrupting the first byte of the file.
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $stripped = New-Object byte[] ($bytes.Length - 3)
    [Array]::Copy($bytes, 3, $stripped, 0, $bytes.Length - 3)
    $bytes = $stripped
}

$bad    = [System.Text.Encoding]::UTF8.GetString($bytes)
$w1252  = [System.Text.Encoding]::GetEncoding(1252)
$fixed  = [System.Text.Encoding]::UTF8.GetString($w1252.GetBytes($bad))
$u8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($p, $fixed, $u8NoBom)
```

> **BOM hazard**: if you omit the BOM-strip guard above, every file that originally
> had a UTF-8 BOM will end up with a literal `?` (`0x3F`) as its first byte after
> the repair — a second corruption layered on top of the first. The fix is the
> 4-line `if` block; the verification is `[System.IO.File]::ReadAllBytes($p)[0..3]`,
> which MUST return `2D 2D 2D 0D` (or similar non-`3F` first byte) for YAML
> frontmatter files.

##### Cross-shell parity

The same hazard exists in any environment where the agent invokes a shell with a non-UTF-8 default code page
(`cmd.exe` legacy, older Git Bash on Windows, locales such as `C` / `POSIX` on Unix). The rule generalizes: **read
and write MUST both specify UTF-8 explicitly; the write MUST be BOM-less unless the file's existing convention
demands a BOM.** When in doubt, use the editor's edit tools instead of the shell.

***

### 3. Integration & Observability

The shell execution rules are not isolated; they are a key part of a larger, integrated system.

- **User-Provided Input**: The agent must be vigilant about commands that could potentially modify the user's system

    outside of a designated project directory or system temporary directory. The agent should remind the user to
    consider sandboxing in these cases.

- **Auditing and Observability**: Every command executed and its corresponding output must be logged for auditing and

    debugging. This aligns with the "Observability" principles from the `ci-cd-rules.md`, which mandates structured
    logging and centralized metrics.
