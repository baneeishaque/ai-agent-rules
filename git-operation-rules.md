---
title: Git Operation Rules
description: Strict protocols for standard Git operations (commits & pushes),
    mandating explicit user requests and forbidding
    auto-actions.
category: Git & Repository Management
---


# Git Operation Rules

## Phase -1: Environment & Prerequisite Validation

Before any Git commands are executed, the agent MUST perform the following pre-flight checks to ensure the environment
is correctly configured.

- **Authenticate Services**: The agent MUST verify authentication status for required services (e.g., GitHub CLI)

    within the correct shell environment. If authentication is missing, the agent MUST guide the user through the login
    process.

    ```bash
    # Example for GitHub CLI within a Nix shell
    nix-shell -p github-cli --run "gh auth status"

    # If the above fails, guide the user to run:
    nix-shell -p github-cli --run "gh auth login"
    ```

    **Fallback delegations** (MANDATORY when the named tool / capability is unavailable). Skill URLs are
    SHA-pinned hosted-VCS permalinks against the `ai-agents` parent repository, per
    `markdown-generation-rules.md` §4.2.8 (Cross-Repository / Submodule Isolation Links):

    - **`gh` not installed**: defer to the
      [GitHub REST API Fallback](https://github.com/Baneeishaque/ai-agents/blob/de777420fe2931e8ef43ea7a0aa9b27f7e6bf296/.agents/skills/github-rest-api-fallback/SKILL.md)
      skill §3 for the REST equivalent of every `gh` command referenced in this rule.
    - **`git push` / `git fetch` returns 401 / 403**: defer to the
      [Git / GitHub Auth Fallback](https://github.com/Baneeishaque/ai-agents/blob/de777420fe2931e8ef43ea7a0aa9b27f7e6bf296/.agents/skills/git-github-auth-fallback/SKILL.md)
      skill §2 to classify the error (wrong-identity cache vs missing scope vs needs-fork) before retrying.
    - **Agent `run_in_terminal` tool unavailable**: route every command in this rule through
      [Terminal Fallback via VS Code Tasks](https://github.com/Baneeishaque/ai-agents/blob/de777420fe2931e8ef43ea7a0aa9b27f7e6bf296/.agents/skills/terminal-fallback-via-vscode-tasks/SKILL.md)
      skill §3 (file-mediated output capture). Interactive flows (`gh auth login`, `git credential-manager`) MUST
      still be surfaced to the user as manual commands per that skill §4.4.

- **Verify Tool Permissions**: The agent MUST ensure that all necessary build tools have execute permissions.

    ```bash
    # Example for Gradle wrapper
    chmod +x gradlew
    ```

***

## Phase 0: Establish Correct Repository Context

After ensuring the environment is valid, the agent's first action is to confirm its operational context.

- **Identify the Target Repository**: The agent MUST determine the correct Git repository to operate within based on

    the user's request and the file paths being discussed.

- **Handle Nested Repositories**: If a user's request concerns changes within a nested repository (a sub-directory that

    is its own Git project), the agent **MUST** change its working directory into that sub-directory *before* executing
    any `git`or`gh` commands.

- **Clarify Ambiguity**: If the workspace contains multiple repositories and the target is unclear, the agent must ask

    the user for clarification before proceeding (e.g., "Which repository should I be working in? `project-a/` or
    `project-b/`?").

***

## 1. Operational Protocol for Change Detection and Commit Scope

- Always use git commands to detect unstaged and staged changes in the folder or repository specified by the user.

- When asked to commit staged files, only consider files that are staged (use git diff --cached or git status --short).

- Always respect the folder, repository, or submodule specified by the user. If not specified, use the workspace root

    or known repositories.

- If the folder is a submodule, follow all submodule commit and branch management rules (see git-submodule-rules.md).

- Don't manually scan or assume file changes; always rely on git for authoritative status. This includes untracked

    files not captured by `.gitignore`, which require explicit user confirmation before staging.

- **Workflow-First Priority**: If changes involve CI/CD (workflows, scripts), fix and verify the logic **FIRST** before

    committing.

- **Submodule Integrity**:

- **Dangling Pointer Check**: Before pushing changes that update a submodule, the agent MUST verify that the

    referenced submodule commit exists in the remote submodule repository.

- **Canonical Ancestry**: Ensure the new submodule pointer is a descendant of the codebase's previous submodule

    pointer if a linear history is expected.

## Version Control Operations

### 2. Commits

- **Atomic Construction**: Before any commit operation, follow the

    [git-atomic-commit-construction-rules.md](./git-atomic-commit-construction-rules.md) to group and arrange changes.

- **Explicit Request Required**: Do NOT generate commit messages or execute `git commit` unless the user **explicitly**

    requests it.

- **Authorization Trigger**: The agent MUST NOT proceed with any commit until the user explicitly says **"start"**.

    Other commands like "commit" are insufficient.

- **No Auto-Commits**: Never assume a task completion implies a commit. Always wait for instruction.

- **Commit Messages**: When authorized, must strictly follow `git-commit-message-rules.md`.

### 3. Pushes and Synchronization

- **Status Check First**: Always run `git status` before any fetch, pull, or push operation to understand the current

    state.

- **Remote Check**: Use `git fetch --dry-run`or`git ls-remote` to check for remote changes WITHOUT fetching. Requires

    user confirmation.

- **Fetch Protocol**: Do NOT execute `git fetch` without explicit user confirmation.

- **Pull Protocol**:

- **Timing**: Pull BEFORE making commits, not after.

- **Explicit Confirmation**: Always ask user before pulling.

- **Rebase Option**: `git pull --rebase` requires separate explicit confirmation.

- **Discover Default Branch**: The agent MUST NOT assume the default branch name. It MUST be discovered

    programmatically before any checkout or rebase operation.

    ```bash
    # Discover remote branches to identify the default (e.g., 'master' or 'main')
    git branch -r
    ```

#### 3.1. Full Synchronization Workflow (Stash, Fetch, Rebase)

This is the mandatory workflow for updating a local branch against its remote counterpart.

1. **Stash Uncommitted Changes**: To prevent conflicts, stash any local modifications.

    ```bash
    git stash
    ```

1. **Fetch Remote Updates**:

    ```bash
    git fetch
    ```

1. **Rebase onto Default Branch**: Rebase the current working branch against its remote counterpart.

    ```bash
    git rebase origin/<remote-tracking-branch>
    ```

1. **Pop Stash**: Re-apply the stashed changes.

    ```bash
    git stash pop
    ```

- **Push Protocol**:

- **Explicit Request Required**: Do NOT execute `git push` unless the user **explicitly** requests it.

- **No Auto-Pushes**: Even if a commit is requested, do not chain a push command unless specifically told to "commit

    and push".

- **Offer, Don't Execute**: After commits, OFFER the user to push. Wait for explicit "yes" or "push" command.

- **Safety First (High-Risk Operations)**:

- **`git reset`**: Strictly forbidden for synchronization or resolving conflicts. If unstaging is needed,
  use `git reset <file>`. Hard resets require explicit user confirmation after explaining the data loss risk.

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

### 5. Stash Preservation (Authorization-Gated Destruction)

Stashes are user-authored work-in-progress. They MUST be treated as destructive-to-remove and require **explicit
per-stash authorization** before any operation that drops, pops-and-loses, clears, or expires them.

#### 5.1. Forbidden Without Explicit Authorization

The following commands MUST NOT be issued by an AI agent unless the user has authorized them for the **specific stash
ref(s)** in the same conversational turn:

- `git stash drop [<stash>]`
- `git stash pop [<stash>]` — `pop` deletes the stash on success; treat as drop
- `git stash clear` — destroys ALL stashes
- `git reflog expire --expire=... refs/stash` — invisible destruction
- `git gc --prune=now` while stash refs exist and are unreachable from another ref

"Cleanup" instructions (e.g., "cleanup full", "tidy up", "remove backups") DO NOT implicitly include stash
removal. Stash drops MUST be itemized and gated separately, even inside a multi-step cleanup batch.

#### 5.2. Required Pre-Drop Protocol

Before requesting authorization to drop a stash:

1. **Inventory** — list all stashes across the repository AND its initialized submodules with
   `git stash list` (parent and each submodule).
2. **Inspect** — show the user `git stash show -p <stash>` (or summarized stat) so they can decide whether the work is
   recoverable elsewhere.
3. **Diff against current** — if the stash overlaps existing committed/uncommitted work, run
   `git diff <stash>^1 -- <files>` to surface any unique semantic content the stash would lose on drop.
4. **Request authorization** — present the verdict ("no unique content" / "unique content present") and STOP for the
   user's explicit per-stash decision.

#### 5.3. Recovery Window (When a Drop Was Made in Error)

A dropped stash remains as a dangling commit object until pruned (default ~14 days, governed by
`gc.reflogExpireUnreachable`). To recover:

```bash
# Capture the SHA from the drop output BEFORE losing the terminal scrollback
git stash store -m "<original or recovery message>" <dangling-sha>
git stash list   # confirm restored at stash@{0}
```

If the SHA was not captured, search the dangling commits:

```bash
git fsck --unreachable --no-reflogs | awk '/commit/ {print $3}' \
  | xargs -I{} git log -1 --format="%H %s" {} | grep -i "WIP\|stash\|<known-message>"
```

#### 5.4. Same-Class Protections (Cross-Reference)

Equivalent authorization gates apply to:

- **Backup branches** (`backup/*`, `bk-*`, `pre-*`) — see
  [`git-history-refinement-rules.md`](git-history-refinement-rules.md) cleanup gates.
- **Reflog entries** — `git reflog expire`, `git reflog delete`.
- **Dangling commits reachable only via reflog** — `git gc --prune=now`, `git prune`.

For any of the above, follow the same Inventory → Inspect → Authorize → Act protocol as for stashes.
