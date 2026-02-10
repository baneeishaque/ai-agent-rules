***

## 6. Common Error Patterns & Troubleshooting

This section documents real-world error patterns discovered during compliance audits, their root causes, and proven
resolution strategies.

### 6.1 MD051: Link Fragment Errors (CRITICAL)

**Symptom:** Internal links flagged as broken even though target headers exist in the file.

**Root Cause:** Malformed closing code fences break document structure, causing headers to appear inside code blocks.

**Problem Pattern:**

````markdown
```bash
echo "Hello"
```bash    <!-- WRONG: Language identifier on closing fence -->

## My Header    <!-- This header is now "inside" the code block -->
````

**Impact:**

- Markdown parsers fail to recognize code block closure
- Subsequent content treated as code
- Headers hidden from table of contents
- Internal link validation fails

**Resolution:**

1. Scan for malformed closing fences: `grep -n '```[a-z]' file.md`
2. Replace all closing fences with plain ` ``` `
3. Verify with `markdownlint-cli2`

**Prevention:** Always use plain ` ``` ` for closing fences (see Section 1.3).

### 6.2 MD001: Heading Increment Violations

**Symptom:** Skipped heading levels (e.g., H1 → H3, H2 → H4).

**Common Causes:**

- Copy-paste from different documents
- Inconsistent section nesting
- Over-reliance on visual appearance vs semantic structure

**Example Error:**

```markdown
# Main Title       <!-- H1 -->
### Subsection     <!-- H3 - WRONG: Skipped H2 -->
```

**Resolution:**

```markdown
# Main Title       <!-- H1 -->
## Subsection      <!-- H2 - CORRECT -->
```

**Best Practice:** Maintain strict heading hierarchy: H1 → H2 → H3 → H4.

### 6.3 MD013: Line Length Violations

**Symptom:** Lines exceeding 120 characters.

**Common Causes:**

- Long URLs or file paths
- Verbose descriptions
- Unwrapped YAML frontmatter

**Resolution Strategies:**

**1. Wrap Long Lines:**

```markdown
<!-- Before -->
This is a very long line that exceeds the 120-character limit and should be wrapped to maintain readability and compliance.

<!-- After -->
This is a very long line that exceeds the 120-character limit and should be wrapped to maintain readability and
compliance.
```

**2. Break Long URLs:**

```markdown
<!-- Use reference-style links -->
See the [documentation][docs] for details.

[docs]: https://very-long-url.com/path/to/documentation
```

**3. Wrap YAML Frontmatter:**

```markdown
<!--
description: This is a very long description that needs to be wrapped to comply with the 120-character line length
limit.
-->
```

### 6.4 MD031: Code Block Spacing

**Symptom:** Missing blank lines around fenced code blocks.

**Problem Pattern:**

```markdown
Some text here
```bash
echo "Hello"
```

More text here

```

**Resolution:**
```markdown
Some text here

```bash
echo "Hello"
```

More text here

```

**Rule:** ALWAYS surround code blocks with blank lines (one before, one after).

### 6.5 MD033: Inline HTML (Angle Brackets)

**Symptom:** Unescaped `<` and `>` characters flagged as invalid HTML.

**Common Causes:**
- Technical placeholders: `<commit-hash>`, `<path>`, `<value>`
- Mathematical comparisons: `x < y`, `a > b`
- XML/HTML examples without proper escaping

**Resolution:**
```markdown
<!-- WRONG -->
Use <commit-hash> as the reference.
The value must be < 100.

<!-- CORRECT -->
Use `<commit-hash>` as the reference.
The value must be `< 100`.
```

**Rule:** ALWAYS wrap angle brackets in backticks.

### 6.6 MD036: Emphasis as Heading

**Symptom:** Bold or italic text used as pseudo-headings.

**Problem Pattern:**

```markdown
**Installation Steps**

1. Download the package
2. Run the installer
```

**Resolution:**

```markdown
### Installation Steps

1. Download the package
2. Run the installer
```

**Special Case - Footer/Div Contexts:**

```markdown
<!-- WRONG -->
<div align="center">

**Made with ❤️ for the community**

</div>

<!-- CORRECT -->
<div align="center">

Made with ❤️ for the community

</div>
```

### 6.7 MD060: Table Column Spacing

**Symptom:** Table pipes without proper spacing.

**Problem Pattern:**

```markdown
|Column A|Column B|
|--------|--------|
|Value 1|Value 2|
```

**Resolution:**

```markdown
| Column A | Column B |
| -------- | -------- |
| Value 1  | Value 2  |
```

**Rule:** Each cell must have exactly ONE space on both sides of the pipe delimiter.

### 6.8 MD012: Multiple Blank Lines

**Symptom:** Two or more consecutive blank lines.

**Common Causes:**

- Manual formatting for visual separation
- Copy-paste artifacts
- Inconsistent editor settings

**Resolution:**

- Consolidate to single blank line
- Use horizontal rules (`***`) for section separation instead

### 6.9 MD046: Code Block Style Inconsistency

**Symptom:** Mix of indented and fenced code blocks.

