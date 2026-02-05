<!--
title: Git Atomic Commit Construction
description: Authoritative protocol for analysing, grouping, and arranging changes into logical, independent atomic units before execution.
category: Git & Repository Management
-->

# Git Atomic Commit Construction Rules

This document defines the mandatory protocol for creating "Arranged Commits"—logical, independent, and atomic units of change. This approach ensures high-quality history and minimizes regression risks.

**Prerequisite**: All actions must first adhere to the context and pre-check protocols defined in [git-operation-rules.md](./git-operation-rules.md).

***

## 1. Phase 1: Deep Change Analysis

Before staging any files, the agent MUST perform a dependency analysis of all modifications.

- **Shared Identifiers**: Group changes that modify the same functions, classes, or constants across different files.
- **Cross-File References**: If file A depends on a change in file B (e.g., an import or a link), they MUST be part of the same atomic commit.
- **Untracked File Discovery**: The agent MUST explicitly check for untracked files (`git status`).
  - **Implicit Tracking**: Any untracked file not excluded by `.gitignore` is a candidate for version control to ensure project completeness.
  - **Mandatory Confirmation**: The agent MUST NOT stage or commit untracked files without explicit user confirmation, especially in repositories with minimal or default `.gitignore` files, to avoid accidentally committing private credentials, large binaries, or environment-specific files.
- **Categorical Alignment**: Group changes by their architectural layer (e.g., UI, Logic, Docs) unless they are functionally coupled.
- **Workflow-First Priority**: If changes involve CI/CD workflows (GitHub Actions, scripts), the agent **MUST** fix, test, and verify the workflow functionality *before* arranging or executing commits. Functional stability of the CI pipeline takes precedence over documentation or stylistic refinements.

***

## 2. Phase 2: Logical Grouping (Arrangement)

The agent must "arrange" the detected changes into a proposed sequence of commits.

- **Independence**: Each commit should be able to stand alone. If the repository were checked out at that commit, it should still build/function (or at least be logically coherent).
- **Atomic Principle**: Never commit half of a logical change. If a file contains two unrelated changes, use **Hunk-Based Staging**.
- **The Commit Preview (Mandatory Verbose Display)**:
  - Present the proposed "Arranged Commits" to the user for approval using a structured format that provides **maximum details**.
  - For files with mixed concerns requiring hunk-based staging, the preview **MUST** include the specific **git hunks (diff blocks)** and a file preview for each logical unit.
  - Format:

    ````markdown
    ## Arranged Commits Preview
    
    ### Commit 1: [type](scope): [title]
    - **Files**: [file1.md], [file2.md]
    - **Message**:
      ```
      [type](scope): [title]

      [Body line 1]
      [Body line 2]
      ...
      ```
    - **Hunks/Preview**:
      ```diff
      [Show actual hunks for this commit]
      ```

    ### Commit 2: [type](scope): [title]

    - **Files**: [file3.md]
    - **Message**:
      ```
      [type](scope): [title]
      
      [Body line 1]
      ...
      ```

    ---
    Please say "start" to begin the sequential execution of these atomic commits.

    ````

- **Commit Authorization**: The agent **MUST NOT** proceed with any commit execution until the user explicitly says **"start"**. Other triggers like "commit" or "go" are insufficient; strict authorization ensures the user has reviewed the verbose preview.

***

## 3. Phase 3: Interactive Hunk-Based Staging

When a file contains mixed concerns, the agent MUST use interactive staging tools.

- **Command**: `git add -p <file>`
- **Philosophy (Chunk Committing)**: Also known as "hunk-based staging". This is the mandatory method for ensuring no "unrelated noise" or "piggybacked" style fixes leak into functional commits. Every modified line must be evaluated: "Does this line belong to the *current* atomic goal?"
- **Hunk-by-Hunk Execution**: During interactive staging, the agent MUST evaluate and respond to each hunk individually (`y`, `n`, `s`, etc.). Do not batch responses. This ensures each decision is deliberate and minimizes the risk of staging unrelated changes.
- **Granular Hygiene**: If a grammatical fix is discovered while implementing a feature, it MUST be staged and committed separately (either before or after) unless it is part of the same logical chunk. Continuous use of `git add -p` ensures high-quality, noise-free history.
- **Verification**: Run `git diff --cached` after staging each chunk to guarantee strictly atomic contents.

