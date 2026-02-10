<!--
title: Bash Scripting Standards
description: Industrial standards for bash script development,
    including dependency management patterns,
    alphabetical organization conventions, and idempotent function design.
category: Shell-Scripting
-->

# Bash Scripting Standards

This document defines the industrial standards for bash script development, focusing on dependency management,
code organization, and defensive programming patterns. These rules ensure scripts are maintainable, robust, and
follow industry best practices.

***

## 1. Dependency Management: Unconditional Require Pattern

### 1.1 Core Principle

**Every function MUST unconditionally call `require_*` for its dependencies at the start of the function body. Calling them multiple times is safe and has negligible overhead (standard `command -v` check cost is < 1ms).

### 1.2 Fail-Fast & Pre-flight Validation

Before performing expensive side-effects (e.g., `curl`, `sudo`, disk I/O), scripts MUST validate the environment to ensure a successful outcome. This prevents "half-broken" system states.

- **Platform Validation**: Use `validate_platform_support` as the first step in any installer to ensure the OS/distro is compatible.
- **Dependency Pre-flight**: Call all necessary `require_*` commands before starting network or filesystem operations.

### 1.3 Implementation Pattern

```bash
# ✅ CORRECT: Fail-fast and Unconditional require
install_tool() {
    # 1. Validate Platform Support FIRST (Fail-Fast)
    validate_platform_support "$TOOL_NAME"

    # 2. Ensure dependencies before expensive ops
    require_curl
    require_sudo

    # 3. Perform expensive side-effects ONLY after validation
    curl -fsSL "$URL" | sudo dd of="$DEST"
    
    # 4. Final installation
    aptInstall "$TOOL_NAME" "true"
}

validate_platform_support() {
    require_echo  # Unconditional require
    local tool="$1"
    
    if is_macos; then
        todo_msg "Install $tool on macOS"
    elif is_linux && ! is_apt_based; then
        todo_msg "Install $tool on non-apt Linux"
    fi
}
```

### 1.4 Rationale

1. **Idempotency**: `require_*` functions are already idempotent—they check `is_installed` first and only run
   the installer if needed. Calling them multiple times is safe and has negligible overhead.

2. **Defensive Programming**: Each function guarantees its own dependencies, making it self-contained and robust.

3. **No Coupling**: Functions don't depend on the caller's setup state, reducing cognitive overhead and bugs.

4. **Self-Documenting**: Clear declaration of what dependencies each function needs.

5. **Performance**: `command -v` is a shell builtin that checks the command hash table—it's instant.

### 1.4 Anti-Patterns to Avoid

```bash
# ❌ WRONG: Conditional require based on caller state
validate_platform_support() {
    local tool="$1"
    local deps_checked="${2:-false}"  # DON'T DO THIS
    
    if [[ "$deps_checked" != "true" ]]; then
        require_echo
    fi
    # ...
}

# ❌ WRONG: Assuming caller has already called require_echo
validate_platform_support() {
    local tool="$1"
    # Missing require_echo - assumes caller did it
    echo "Installing $tool"  # FRAGILE
}

# ❌ WRONG: Manual flag tracking
if [[ "${_ECHO_VERIFIED:-}" != "1" ]]; then
    require_echo
    export _ECHO_VERIFIED=1
fi
```

### 1.5 Mandatory Protocol

- **The agent MUST** add `require_echo` (or equivalent) at the start of every function that uses `echo`.
- **The agent MUST** add `require_*` calls for all external tools used within a function.
- **The agent MUST NOT** use conditional logic or flags to skip `require_*` calls.
- **The agent MUST NOT** assume dependencies are already satisfied by the caller.

***

## 2. Alphabetical Organization

### 2.1 Constants: TOOL_* and SCRIPT_*

**All constant declarations MUST be sorted alphabetically by variable name.**

#### 2.1.1 TOOL_* Constants

```bash
# ✅ CORRECT: Alphabetically sorted
TOOL_ANSIBLE="ansible"
TOOL_APT="apt"
TOOL_APT_GET="apt-get"
TOOL_AT="at"
TOOL_AWK="awk"
TOOL_AWS="aws"
TOOL_AZ="az"
# ... continues alphabetically ...
TOOL_YARN="yarn"
TOOL_ZIP="zip"
```

**Rules:**
- Sort by the portion after `TOOL_` (e.g., `TOOL_APT` before `TOOL_APT_GET`)
- Consolidate all `TOOL_*` constants into a single block
- No duplicate sections scattered throughout the file

#### 2.1.2 SCRIPT_* Constants

