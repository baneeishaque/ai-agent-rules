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

#### 2.3.1 Compound Exploration Chains — Atomize, Don't Concatenate

When inspecting unfamiliar filesystem state (paths that may not exist, sibling
candidates, optional configs), the agent MUST issue **small independent shell
calls**, NOT one long `&&` / `|` chain with `2>/dev/null` swallowing errors.

Hazards of the chained form:

- `2>/dev/null` hides the diagnostic that would have told the agent *which*
  segment failed, leaving the entire chain in indeterminate state.
- `| head -N` on a slow / mounted / network-backed filesystem can stall the
  pipeline if the upstream blocks before producing N lines (SIGPIPE timing).
- A non-existent path inside `find` / `grep -r` can trigger a slow traversal
  fallback in some shells before the error is suppressed.
- Mixing the above with a missing-but-similarly-named path (e.g.
  `/path/foo/` vs `/path/foo-2/`) yields a silent stall that looks like the
  tool itself hung.

Required pattern: one purpose per call. Read the result. Decide. Issue the
next call. Compose multiple **independent** lookups in parallel tool calls
(NOT chained in one bash string) when they don't depend on each other.

#### 2.3.2 Prefer Bash Heredocs Over Editor Edit Tool for Large Writes

The agent's editor-side `edit` tool can hang or time out on large markdown /
JSON / code files (empirically: anything > ~10 KB or with many surrounding
lines included in `old_str` matching). When a write is large, full-file, or
spans many lines, the agent MUST use a Bash heredoc instead:

- Whole-file authoring → `cat > /abs/path <<'EOF' ... EOF`
- In-place transformations → `python3 - <<'PY' ... PY` reading and rewriting
  the file via `Path(...).read_text()` / `write_text()`.

The `edit` tool remains appropriate for small, surgical replacements with
clearly unique `old_str` context. For multi-line / whole-file / new-file
authoring, prefer Bash.

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

#### 2.5 Script Invocation Discipline (no gratuitous subprocesses, no reflexive policy bypass)

When the agent has authored a script file (`.ps1`, `.sh`, `.py`, `.js`, `.ts`, ...) and needs to run it, the agent
MUST choose the invocation form deliberately, not reflexively. The defaults below apply; deviation requires a
one-line written justification in the agent's message.

##### Default — run in the current interactive session

If the agent is already inside a trusted terminal session in the workspace, invoke the script directly:

```powershell
# PowerShell (current session)
.\split_log_194.ps1
```

```bash
# Bash / zsh (current session)
./build.sh
```

```bash
# Python / Node (current session)
python ./tools/foo.py
node ./tools/bar.mjs
```

This preserves the session's cwd, environment variables, loaded modules, and any state the user has established. It
also keeps `stdout` / `stderr` flowing through the same terminal the user is watching.

##### When a child process IS justified

Spawn a child interpreter (`powershell -File`, `pwsh -File`, `bash -c`, `python -c`, ...) ONLY when one of the
following is true, and SAY which one applies:

- **Shell mismatch**: current shell cannot run the script (e.g., need `pwsh` from `cmd.exe`; need `bash` from
  PowerShell).
- **Isolation required**: the script must NOT inherit the current session's environment (e.g., reproducing a CI
  invocation; testing a fresh `$PROFILE`-free run).
- **Cross-shell wrapper**: a build step or task definition (`tasks.json`, `Makefile`, `package.json`) must specify
  an absolute, portable invocation.

##### Subprocess flag discipline (when a child IS justified)

