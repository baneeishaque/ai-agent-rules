---
title: Homebrew Management Rules
description: Comprehensive SSOT for Homebrew operations,
    including installation preferences, keg-only handling, and
    exclusion-based upgrade workflows.
category: Package Management
---


# Homebrew Management Rules

This document serves as the Single Source of Truth (SSOT) for all Homebrew operations. It ensures consistent,
high-fidelity package management with a focus on reliability and visibility.

***

## 1. Global Preferences & Performance

Before running any `brew` command, the agent MUST ensure maximum visibility and reliability:

- **Sequential Downloads**: To maintain stability on limited bandwidth, always ensure
    `HOMEBREW_DOWNLOAD_CONCURRENCY=1` is set for any download operation.
    - For a single command, prefix it: `HOMEBREW_DOWNLOAD_CONCURRENCY=1 brew install ...`
    - For a chained sequence, export it at the start:
      `export HOMEBREW_DOWNLOAD_CONCURRENCY=1; brew upgrade ... && brew cleanup ...`

- **Verbose Logging**: Every `brew` command MUST include the `--verbose` flag.

- **Example of Chained Command**:

    ```bash
    export HOMEBREW_DOWNLOAD_CONCURRENCY=1; brew upgrade --verbose package1 && brew cleanup --verbose package1
    ```

***

## 2. Installation & Keg-Only Protocol

When installing new formulas, the agent MUST handle path configurations for non-linked (keg-only) formulas
automatically.

- **Auto-Detection**: Run `brew info <package>` immediately after installation.

- **Path Injection**: If the output contains a "keg-only" warning, guide the user to add the package-specific PATH to

    `~/.zshenv`.

- **Minimalist Configuration**: Only add the `PATH`export. Do NOT add`LDFLAGS`,`CPPFLAGS`, or`PKG_CONFIG_PATH`

    unless explicitly required for a compilation task.

### 2.1 Common Keg-Only Examples

- `curl`,`openssl`,`sqlite`,`icu4c`.

***

## 3. Sequential Upgrade and Cleanup Workflow

To ensure stability and provide clear, granular control, package upgrades MUST be performed sequentially as part of
a single, chained command presented to the user.

1. **Outdated Analysis**: Run `brew outdated --greedy` to identify all pending formula and cask updates.

2. **Identify Targets & Exclusions**: Determine the final list of packages to upgrade based on user input
    (e.g., exclusions, specific targets).

3. **Resolve Package Types**: For each target package, determine if it is a **formula** or a **cask**.
    This is critical for preventing ambiguity.
    - Check `brew list --cask` and `brew list --formula` for installed packages.
    - Use `brew info <package>` for uninstalled packages to determine type.
    - Construct commands using the explicit type, e.g., `brew upgrade --cask visual-studio-code-insiders`.

4. **Construct Command Sequence**: For each package (respecting **Default Upgrade Priority** and user-specified order),
    generate an upgrade command followed by a cleanup command, chained with `&&`.
    - `brew upgrade --verbose [--cask|--formula] <package> && brew cleanup --verbose <package>`

5. **Handle Mixed Operations**: For requests involving other operations like `fetch`, chain them appropriately
    within the sequence.

6. **Assemble Final Command**: Combine all operations into a single one-line command.
    - **Prefix with `export`**: Start the entire command line with `export HOMEBREW_DOWNLOAD_CONCURRENCY=1;` to
      ensure the download setting applies to all subsequent operations in the chain.
    - **Add Final Cleanup**: Append a final, comprehensive cleanup to the very end of the chain:
      `&& brew cleanup --prune=all --verbose`.

7. **Present to User**: The agent's final action MUST be to output the complete command as a single line of text within a markdown code block. The agent MUST NOT execute the command itself. This allows the user to review, copy, and run the command manually.

- **Example of Final Command Construction**:

    ```bash
    # User: upgrade all, but exclude antigravity and whatsapp. Prioritize google-chrome and onedrive. Just download gemini-cli.
    # Agent, applying priority and sequential rules, constructs a single command:
    export HOMEBREW_DOWNLOAD_CONCURRENCY=1; brew upgrade --verbose --cask google-chrome && brew cleanup --verbose google-chrome && brew upgrade --verbose --cask onedrive && brew cleanup --verbose onedrive && brew upgrade --verbose <other_package_1> && brew cleanup --verbose <other_package_1> && brew fetch --verbose gemini-cli && brew cleanup --prune=all --verbose
    ```

### 3.1. Prioritized & Mixed-Operation Upgrades

The workflow in Section 3 integrates the principles for handling complex scenarios. When constructing the final
command, remember:

- **Priorities First**: Place user-specified or default priority packages at the beginning of the command chain.
- **Chain with `&&`**: Ensure all individual operations are chained with `&&` to create a single, sequential flow that
  stops if a command fails.
- **`fetch` for Downloads**: Use `brew fetch <package>` for download-only requests within the chain.
- **Assemble the One-Line Command**: The ultimate goal is a single, executable line that performs all requested
  operations in the correct order.

***

## 4. Default Upgrade Priority

A default package upgrade priority is established to ensure a consistent and predictable upgrade process. The agent
MUST adhere to this priority unless explicitly overridden by the user.

- **Default Priority Order**:
   1. `google-chrome`
   1. `onedrive`
   1. `visual-studio-code`(or its variants like`visual-studio-code-insiders`)
   1. `gemini-cli`

- **Handling User Overrides**: If the user specifies a different priority for one or more packages in their request

    (e.g., "upgrade firefox first"), the user-specified priority MUST be honored first. The agent will then apply the
    default priority order to the remaining packages being upgraded.
