# ai-agent-rules Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill covers development patterns for the ai-agent-rules repository, a comprehensive collection of structured rules and guidelines for AI agent behavior. The repository focuses on maintaining consistent documentation standards, systematic rule organization, and automated synchronization workflows. It uses markdown-based rule files with templating systems and Python automation scripts to maintain documentation consistency across 40+ rule files.

## Coding Conventions

**File Naming:**
- Use kebab-case for all files: `git-atomic-commit-construction-rules.md`
- Rule files follow pattern: `*-rules.md`
- Template files: `*.template`
- Test files: `*.test.*`

**Import Style:**
```typescript
// Use relative imports
import { syncRules } from './scripts/sync_rules'
import { RuleTemplate } from '../templates/base'
```

**Export Style:**
```typescript
// Mixed export patterns - use named exports for utilities
export const generateRuleIndex = () => { ... }
export { RuleValidator, TemplateEngine }

// Default exports for main components
export default class RuleManager { ... }
```

**Commit Message Format:**
- Average length: 49 characters
- Use conventional prefixes: `docs:`, `feat:`, `chore:`, `refactor:`
- Examples: `docs: sync rule indices`, `feat: add new planning rules`

## Workflows

### Documentation Index Synchronization
**Trigger:** When rule files are added, removed, or significantly modified  
**Command:** `/sync-indices`

1. Run the sync script to detect all current rule files
2. Update `README.md` using the template with current rules list
3. Update `agent-rules.md` with current rules list using template
4. Commit changes with message: `docs: sync rule indices`

**Files involved:**
- `scripts/sync_rules.py`
- `templates/README.md.template`
- `templates/agent-rules.md.template`
- `README.md`
- `agent-rules.md`

### Single Rule Refinement
**Trigger:** When enhancing or clarifying specific individual rules  
**Command:** `/refine-rule`

1. Identify the target rule file (e.g., `markdown-generation-rules.md`)
2. Make focused improvements to content, structure, or clarity
3. Commit with descriptive message mentioning the specific rule type
4. Optionally update related templates if the change affects the pattern

**Example commit messages:**
- `refactor: improve markdown generation rule clarity`
- `docs: enhance ai-agent-planning-rules structure`

### Mass Standardization Update
**Trigger:** When applying new formatting standards across all rule files  
**Command:** `/standardize-format`

1. Identify the standardization pattern to apply (metadata, headers, formatting)
2. Apply changes systematically to all affected rule files (typically 40+)
3. Update template files to reflect new standards
4. Commit with descriptive message about standardization type

**Example:**
```bash
# Commit affecting many files
git add *-rules.md templates/
git commit -m "chore: standardize metadata format across all rule files"
```

### Session Documentation Archival
**Trigger:** After completing significant development sessions or creating new rules  
**Command:** `/archive-session`

1. Create conversation log in `docs/conversations/` with timestamp
2. Create implementation plan in `docs/implementation-plans/` if applicable
3. Create walkthrough in `docs/walkthroughs/` for complex procedures
4. Commit with session archival message

**Directory structure:**
```
docs/
├── conversations/
│   └── session-2024-01-15-rule-creation.md
├── implementation-plans/
│   └── plan-standardization-workflow.md
└── walkthroughs/
    └── walkthrough-sync-process.md
```

### Git Rule Enhancement
**Trigger:** When refining git workflows, commit standards, or repository management  
**Command:** `/enhance-git-rules`

1. Identify specific git workflow issue or improvement opportunity
2. Update relevant git-related rule file
3. Add new protocols, safety checks, or best practices
4. Commit with git rule enhancement message

**Target files:**
- `git-atomic-commit-construction-rules.md`
- `git-operation-rules.md`
- `git-history-refinement-rules.md`
- `git-commit-message-rules.md`

## Testing Patterns

Testing framework is not clearly established, but test files should follow:
- Pattern: `*.test.*` for test files
- Place tests adjacent to the code they test
- Focus on rule validation and template generation accuracy

## Commands

| Command | Purpose | Frequency |
|---------|---------|-----------|
| `/sync-indices` | Regenerate main documentation indices after rule changes | ~6x/month |
| `/refine-rule` | Make focused improvements to individual rule files | ~8x/month |
| `/standardize-format` | Apply bulk formatting changes across many rule files | ~2x/month |
| `/archive-session` | Create permanent records of development sessions | ~3x/month |
| `/enhance-git-rules` | Improve git-related workflow rules and protocols | ~4x/month |