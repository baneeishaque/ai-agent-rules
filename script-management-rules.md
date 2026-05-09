---
title: Script Management Rules
description: Script standards, folder usage, and safeguards for helper scripts.
category: Tooling & Workflows
---


# Scripts: Management, Standards, and Execution (with Write-Message Safeguard)

When "script" is mentioned, default to PowerShell (.ps1) scripts unless explicitly stated otherwise (e.g., "bash
script", "python script").
All scripts (PowerShell, Bash, Python, etc.) must be saved to their respective scripts folder
(e.g., `PowerShell-Scripts`,`Bash-Scripts`,`Python-Scripts`) unless explicitly stated otherwise.
The script folder name must be checked on disk and used accordingly.
Scripts must be compatible with their respective platforms (e.g., Windows PowerShell 5.1+ and PowerShell Core 7+ for
PowerShell).
Execute PowerShell scripts using `pwsh-preview`as the preferred executable, with`pwsh` as fallback if
`pwsh-preview` is not available. This applies to all script execution contexts including direct terminal commands,
shell configuration files (zsh/bash), and automated workflows.
Always include proper documentation headers with .SYNOPSIS, .DESCRIPTION, .PARAMETER, and .EXAMPLE sections.

## Common Utilities Instruction

All scripts must dot-source `Common-Utils.ps1` and use its reusable functions for output, file handling, and other
common operations, unless explicitly stated otherwise. Any reusable functions required by multiple scripts must be
implemented in `Common-Utils.ps1` to ensure DRY principles and maintainability.

### Canonical Location

`Common-Utils.ps1` lives in the [`powershell-scripts`](./powershell-scripts/Common-Utils.ps1) Git submodule of
`ai-agent-rules` (upstream: <https://github.com/baneeishaque/powershell-scripts>). The submodule itself contains
nested submodules, so initialization MUST always be recursive:

```bash
git -C ai-agent-rules submodule update --init --recursive powershell-scripts
```

When cloning the parent repository for the first time, use the recursive form to materialize every level of the
submodule tree in one step:

```bash
git clone --recurse-submodules <parent-repo-url>
# or, on an already-cloned repo:
git submodule update --init --recursive
```

Scripts MUST resolve the dot-source path **relative to their own location** (anchored on
`Split-Path -Parent $MyInvocation.MyCommand.Path`) rather than relative to the caller's `cwd`, so the lookup remains
portable across filesystems and platforms. Example for a script residing 4 levels deep below the repo root
(e.g., `<repo>/.agents/skills/<skill>/scripts/foo.ps1`):

```powershell
$ScriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Path
$CommonUtilsPath = Join-Path -Path $ScriptDir -ChildPath '..\..\..\..\ai-agent-rules\powershell-scripts\Common-Utils.ps1'
. $CommonUtilsPath
```

## Write-Message Safeguard

When generating scripts, always ensure that no empty string is passed to Write-Message (or any similar output/logging
function).

- Add logic to check if the message is empty or null before calling Write-Message.

- If the message is empty, skip the call or provide a default message.

- Example:

    ```powershell
    if (![string]::IsNullOrWhiteSpace($Message)) {
      Write-Message $Message
    }
    ```bash

## Key Behaviors

- "script" = PowerShell (.ps1) by default

- Repository: [`ai-agent-rules/powershell-scripts/`](./powershell-scripts/) (Git submodule)

- Execution priority: pwsh-preview → pwsh (fallback)

- Cross-platform compatibility required

- Comprehensive documentation mandatory

- Safeguard against empty messages in output/logging functions

- Always use the correct scripts folder for each language, unless explicitly overridden

## Usage Examples

- "Create a script" → PowerShell script created in [`powershell-scripts/`](./powershell-scripts/) folder

- "Run script from zsh" → pwsh-preview -File script.ps1
- "Create bash script" → Bash script created in `Bash-Scripts` folder (explicit override)

- "Write-Message" calls always checked for empty strings