**Problem Pattern:**

```markdown
    # Indented code block
    echo "Hello"

```bash
# Fenced code block
echo "World"
```

```

**Resolution:** Use ONLY fenced code blocks with language identifiers:
```markdown
```bash
# Fenced code block
echo "Hello"
```

```bash
# Another fenced code block
echo "World"
```

```

### 6.10 Template File Errors (Cascading Issues)

**Critical Understanding:** Errors in template files cascade to ALL generated files.

**Common Template Issues:**
1. Malformed code fences (see 6.1)
2. Table formatting without spaces (see 6.7)
3. Emphasis in footers (see 6.6)
4. Long lines in metadata (see 6.3)

**Resolution Strategy:**
1. **Always audit templates FIRST** before generated files
2. Fix errors in template
3. Regenerate all derived files
4. Verify generated files pass linting

**Example:** `README.md.template` with 20+ malformed fences caused 7 MD051 errors in generated `README.md`.

***

## 7. Troubleshooting Workflow

### 7.1 Initial Scan

```bash
markdownlint-cli2 "**/*.md" > lint_report.txt
```

### 7.2 Prioritize Errors

1. **Template files** - Fix these FIRST (errors cascade)
2. **Structural errors** - MD001, MD051 (break document integrity)
3. **Formatting errors** - MD013, MD060 (cosmetic but important)
4. **Spacing errors** - MD031, MD032 (easy bulk fixes)

### 7.3 Systematic Remediation

**For Bulk Violations (MD007, MD013, MD030):**

- Use automated scripts with caution
- Verify changes don't break functionality
- Test on subset before full application

**For Complex Issues (MD051, MD046):**

- Manual inspection required
- One file at a time
- Verify root cause before fixing

### 7.4 Verification

```bash
# Individual file
markdownlint-cli2 "path/to/file.md"

# Full repository
markdownlint-cli2 "**/*.md"

# Specific rules only
markdownlint-cli2 --rules MD001,MD051 "**/*.md"
```

### 7.5 Common Pitfalls

**1. "False Positive" Assumption**

- MD051 errors may appear false (headers exist)
- Always investigate structural issues (malformed fences)
- Don't dismiss without deep analysis

**2. Fixing Generated Files Directly**

- Changes will be overwritten on next generation
- Always fix the template/source
- Regenerate to propagate fixes

**3. Automated Fixes Without Review**

- Auto-fix tools can introduce new errors
- Always review automated changes
- Test incrementally

**4. Ignoring Configuration**

- Check `.markdownlint.json` for project-specific rules
- Respect line length limits (120 chars standard)
- Don't disable rules without understanding impact

***

## 8. Real-World Case Studies

### Case Study 1: Template Code Fence Cascade

**Scenario:** 7 MD051 errors in `README.md` despite all headers existing.

**Investigation:**

- Headers existed in file
- Table of contents links were correct
- Appeared to be false positives

**Root Cause:** 20+ malformed closing fences in `README.md.template` (` ```bash ` instead of ` ``` `).

**Impact:** Document structure broken, headers hidden from TOC, link validation failed.

**Resolution:**

1. Created Python script to systematically fix all closing fences
2. Regenerated `README.md` from corrected template
3. All 7 MD051 errors resolved

**Lesson:** Template errors cascade. Always audit templates first.

### Case Study 2: Heading Hierarchy Normalization

**Scenario:** Multiple MD001 errors across documentation files.

**Pattern:** H3 headers following H1 (skipped H2).

**Root Cause:** Copy-paste from different documents with different heading structures.

**Resolution:** Normalized all heading levels to sequential hierarchy (H1 → H2 → H3).

**Lesson:** Maintain consistent heading hierarchy across all documents.

### Case Study 3: Table Formatting Consistency

**Scenario:** 8 MD060 errors in template file.

**Pattern:** Table separators without spaces: `|------|---------|`

**Resolution:** Added spaces around all pipe delimiters: `| ------ | --------- |`

**Lesson:** Table formatting must include space padding for MD060 compliance.

***

## 9. Maintenance & Prevention

### 9.1 Pre-commit Hooks

Implement linting as pre-commit hook:

```bash
#!/bin/sh
# .git/hooks/pre-commit
markdownlint-cli2 "**/*.md" || exit 1
```

### 9.2 CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Lint Markdown Files
  run: |
    npm install -g markdownlint-cli2
    markdownlint-cli2 "**/*.md"
```

### 9.3 Editor Integration

**VS Code:**

- Install `markdownlint` extension
- Configure `.vscode/settings.json`:

```json
{
  "markdownlint.config": {
    "MD013": { "line_length": 120 },
    "MD007": { "indent": 4 }
  }
}
```

### 9.4 Regular Audits

**Monthly:** Full repository scan
**Quarterly:** Deep review of templates and generated files
**Annual:** Standards update and configuration review

### 9.5 Documentation Updates

When discovering new error patterns:

1. Document in this section (6. Common Error Patterns)
2. Add examples showing correct/incorrect patterns
3. Update troubleshooting workflow if needed
4. Cross-reference with actual fixes

***