| Flag | When to use it | When NOT to use it |
|---|---|---|
| `powershell -File <path>` / `pwsh -File <path>` | When spawning a child is justified per above | Inside an existing PS session — use `.\path.ps1` |
| `-NoProfile` | When isolation from `$PROFILE` is the explicit reason for the subprocess (CI repro, debugging profile side-effects) | As decorative boilerplate; it has no effect if you weren't spawning a child to begin with |
| `-ExecutionPolicy Bypass` | NEVER as a per-invocation default. Only when the user has explicitly authorized a one-shot bypass for a script they have just inspected | As a workaround for an `UnauthorizedAccess` error — the correct fix is `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, with user consent |
| `-Command "..."` | When passing a single short expression that wouldn't justify a script file | When you have a script file — use `-File` |

##### `ExecutionPolicy` error — correct response

If `.\foo.ps1` fails with `cannot be loaded because running scripts is disabled on this system`, the agent MUST:

1. Surface the error and the policy state (`Get-ExecutionPolicy -List`) to the user.
2. Propose one of two remediations and ask the user to pick:

   - **Persistent (recommended)**: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (one-time, user-scoped).
   - **One-shot**: `powershell -ExecutionPolicy Bypass -File .\foo.ps1` (only for THIS run, with user consent).

3. NEVER silently slip `-ExecutionPolicy Bypass` into routine invocations.

##### Forbidden patterns (script execution)

| Pattern | Failure mode |
|---|---|
| `powershell -NoProfile -ExecutionPolicy Bypass -File .\script.ps1` from inside an existing PS session | Spawns unneeded child process; loses cwd/env; silently bypasses a policy the user may have set deliberately; `-NoProfile` is meaningless decoration |
| `bash -c "./script.sh"` from inside an existing bash session | Same class of mistake — unnecessary subshell, lost state |
| `chmod +x` then `./script.sh` without first asking the user | Mutating the script's mode bits as a side-effect of running it; ask first |
| Re-invoking `python` / `node` to run a script when an activated venv / `nvm`-pinned shell is already loaded | Risks picking the wrong interpreter; prefer the active shell's resolved binary |

##### Cross-shell parity

The discipline generalizes:

- **Bash / zsh**: prefer `./script.sh` over `bash -c './script.sh'`. Reserve `bash -lc` for cron / CI where a login
  shell is genuinely required.
- **Python**: prefer running inside the activated venv (`python script.py`) over `<venv>/Scripts/python.exe script.py`
  unless the user has explicitly asked for a non-activated invocation.
- **Node**: prefer `node script.mjs` in the project's `nvm`-pinned shell over `npx --node-arg=... node script.mjs`.

##### Worked example

The `large-text-file-stream-split` skill in the public `ai-agents` repo
(`.agents/skills/large-text-file-stream-split/`) is a reference application of this
section: its `scripts/build_split_log.ps1` is invoked as `.\build_split_log.ps1` from
the caller's existing PowerShell session (no child `powershell -File`, no
`-ExecutionPolicy Bypass`), and its companion `SKILL.md` §3 + §4.2 enforces the
PATH-first compiler probe with a documented fallback for organization-specific
toolbase environments.

#### 2.6 PowerShell Non-ASCII Transport Hazards (the complete field manual)

§2.4 covers **file I/O encoding** (read-modify-write of an existing file). This
section covers the *other* axis: the **transport layer** — the path a string takes
from the agent's reasoning context, through the VS Code terminal, through the
PowerShell parser, through the `$OutputEncoding` / `[Console]::OutputEncoding` /
native-process-stdin layers, and finally into the destination tool (`git commit -F`,
`python script.py`, `gh issue create -b ...`, ...). At every stage, Windows
PowerShell 5.1's defaults can silently re-encode a non-ASCII codepoint (em-dash `—`,
section sign `§`, arrow `→`, smart quotes `'` `'` `"` `"`, ellipsis `…`, accented
letters, emoji, every CJK / Cyrillic / Greek / Arabic codepoint) into mojibake — and
because the destination tool receives the corrupted bytes WITHOUT knowing they were
ever supposed to be something else, the corruption is committed verbatim and
propagates downstream forever.

This skill has been bitten by this hazard at least four times in a single working
session. The damage modes observed:

- Commit messages authored via PowerShell here-string contain `\"` artifacts and
  garbled em-dashes — visible in `git log`, copied verbatim into release notes.
- `AGENTS.md` re-saved by some editor invocation arrives back on disk with every
  pre-existing em-dash turned into `├óΓé¼ΓÇ¥` (three-byte double-encoding) on ~30
  unrelated rows, polluting every subsequent `git diff`.
- `git commit -m "feat: support §1.0"` reaches Git as `feat: support \u00c2\u00a7`
  → permanent corruption of the section sign in the commit object.
- A shell-piped JSON body sent via `Invoke-RestMethod -Body $json` is re-encoded to
  Windows-1252 before transit; the receiving REST endpoint rejects it as malformed
  UTF-8.

##### 2.6.1 The transport stack (where mojibake is born)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│  Agent's reasoning context                                                 │
│    • String is conceptually Unicode (em-dash = U+2014)                     │
└──────────────────────┬─────────────────────────────────────────────────────┘
                       │  (agent serializes string into a shell command)
                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Stage 1: VS Code terminal IPC                                             │
