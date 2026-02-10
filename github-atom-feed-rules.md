<!--
title: GitHub Atom Feed URL Generation Rules
description: Protocol for generating and providing GitHub repository Atom feed URLs for commits and releases
category: VCS-Integration
-->

# GitHub Atom Feed URL Generation Rules

When a user requests GitHub Atom feed URLs (e.g., for monitoring commits or releases), the agent MUST provide
standardized URLs following GitHub's Atom feed pattern.

***

## 1. URL Pattern Standard

GitHub provides Atom feeds for repository activity with a consistent URL structure:

### Base Pattern

```text
<https://github.com/[owner]/[repo]/[feed-type].atom>

```bash

### Available Feed Types

- `commits` - Recent commits to the default branch or specified branch

- `releases` - Published releases for the repository

***

### 2. Generation Protocol

When user provides example feeds or requests similar URLs:

1. **Parse Repository Information**: Extract owner and repository name from the target repository

1. **Apply Standard Pattern**: Use the base pattern `<https://github.com/[owner]/[repo]/[feed-type].atom`>

1. **Provide Both Types**: Unless specified otherwise, provide both commits and releases feed URLs

1. **Include Pattern Explanation**: Explain the URL structure for user's future reference

***

### 3. Supported Feed Types

#### 3.1 Commits Feed

```text
<https://github.com/[owner]/[repo]/commits.atom>

```bash

- Shows recent commits to the default branch

- Can be extended with branch specification: `commits/[branch-name].atom`

#### 3.2 Releases Feed

```text
<https://github.com/[owner]/[repo]/releases.atom>

```bash

- Shows published releases (tags with release notes)

- Only includes formal releases, not all tags

***

### 4. Response Format

The agent MUST structure responses as:

```markdown
For the [owner/repo] repository:

- **Commits feed**: `<https://github.com/[owner]/[repo]/commits.atom`>

- **Releases feed**: `<https://github.com/[owner]/[repo]/releases.atom`>

These follow GitHub's standard Atom feed URL pattern:
`<https://github.com/[owner]/[repo]/[feed-type].atom`>

```bash

***

### 5. Edge Cases

- **Branch-Specific Commits**: If user needs specific branch monitoring, use `commits/[branch-name].atom`

- **Tags vs Releases**: Inform user that the releases feed only includes published releases, not raw tags

- **Private Repositories**: Atom feeds for private repos require authentication; inform user they need to be logged

    into GitHub

- **Non-GitHub Platforms**: If user requests feeds for GitLab, Bitbucket, or others, note that URL patterns differ per

    platform

***

### 6. Related Conversations & Traceability

- [2026-01-19: GitHub Atom Feed URLs](./conversations/2026-01-19-github-atom-feed-urls.md)