```bash
# ✅ CORRECT: Alphabetically sorted
SCRIPT_APT_INSTALL_HELPER="aptInstallHelper.bash"
SCRIPT_INSTALL_GH="installGitHubCli.bash"
SCRIPT_INSTALL_TREE="installTree.bash"
SCRIPT_UPDATE_PACKAGE_INDEX="updatePackageIndex.bash"
```

### 2.2 Functions: require_* and is_*_based()

**All function definitions MUST be sorted alphabetically by function name.**

#### 2.2.1 require_* Functions

```bash
# ✅ CORRECT: Alphabetically sorted
require_ansible() { require_tool_with_installer "$TOOL_ANSIBLE"; }
require_apt() { require_tool_with_installer "$TOOL_APT"; }
require_apt_get() { require_tool_with_installer "$TOOL_APT_GET"; }
require_at() { require_tool_with_installer "$TOOL_AT"; }
# ... continues alphabetically ...
require_yarn() { require_tool_with_installer "$TOOL_YARN"; }
require_zip() { require_tool_with_installer "$TOOL_ZIP"; }
```

**Multi-line functions** maintain their complete bodies:

```bash
require_arch_pacman() {

    require_tool_with_installer "$TOOL_PACMAN" "" "true" 'is_linux && command -v pacman >/dev/null 2>&1'
}

require_gh() {

    require_dirname
    require_tool_with_installer "$TOOL_GH" "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$SCRIPT_INSTALL_GH";
}
```

#### 2.2.2 is_*_based() Helper Functions

```bash
# ✅ CORRECT: Alphabetically sorted
is_apt_based() { is_linux && command -v apt >/dev/null 2>&1; }
is_arch_pacman_based() { is_linux && command -v pacman >/dev/null 2>&1; }
is_dnf_based() { is_linux && command -v dnf >/dev/null 2>&1; }
is_guix_based() { command -v guix >/dev/null 2>&1; }
is_nix_based() { command -v nix-env >/dev/null 2>&1; }
is_yum_based() { is_linux && command -v yum >/dev/null 2>&1; }
is_zypper_based() { is_linux && command -v zypper >/dev/null 2>&1; }
```

### 2.3 Rationale

1. **Maintainability**: Easy to locate specific constants or functions
2. **Merge Conflict Reduction**: Alphabetical order minimizes git conflicts
3. **Consistency**: Predictable organization across all bash scripts
4. **Code Review**: Easier to spot missing or duplicate entries

### 2.4 Mandatory Protocol

- **The agent MUST** sort all `TOOL_*` constants alphabetically when creating or modifying them.
- **The agent MUST** sort all `SCRIPT_*` constants alphabetically when creating or modifying them.
- **The agent MUST** sort all `require_*` functions alphabetically when creating or modifying them.
- **The agent MUST** sort all `is_*_based()` functions alphabetically when creating or modifying them.
- **The agent MUST** consolidate scattered constant definitions into single alphabetically-sorted blocks.

***

## 3. Idempotent Function Design

### 3.1 Core Pattern

**All `require_*` functions MUST be idempotent—safe to call multiple times without side effects.**

```bash
# ✅ CORRECT: Idempotent design
require_tool_with_installer() {
    local tool="$1"
    local installer="${2:-}"
    local is_subshell="${3:-true}"
    local custom_check="${4:-}"

    # Check first - idempotency guarantee
    if ! is_installed "$tool" "$custom_check"; then
        # Only install if not already present
        # ... installation logic ...
    fi
}
```

### 3.2 Benefits

1. **No Redundancy Tracking**: No need for global state or flags
2. **Composability**: Functions can call each other freely
3. **Robustness**: Detects if a tool becomes unavailable mid-script
4. **Simplicity**: Clear, linear logic flow

### 3.3 Mandatory Protocol

- **The agent MUST** implement all `require_*` functions with `is_installed` checks first.
- **The agent MUST NOT** use global state variables to track whether a tool has been verified.
- **The agent MUST** ensure `require_*` functions can be called multiple times safely.

***

## 4. Verification Standards

### 4.1 Syntax Validation

**All bash scripts MUST pass syntax validation before commit:**

```bash
bash -n /path/to/script.bash
```

### 4.2 Alphabetical Order Verification

**Verify constants and functions are alphabetically sorted:**

```bash
# Check TOOL_* constants
grep '^TOOL_' utils.bash | sort -c

# Check SCRIPT_* constants
grep '^SCRIPT_' utils.bash | sort -c

# Check require_* functions
grep '^require_.*()' utils.bash | sort -c

# Check is_*_based() functions
grep '^is_.*_based()' utils.bash | sort -c
```

### 4.3 Mandatory Protocol