## 4. Phase 4: Formatting Consolidation & Noise Reduction

To prevent stylistic changes from obscuring functional history, the agent MUST consolidate formatting fixes.

- **Consolidation Rule**: If multiple files require stylistic, indentation, or header-level adjustments, these MUST be clubbed into a single, dedicated "formatting-only" commit.
- **Zero Mixture**: Never mix a formatting-only hunk with a functional hunk in the same commit, even within the same file. Use `git add -p` to isolate them.

## 5. Phase 5: Configuration Coupling

Tool configurations and metadata must be atomically linked to the documentation or code they support.

- **Functional Pairing**: Updates to `.vscode/settings.json` (e.g., cSpell words), `.lintrc`, or other configuration files MUST be staged and committed alongside the functional changes that necessitate them.
- **IDE Project Files**: Shared IDE configuration files (e.g., `.idea/` core XMLs or `.vscode/` shared settings) that establish the project structure, SDKs, or common tooling MUST be tracked and committed to ensure environment parity. Workspace-specific or personal settings (e.g., `workspace.xml`) MUST remain ignored.
- **Example**: If adding a new rule file introduces new technical terms, the cSpell update for those terms MUST be part of the same atomic unit as the rule file addition.

## 6. Phase 6: Submodule Synchronization Protocol

When managing submodules, the main repository's history must remain descriptive and clear.

- **Synchronized Commits**: Every functional update in a submodule requiring a pointer update in the main repo MUST be coupled with its relevant main-repo configuration changes (e.g., CI scripts or IDE settings).
- **Descriptive Titles (Mandatory)**: Main repo sync commits MUST NOT use generic titles like `sync submodule`. They MUST provide a maximum-detail summary of the modular improvements contained within (e.g., `docs: sync rules submodule and update markdown generation standards`).

## 7. Phase 7: Handling Generated Files vs. User Customization

When a file (e.g., `.gitignore`) contains both standard API-generated content (e.g., from gitignore.io) and user-defined custom rules, these MUST be split into separate commits.

- **Commit A (The Foundation)**: Commit **only** the standard, API-generated portion first.
  - **Methodology**: Back up the full file, overwrite with the exact API content (or equivalent standard sections), and commit.
  - **Rationale**: Establishes a clean, reproducible baseline.
- **Commit B (The Customization)**: Commit the user-defined sections (patches/custom rules) in a subsequent commit.
  - **Rationale**: Clearly distinguishes between "standard boilerplate" and "project-specific logic".
- **Handling Modifications**: If the user has altered the API-generated portion, these alterations must also be separated from the raw API import if possible, or documented clearly as user-patches on top of the base.

## 8. Phase 8: Commit Message Quality Standards

- **Specificity Over Genericity**: Avoid generic titles like `os-specific`. Instead, list the specific components: `add linux, macos, and windows gitignore rules`.
- **Anti-Repetition**: The commit body MUST NOT merely rephrase the title.
  - **Bad**: Title: `add vscode gitignore rules`. Body: `Add VisualStudioCode exclusion rules`.
  - **Good**: Title: `add vscode gitignore rules`. Body: `Sourced from gitignore.io to exclude editor artifacts`.
- **Context Enrichment**: Ensure it explains the 'Why' behind the changes, especially for architectural or security-related decisions.
- **Reflecting Atomic Logic**: The commit body MUST explicitly state the rationale for grouping these specific changes together. If multiple files are involved, explain their functional coupling (e.g., "Updates both the API endpoint and the matching UI handler to ensure type safety for the new status field").
- **Constraint Documentation**: Mention any specific constraints or external dependencies that influenced the atomic grouping (e.g., "Includes the shared utility class to satisfy the compile-time dependency in the main logic").
- **Contextual Accuracy**: Ensure terms usage is precise (e.g., "Supabase project-specific" instead of generic "project-specific").
- **Body/Diff Congruence**: The commit message body **MUST** be a complete and accurate human-readable summary of all changes presented in the `Hunks/Preview` section of the commit plan. It is the AI's primary responsibility to make it easy for the user to confirm that the textual description perfectly matches the code modifications. Any discrepancy identified by the user requires an immediate and corrected preview.

