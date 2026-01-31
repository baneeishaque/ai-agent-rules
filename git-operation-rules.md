<!--
title: Git Operation Rules
description: Strict protocols for standard Git operations (commits & pushes), mandating explicit user requests and forbidding auto-actions.
category: Git & Repository Management
-->

# Git Operation Rules

## Phase -1: Environment & Prerequisite Validation

Before any Git commands are executed, the agent MUST perform the following pre-flight checks to ensure the environment is correctly configured.

- **Authenticate Services**: The agent MUST verify authentication status for required services (e.g., GitHub CLI) within the correct shell environment. If authentication is missing, the agent MUST guide the user through the login process.
  ```bash
  # Example for GitHub CLI within a Nix shell
  nix-shell -p github-cli --run "gh auth status"
  
  # If the above fails, guide the user to run:
  nix-shell -p github-cli --run "gh auth login"
  ```
- **Verify Tool Permissions**: The agent MUST ensure that all necessary build tools have execute permissions.
  ```bash
  # Example for Gradle wrapper
  chmod +x gradlew
  ```

***

## Phase 0: Establish Correct Repository Context

After ensuring the environment is valid, the agent's first action is to confirm its operational context.

- **Identify the Target Repository**: The agent MUST determine the correct Git repository to operate within based on the user's request and the file paths being discussed.
- **Handle Nested Repositories**: If a user's request concerns changes within a nested repository (a sub-directory that is its own Git project), the agent **MUST** change its working directory into that sub-directory *before* executing any `git` or `gh` commands.
- **Clarify Ambiguity**: If the workspace contains multiple repositories and the target is unclear, the agent must ask the user for clarification before proceeding (e.g., "Which repository should I be working in? `project-a/` or `project-b/`?").

***

## 1. Operational Protocol for Change Detection and Commit Scope

- Always use git commands to detect unstaged and staged changes in the folder or repository specified by the user.
- When asked to commit staged files, only consider files that are staged (use git diff --cached or git status --short).
- Always respect the folder, repository, or submodule specified by the user. If not specified, use the workspace root or known repositories.
- If the folder is a submodule, follow all submodule commit and branch management rules (see git-submodule-rules.md).
- Don't manually scan or assume file changes; always rely on git for authoritative status. This includes untracked files not captured by `.gitignore`, which require explicit user confirmation before staging.
- **Workflow-First Priority**: If changes involve CI/CD (workflows, scripts), fix and verify the logic **FIRST** before committing.

## Version Control Operations

### 2. Commits

- **Atomic Construction**: Before any commit operation, follow the [git-atomic-commit-construction-rules.md](./git-atomic-commit-construction-rules.md) to group and arrange changes.
- **Explicit Request Required**: Do NOT generate commit messages or execute `git commit` unless the user **explicitly** requests it.
- **Authorization Trigger**: The agent MUST NOT proceed with any commit until the user explicitly says **"start"**. Other commands like "commit" are insufficient.
- **No Auto-Commits**: Never assume a task completion implies a commit. Always wait for instruction.
- **Commit Messages**: When authorized, must strictly follow `git-commit-message-rules.md`.

### 3. Pushes and Synchronization

- **Status Check First**: Always run `git status` before any fetch, pull, or push operation to understand the current state.
- **Remote Check**: Use `git fetch --dry-run` or `git ls-remote` to check for remote changes WITHOUT fetching. Requires user confirmation.
- **Fetch Protocol**: Do NOT execute `git fetch` without explicit user confirmation.
- **Pull Protocol**: 
    - **Timing**: Pull BEFORE making commits, not after.
    - **Explicit Confirmation**: Always ask user before pulling.
    - **Rebase Option**: `git pull --rebase` requires separate explicit confirmation.
- **Discover Default Branch**: The agent MUST NOT assume the default branch name. It MUST be discovered programmatically before any checkout or rebase operation.
  ```bash
  # Discover remote branches to identify the default (e.g., 'master' or 'main')
  git branch -r
  ```

#### 3.1. Full Synchronization Workflow (Stash, Fetch, Rebase)
This is the mandatory workflow for updating a local branch against its remote counterpart.

1.  **Stash Uncommitted Changes**: To prevent conflicts, stash any local modifications.
    ```bash
    git stash
    ```
2.  **Fetch Remote Updates**:
    ```bash
    git fetch
    ```
3.  **Rebase onto Default Branch**: Rebase the current working branch against its remote counterpart.
    ```bash
    git rebase origin/<remote-tracking-branch>
    ```
4.  **Pop Stash**: Re-apply the stashed changes.
    ```bash
    git stash pop
    ```

- **Push Protocol**:
    - **Explicit Request Required**: Do NOT execute `git push` unless the user **explicitly** requests it.
    - **No Auto-Pushes**: Even if a commit is requested, do not chain a push command unless specifically told to "commit and push".
    - **Offer, Don't Execute**: After commits, OFFER the user to push. Wait for explicit "yes" or "push" command.

- **Safety First (High-Risk Operations)**:
  - **`git reset`**: Strictly forbidden for synchronization or resolving conflicts. If unstaging is needed, use `git reset <file>`. Hard resets require explicit user confirmation after explaining the data loss risk.
  - **`git rebase`**: Requires explicit user confirmation.

### 4. Stash Workflow for Rebase Operations

When rebasing with unstaged changes, use `git stash` to temporarily save work.

- **Stash Before Rebase**:

  ```bash
  git stash push -m "Descriptive message for stash"
  git pull --rebase origin <branch>
  ```

- **Pop After Rebase**:

  ```bash
  git stash pop
  ```

- **Conflict Resolution**: If `git stash pop` creates conflicts, resolve them manually, then:

  ```bash
  git add <resolved-files>
  git stash drop  # Remove the stash entry after manual resolution
  ```

- **List Stashes**: View all stashed changes:

  ```bash
  git stash list
  ```