- **The agent MUST** run `bash -n` syntax validation after any script modifications.
- **The agent MUST** verify alphabetical ordering after sorting operations.
- **The agent MUST** confirm all constants and functions are present after refactoring.

***

## 5. Script Execution Standards

### 5.1 Subshell Execution (`bash script.sh`)

**Standard for calling internal helper scripts within a project.**

- **Robustness**: Guarantees the Bash interpreter is used regardless of the caller's shell.
- **Safety**: Avoids dependency on the "executable bit" (`chmod +x`), preventing failures in CI/CD or restricted environments.
- **Isolation**: Runs in a new process, preventing variable or state leakage into the parent script.

```bash
# ✅ CORRECT: Explicit bash call for helper
bash "$SCRIPT_DIR/$SCRIPT_UPDATE_PACKAGE_INDEX"
```

### 5.2 Library Sourcing (`source` or `.`)

**Standard for loading functions, variables, or shared utilities.**

- **Scope**: Use ONLY for files that define logic without performing immediate actions.
- **Naming**: Shared libraries should typically be named `utils.bash` or have a `.bash` extension.

```bash
# ✅ CORRECT: Sourcing a function library
source "$SCRIPT_DIR/utils.bash"
```

### 5.3 Direct Execution (`./script.sh`)

**Standard for standalone tools intended for manual CLI use.**

- **Requirement**: MUST include a proper Shebang (`#!/bin/bash`) and have `chmod +x` applied.
- **UX**: Provides a native-feeling command experience for the user.

### 5.4 Prohibition: `eval` for Execution

**The agent is STRICTLY FORBIDDEN from using `eval` to execute script files.**

- **Security**: `eval` is a primary vector for shell injection if path variables are ever compromised.
- **Robustness**: Harder to debug and prone to quoting/expansion errors.

```bash
# ❌ WRONG: Dangerous and unnecessary
eval "$SCRIPT_PATH"
```

***

## 6. Code Organization Hierarchy

### 6.1 File Structure

Bash utility files MUST follow this structure:

```bash
#!/bin/bash

# 1. TOOL_* constants (alphabetically sorted)
TOOL_ANSIBLE="ansible"
TOOL_APT="apt"
# ...

# 2. SCRIPT_* constants (alphabetically sorted)
SCRIPT_APT_INSTALL_HELPER="aptInstallHelper.bash"
SCRIPT_INSTALL_GH="installGitHubCli.bash"
# ...

# 3. Core utility functions
ensure_timeout_cmd() { ... }
run_with_timeout() { ... }
press_enter_to_continue() { ... }
is_installed() { ... }
require_tool_with_installer() { ... }

# 4. require_* functions (alphabetically sorted)
require_ansible() { ... }
require_apt() { ... }
# ...

# 5. OS detection functions
is_linux() { ... }
is_macos() { ... }
is_windows() { ... }

# 6. Package manager detection functions (alphabetically sorted)
is_apt_based() { ... }
is_arch_pacman_based() { ... }
# ...

# 7. Helper functions
todo_msg() { ... }
```

### 6.2 Mandatory Protocol

- **The agent MUST** organize bash utility files following the hierarchy above.
- **The agent MUST** keep related functions grouped together.
- **The agent MUST** maintain alphabetical order within each group.

***

## 7. Redundancy Policy: Safety over Optimization

Redundant calls to `require_*` or `validate_platform_support` are **permitted and encouraged** if they enforce function independence.

1. **Safety over Speed**: A 1ms check is better than a fragile dependency on a caller's state. 
2. **Implicit Documentation**: Seeing `require_sudo` inside a function immediately tells the reader that the function needs elevated privileges.

***

## 8. Related Conversations & Traceability

This rule was established and refined based on:

- **Bash Execution Standards Establishment**: [2026-02-09-bash-execution-standards-establishment.md](./docs/conversations/2026-02-09-bash-execution-standards-establishment.md)
    - **Context**: `bash` vs `eval` vs `source` industry standards.
    - **Decision**: Subshell isolation for utilities, prohibition of `eval`.

- **Bash Script Optimization**: [2026-02-09-bash-script-optimization.md](./docs/conversations/2026-02-09-bash-script-optimization.md)
    - **Context**: Fail-fast platform validation and optimized package updates.
    - **Decision**: Established `validate_platform_support` as the industry standard gatekeeper.

- **Bash Scripting Standards Establishment**: [2026-02-09-bash-scripting-standards-establishment.md](./docs/conversations/2026-02-09-bash-scripting-standards-establishment.md)
    - **Context**: Alphabetical sorting and dependency management.
    - **Decision**: Unconditional require pattern.

***