***

## 9. Phase 9: Execution & Verification

- **Step-by-Step**: Execute commits one-by-one according to the approved arrangement.
- **History Refinement**: If existing commits need to be split or refined (e.g., to fix non-atomic changes), follow the **[Git History Refinement Rules](./git-history-refinement-rules.md)**.
- **Unstaged Changes During Rebase**: If rebase fails due to unstaged changes, use the stash workflow (see git-operation-rules.md Section 3).
- **Pull Before Push**: Always `git pull` (or `git pull --rebase` upon explicit approval) before pushing to incorporate latest remote changes.
- **Recovery**: If a mistake is made during staging, use `git reset <file>` to unstage, or `git checkout -p` to selectively discard. **WARNING**: Never use `git reset --hard` for synchronization; always prefer `git pull`.

***

- **Opaque Content Analysis**: For files flagged as binary or large assets (LFS), the agent MUST verify the internal consistency of the commit by inspecting the file contents (e.g., via `cat -v` or hex dump) to ensure the commit message accurately reflects the data being stored.

## 10. The Commit Compass (GitKraken Philosophy)

Imagine a compass where each cardinal direction is a logical area of the codebase.

- **North**: Architectural/Schema changes.
- **East**: Logic/Feature implementation.
- **West**: Testing/Verification.
- **South**: Documentation/Refinement.

A high-quality commit history moves clearly through these directions without "spinning" (mixing logic and documentation in one commit).

***

## 11. Source Logic & Generated Files

When working with repositories that use code generation, templates, or CI/CD automation, the agent MUST distinguish between source logic and generated output.

### 11.1 Update the Source, Not the Output

- **Rule**: Never manually edit generated files. Always update the source logic (templates, scripts, CI/CD workflows) that produces them.
- **Examples**:
  - `README.md` generated from `templates/README.md.template` → Edit the template, not `README.md`
  - `agent-rules.md` generated by `scripts/sync-rules.py` → Edit the script or source metadata, not `agent-rules.md`
  - Build artifacts, compiled code, or auto-formatted files → Edit source code or configuration

### 11.2 Identify Synchronization Mechanisms

Before making changes, the agent MUST:

1. **Detect Generation**: Check for comments like `<!-- AUTO-GENERATED -->`, build scripts, or CI/CD workflows that regenerate files
2. **Locate Source**: Identify the template, script, or configuration that produces the generated file
3. **Document Sync**: Note in commit messages if manual synchronization is required (e.g., "Run `npm run build` to regenerate")

### 11.3 CI/CD Managed File Exclusion

Files managed by CI/CD automation MUST be excluded from manual edits during history refinement or atomic commit construction.

- **Exclusion List**: Maintain an explicit list of CI/CD managed files (e.g., `README.md`, `agent-rules.md`)
- **Grep Exclusions**: When verifying link updates, use `--exclude` flags for these files:

  ```bash
  grep -r "old-name.md" . --exclude-dir=.git --exclude=README.md --exclude=agent-rules.md
  ```

- **Commit Verification**: Before committing, run `git diff --cached` and verify no CI/CD managed files are staged unless the commit explicitly targets the source logic that generates them

***

## 12. Phase 12: User-Requested Coupling & Deviations

The agent must strictly follow the atomic protocols defined above. However, if the user explicitly requests to couple unrelated changes or deviate from the rules, the following protocol applies:

- **Warn First**: If a user request violates the Independence (Phase 2) or Configuration Coupling (Phase 5) rules, the agent MUST explicitly warn the user: "This coupling technically violates Rule [X] because [reason]."
- **Explicit Override**: The agent accepts the coupling ONLY if the user re-confirms or explicitly approves the deviation after the warning.
- **Documentation**: The deviation rationale MUST be documented in the commit message body (e.g., "Coupled with IDE updates per user request for atomic convenience").
