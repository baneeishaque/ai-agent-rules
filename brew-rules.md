<!--
title: Homebrew Management Rules
description: Comprehensive SSOT for Homebrew operations, including installation preferences, keg-only handling, and exclusion-based upgrade workflows.
category: Package Management
-->

# Homebrew Management Rules

This document serves as the Single Source of Truth (SSOT) for all Homebrew operations. It ensures consistent, high-fidelity package management with a focus on reliability and visibility.

***

## 1. Global Preferences & Performance

Before running any `brew` command, the agent MUST ensure maximum visibility and reliability:

- **Sequential Downloads**: To maintain stability on limited bandwidth, always prefix commands with `HOMEBREW_DOWNLOAD_CONCURRENCY=1` if not already set in the environment.
- **Verbose Logging**: Every command MUST include the `--verbose` flag.
- **Example**:

  ```bash
  HOMEBREW_DOWNLOAD_CONCURRENCY=1 brew install --verbose <package>
  ```

***

## 2. Installation & Keg-Only Protocol

When installing new formulas, the agent MUST handle path configurations for non-linked (keg-only) formulas automatically.

- **Auto-Detection**: Run `brew info <package>` immediately after installation.
- **Path Injection**: If the output contains a "keg-only" warning, guide the user to add the package-specific PATH to `~/.zshenv`.
- **Minimalist Configuration**: Only add the `PATH` export. Do NOT add `LDFLAGS`, `CPPFLAGS`, or `PKG_CONFIG_PATH` unless explicitly required for a compilation task.

### 2.1 Common Keg-Only Examples

- `curl`, `openssl`, `sqlite`, `icu4c`.

***

## 3. Sequential Upgrade and Cleanup Workflow

To ensure stability and provide clear, granular control, package upgrades MUST be performed sequentially.

1. **Outdated Analysis**: Run `brew outdated --greedy` to identify all pending formula and cask updates.
2. **Identify Targets & Exclusions**: Determine the final list of packages to upgrade based on user input (e.g., exclusions, specific targets).
3. **Resolve Package Types**: For each target package, determine if it is a **formula** or a **cask**. This is critical for preventing ambiguity with names like `onedrive`.
    - Check `brew list --cask` and `brew list --formula` for installed packages.
    - Use `brew info <package>` for uninstalled packages to determine type.
    - Construct commands using the explicit type, e.g., `brew upgrade --cask visual-studio-code-insiders`.
4. **Generate Sequential Commands**: For each package (respecting the **Default Upgrade Priority** and user-specified order), generate the following command sequence:

    ```bash
    # Upgrade a single package and perform immediate cleanup
    HOMEBREW_DOWNLOAD_CONCURRENCY=1 brew upgrade --verbose [--cask|--formula] <package>
    brew cleanup --verbose <package>
    ```

5. **Handle Mixed Operations**: For requests involving other operations like `fetch`, chain them appropriately after the upgrade sequence.
6. **Final Cleanup**: After all other operations are complete, perform a comprehensive cleanup:

    ```bash
    brew cleanup --prune=all --verbose
    ```

7. **Manual Presentation**: Present the full, final sequence of commands to the user in a code block for easy copy-pasting and execution.

- **Example**:

  ```bash
  # User: upgrade all, but exclude antigravity and whatsapp. Prioritize google-chrome and onedrive. Just download gemini-cli.
  # Agent, applying priority and sequential rules, constructs:

  # Upgrade prioritized packages one-by-one
  HOMEBREW_DOWNLOAD_CONCURRENCY=1 brew upgrade --verbose --cask google-chrome
  brew cleanup --verbose google-chrome
  HOMEBREW_DOWNLOAD_CONCURRENCY=1 brew upgrade --verbose --cask onedrive
  brew cleanup --verbose onedrive

  # Upgrade remaining packages...
  HOMEBREW_DOWNLOAD_CONCURRENCY=1 brew upgrade --verbose <other_upgradable_package_1>
  brew cleanup --verbose <other_upgradable_package_1>
  # ...

  # Handle other operations
  brew fetch --verbose gemini-cli
  
  # Perform final system-wide cleanup
  brew cleanup --prune=all --verbose
  ```

### 3.1. Prioritized & Mixed-Operation Upgrades

For complex scenarios involving specific upgrade orders, exclusions, and mixed operations (e.g., upgrade and download), the agent MUST extend the standard workflow:

1. **Identify Priorities**: Note any packages the user wants to upgrade first. These will be listed at the beginning of the `brew upgrade` command.
2. **Separate Operations**: Use `&&` to chain separate Homebrew commands. This is used to combine different actions, such as `upgrade` and `fetch`.
3. **Download-Only Requests**: For requests to "download" but not "install" a package, use the `brew fetch <package>` command. This downloads the package to the local cache without installing or upgrading it.
4. **Combine and Construct**: Assemble the final one-line command based on the priorities, exclusions, and mixed operations.

***

## 4. Default Upgrade Priority

A default package upgrade priority is established to ensure a consistent and predictable upgrade process. The agent MUST adhere to this priority unless explicitly overridden by the user.

- **Default Priority Order**:
  1. `google-chrome`
  2. `onedrive`
  3. `visual-studio-code` (or its variants like `visual-studio-code-insiders`)
  4. `gemini-cli`

- **Handling User Overrides**: If the user specifies a different priority for one or more packages in their request (e.g., "upgrade firefox first"), the user-specified priority MUST be honored first. The agent will then apply the default priority order to the remaining packages being upgraded.