│    • Tool-platform passes bytes to the spawned terminal process            │
│    • Generally UTF-8-safe in 2026; rarely the corruption point             │
└──────────────────────┬─────────────────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Stage 2: PowerShell parser                                                │
│    • Reads command-line bytes via [Console]::InputEncoding                 │
│      (default in PS 5.1: ANSI code page — Windows-1252 in most en-US       │
│       installs; CP932 / CP936 / CP949 in JP / CN / KR installs)            │
│    • If bytes were UTF-8, em-dash (E2 80 94) is interpreted as three       │
│      separate Win-1252 chars: â (E2) € (80) " (94) → first corruption      │
└──────────────────────┬─────────────────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Stage 3: Internal PS string (UTF-16)                                      │
│    • At this point the string lives in .NET as UTF-16; if it survived      │
│      Stage 2 cleanly it's fine — IF the next destination is .NET-managed   │
└──────────────────────┬─────────────────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Stage 4: Native-process boundary                                          │
│    • Crossing into `git.exe`, `python.exe`, `gh.exe`, etc.                 │
│    • Command-line arguments → re-encoded via [Console]::OutputEncoding     │
│      (default in PS 5.1: console OEM code page — CP437 / CP850 / CP932)    │
│    • Process stdin via `|` → re-encoded via $OutputEncoding                │
│      (default in PS 5.1: US-ASCII — everything non-ASCII becomes `?`)      │
│    • Either re-encoding is a second corruption opportunity                 │
└──────────────────────┬─────────────────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Stage 5: Destination tool                                                 │
│    • Tool reads bytes as UTF-8 (most modern tools' default)                │
│    • If Stage 2 or Stage 4 corrupted the bytes, the tool consumes the      │
│      corruption verbatim — no warning, no error, just persisted mojibake   │
└────────────────────────────────────────────────────────────────────────────┘

PARALLEL HAZARD: Editor-save round-trip
┌────────────────────────────────────────────────────────────────────────────┐
│  • Existing file on disk: BOM-less UTF-8, em-dash = E2 80 94               │
│  • Editor opens it WITHOUT auto-detecting UTF-8 → interprets as Win-1252   │
│  • In-memory string: â (E2) € (80) " (94) — already corrupted              │
│  • Editor saves as UTF-8 → writes C3 A2 E2 82 AC E2 80 9D                  │
│    (six bytes — the double-encoded mojibake the AGENTS.md incident left    │
│     all over the file: `├óΓé¼ΓÇ¥`)                                          │
└────────────────────────────────────────────────────────────────────────────┘
```

##### 2.6.2 The eight forbidden invocations

In Windows PowerShell 5.1, every command below silently corrupts non-ASCII bytes
somewhere in the stack. The agent MUST NOT issue any of them with non-ASCII content:

| Forbidden | Where it breaks | Why |
|---|---|---|
| `git commit -m "feat: add §1.0"` | Stage 4 (cmd-line via `OutputEncoding`) | `§` re-encoded via console OEM code page → garbage in commit object |
| `"my message —" \| git commit -F -` | Stage 4 (stdin via `$OutputEncoding`) | `$OutputEncoding` defaults to ASCII; em-dash becomes `?` |
| `@"<here-string with — and §>"@ \| Out-File msg.txt` | Stage 2 (here-string parsing) + Stage 4 (Out-File default ASCII in PS 5.1) | Double hit; here-string content + file write both lose non-ASCII |
| `python -c "print('—')"` | Stage 4 (cmd-line) | Em-dash becomes `?` before Python ever sees it |
| `Invoke-RestMethod -Body '{"text":"—"}'` | Stage 4 (HTTP body encoding) | Body sent as Win-1252-encoded JSON; server rejects |
| `echo "—" > file.txt` | Stage 4 (`>` redirection in PS 5.1) | Redirection re-encodes via `$OutputEncoding` (ASCII default) |
| `gh issue create -b "Fixes —"` | Stage 4 (cmd-line) | Em-dash mangled before reaching GitHub API |
| Saving any file with em-dashes through `Set-Content $p $text` (no `-Encoding`) | Stage 4 (file write) | Defaults to ASCII in PS 5.1; em-dash → `?` |

##### 2.6.3 The defence stack (five layers, deepest first)

The agent MUST apply the deepest layer it has access to; each subsequent layer adds
robustness against situations the deeper one cannot reach.

**Layer 1 — Use the editor's edit tools, not the shell, for any non-ASCII edit.**
`replace_string_in_file` / `multi_replace_string_in_file` / `create_file` /
`edit_notebook_file` operate on the editor's UTF-16 in-memory model and persist as
UTF-8 (no BOM) without ever touching the PowerShell transport layers above. This
costs the agent nothing and is the **first choice** for every non-ASCII-containing
file edit. The shell is a fallback for multi-file bulk transforms only.

**Layer 2 — File-mediated authoring.** When the agent MUST cross into a shell
(because the destination tool reads from a file), author the file via `create_file`
(byte-safe UTF-8 no BOM) and invoke the tool with `-F <path>` / `--file <path>` /
`-i <path>`. Examples:

```powershell
# CORRECT: agent writes commit message file via create_file, then:
git commit -F .git\COMMIT_MSG_<n>

# CORRECT: agent writes JSON body via create_file, then:
Invoke-RestMethod -Uri $u -Method Post -InFile .\body.json -ContentType 'application/json; charset=utf-8'

# CORRECT: agent writes Python script via create_file, then:
python .\insert_agents_row.py
```

This is the pattern used throughout this session for commit messages and AGENTS.md
row insertion — it sidesteps Stages 2 and 4 of §2.6.1 entirely. It is the **default**
for every non-trivial non-ASCII payload the agent ever needs a shell to consume.

**Layer 3 — Per-session preamble (when the agent must inline non-ASCII).** Before
issuing any command that passes non-ASCII through the shell, the agent SHOULD
preface the session with:

```powershell
# Force the console code pages to UTF-8 (Stage 2 + Stage 4 cmd-line route).
chcp 65001 | Out-Null
[Console]::InputEncoding  = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

# Force native-process pipe stdin to UTF-8 (Stage 4 pipe route).
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

# Python-specific belt-and-braces (forces sys.stdin / sys.stdout to UTF-8 across
# every invocation in this session, regardless of the user's PYTHONIOENCODING).
$env:PYTHONUTF8 = '1'
```

After this preamble, the cmd-line and pipe routes are UTF-8-clean for the rest of
the session — but the agent MUST still run the verification scan in §2.6.5 before
considering any edit complete; the preamble does not undo damage that has already
been baked into a file.

**Layer 4 — `pwsh` (PowerShell 7+) instead of `powershell` (5.1).** `pwsh` defaults
`$OutputEncoding`, `[Console]::OutputEncoding`, and `[Console]::InputEncoding` to
BOM-less UTF-8 out of the box, eliminating Stages 2 and 4 of the §2.6.1 stack as a
silent-corruption source. When the agent has a choice between `powershell` and
`pwsh`, **choose `pwsh`**. This rule is already mandated for script invocation
discipline in §2.5; §2.6 extends the rationale: `pwsh` is not just a stylistic
preference, it is a *defence-in-depth measure* against the corruption stack.

**Layer 5 — Permanent user-profile hardening (one-time fix).** The agent SHOULD
recommend (and, with user authorization, apply) the following to the user's
PowerShell `$PROFILE` so that every future session starts pre-hardened:

```powershell
# In $PROFILE (Microsoft.PowerShell_profile.ps1 for both Windows PowerShell 5.1 and pwsh):
chcp 65001 | Out-Null
[Console]::InputEncoding  = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding           = [System.Text.UTF8Encoding]::new($false)
$env:PYTHONUTF8           = '1'

# Optional but recommended: tell .NET to use UTF-8 as the default file encoding
# for `Out-File`, `Set-Content`, `Add-Content` in PowerShell 5.1 sessions.
$PSDefaultParameterValues['Out-File:Encoding']    = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'utf8'
# NOTE: in PS 5.1 'utf8' = UTF-8 *with* BOM; pair this with the .NET API from §2.4
# whenever BOM-less output is required (most Linux toolchains, shell scripts, .md
# under markdown lint).
```

Additionally, the **VS Code workspace settings** for any repo that hosts files
with non-ASCII content SHOULD include:

```jsonc
{
  "files.encoding":            "utf8",
  "files.autoGuessEncoding":   false,
  "files.eol":                 "\n"
}
```

Without `"files.autoGuessEncoding": false`, VS Code is free to mis-detect a
BOM-less UTF-8 file as Win-1252 on open — which produces the editor-save
round-trip corruption diagrammed at the end of §2.6.1 (the AGENTS.md incident).

##### 2.6.4 The single decision rule

> **If the payload contains ANY byte ≥ 0x80, the agent MUST NOT pass it on a
> PowerShell command line or via a PowerShell pipe.** Author it via `create_file`
> to a UTF-8 (no BOM) file, then invoke the destination tool with its
> `-F` / `--file` / `-i` flag.

This rule has zero exceptions in the working flow. It costs one extra
`create_file` tool call (the file is typically deleted or git-ignored after) and
eliminates the entire Stage 2 / Stage 4 corruption surface for that operation. The
session's mojibake-free commit messages from `git commit -F .git\COMMIT_MSG_N`
prove the pattern works; the *one* place where it was bypassed (an early commit
authored via PowerShell here-string) is the *one* commit with `\"` artifacts in
its body.

##### 2.6.5 Mandatory post-action verification

After any shell-mediated action that involved non-ASCII content (whether the
content was passed inline or via file), the agent MUST run the mojibake scan from
§2.4 against every touched file before claiming success:

```powershell
# Distinctive double-encode markers. The Greek capital Gamma (Γ, U+0393) and the
# `Ã`/`â€` Latin-1-as-UTF-8 sequences are the high-signal indicators; on their own
# they are vanishingly rare in legitimate prose, so a hit is almost certainly
# mojibake. (Do NOT include box-drawing chars like `├` U+251C or `│` U+2502 in this
# pattern — they appear in legitimate ASCII-art diagrams such as the one in
# §2.6.1 above and would false-positive.)
Select-String -Path '<touched-files>' -Pattern 'Ã|â€|Â§|ï¿½|Γé|ΓÇ|├ó' -List
# Expected: no output. Any hit MUST be repaired via the §2.4 recipe (with BOM-
# strip guard) BEFORE the staged change is committed.
```

The triplet `Γé`, `ΓÇ`, `├ó` is what the AGENTS.md incident in this session left
behind — Win-1252 → UTF-8 → Win-1252 → UTF-8 double-encoding of an em-dash
(`E2 80 94` → `C3 A2 E2 82 AC E2 80 9D` → mojibake bytes the PS 5.1 console renders
as `├óΓé¼ΓÇ¥`). The original §2.4 pattern (`Ã|â€|Â|ï¿½`) only catches the
*single*-encode case, so §2.6 adds the double-encode markers as a strict superset.

When a destructive edit (rather than an additive one) has already polluted a
tracked file, the *fastest* repair — assuming the previous committed version is
clean — is **`git checkout HEAD -- <file>`** rather than the .NET round-trip
recipe in §2.4. The session's AGENTS.md recovery used exactly this:
`git checkout HEAD -- AGENTS.md` restored 60+ rows in a single command, then a
byte-safe Python script re-added the single new row without re-introducing the
corruption.

##### 2.6.6 Cross-shell parity

Every layer above generalises:

- **`cmd.exe`**: prefix interactive sessions with `chcp 65001`; for batch files
  add `@chcp 65001 > nul` as the first line. Never pass non-ASCII as a literal
  argument; use `-F file` everywhere.
- **Git Bash on Windows (MINGW)**: usually UTF-8-clean by default, but
  `LANG=C` / `LC_ALL=C` legacy fixtures can re-introduce the hazard; set
  `LANG=en_US.UTF-8` (or any UTF-8 locale) in `~/.bashrc`.
- **Unix shells with `LANG=C` or `LANG=POSIX`**: identical hazard. Set a UTF-8
  locale (`LANG=en_US.UTF-8`, `LANG=C.UTF-8`) or pass payloads via file.
- **VS Code task `command` field**: the same as the underlying shell; if the
  task runs PowerShell 5.1, all of §2.6.1–§2.6.5 apply. Prefer
  `"type": "shell"` with `"shell": { "executable": "pwsh.exe" }` when the host
  has `pwsh` installed.

***

### 3. Integration & Observability

The shell execution rules are not isolated; they are a key part of a larger, integrated system.

- **User-Provided Input**: The agent must be vigilant about commands that could potentially modify the user's system

    outside of a designated project directory or system temporary directory. The agent should remind the user to
    consider sandboxing in these cases.

- **Auditing and Observability**: Every command executed and its corresponding output must be logged for auditing and

    debugging. This aligns with the "Observability" principles from the `ci-cd-rules.md`, which mandates structured
    logging and centralized metrics.
