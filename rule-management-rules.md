<!--
title: Rule Management Workflow
description: Documentation sync and update workflow, including metadata management for rule indexing.
category: Tooling & Workflows
-->

# Rule Management: Documentation Sync Workflow

## Automated Synchronization
>
> [!IMPORTANT]
> The `README.md` and `agent-rules.md` files are **automatically generated** from the individual rule files and templates. **Do not edit them manually.** Any manual changes will be OVERWRITTEN by the next sync.

### Source of Truth

- **Content**: The metadata (YAML frontmatter) in each `*-rules.md` file is the source of truth for the index descriptions.
- **Structure**: The files in `ai-agent-rules/templates/` (e.g., `README.md.template`) are the source of truth for the layout and architecture diagrams.

### CI/CD Managed Updates

The synchronization is handled by the GitHub Actions workflow at **[.github/workflows/update-rules.yml](file:///.github/workflows/update-rules.yml)**.

- **Auto-Sync**: Any push to a `*-rules.md` file or a template file triggers the index regeneration.
- **No Manual Commits**: The agent **MUST NOT** manually commit changes to `README.md` or `agent-rules.md`. These files are ephemeral outputs of the CI/CD process.
- **Template Edits**: If you need to change the architecture diagram, headers, or footer, edit the **[.template files](./templates/)** instead.

### Workflow

1. **Modify/Add Rule**: Edit or create a `*-rules.md` file.
2. **Add Metadata**: Ensure the file starts with the required metadata block:

    ```markdown
    <!--
    title: [Short Title for Index]
    description: [Summary for Index]
    category: [Category Name]
    -->
    ```

    - **Note**: You can define *any* category name. New categories will automatically create new sections in the `README.md`.
3. **Commit**: Push your changes.
4. **Auto-Update**: The GitHub Actions workflow (`update-rules`) will:
    - Validate metadata.
    - Regenerate `README.md` and `agent-rules.md`.
    - Commit the changes automatically.
    - **Fail** if metadata is invalid/missing (check Action logs).
5. **Craftsmanship Standards**: All new rules must adhere to the formatting and structural requirements defined in [ai-rule-standardization-rules.md](./ai-rule-standardization-rules.md).

## Manual Indexing (Legacy/Fallback)

If automation fails or is incomplete, follow the legacy process below ONLY as a fallback.

Whenever the user mentions adding or modifying a AI rule, always remind them to update the agent-rules.md documentation. The workflow is: 1) Help craft the rule name and description, 2) User adds/modifies rule in Warp first, 3) Remind user to say "Update agent-rules.md with the new/modified rule", 4) Update the markdown file and commit with conventional commit message. This ensures documentation stays synchronized with actual Warp rules.

**Workflow Steps:**

1. Rule Creation/Modification - Help craft proper rule name and description
2. Warp Update First - User adds/modifies rule in Warp interface
3. Documentation Sync - Remind user to request markdown update
4. Commit Changes - Update agent-rules.md and commit with proper message

**Trigger Phrases:**

- "I want to add a rule for..."
- "New rule: when I do X, you should Y"
- "Let's create a rule that..."
- "Modify the rule for..."
