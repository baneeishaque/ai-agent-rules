#!/usr/bin/env python3
"""
Script to synchronize rule files and generate index/readme tables.
"""

import os
import re
import sys
from collections import defaultdict

# Configuration
RULES_DIR = "."
TEMPLATES_DIR = "templates"
README_TEMPLATE = os.path.join(TEMPLATES_DIR, "README.md.template")
INDEX_TEMPLATE = os.path.join(TEMPLATES_DIR, "agent-rules.md.template")
README_OUTPUT = "README.md"
INDEX_OUTPUT = "agent-rules.md"
SKILLS_DIR = "../.agent/skills"


def parse_metadata(content):
    """Extracts metadata from the Markdown content (supports XML comments and YAML front matter)."""
    # Try XML-style comments (legacy rules)
    meta_match = re.search(r"^<!--\s*(.*?)\s*-->", content, re.DOTALL)
    if not meta_match:
        # Try YAML front matter (Agent Skills)
        meta_match = re.search(r"^---\s*(.*?)\s*---", content, re.DOTALL)

    if not meta_match:
        return None

    meta_text = meta_match.group(1)
    metadata = {}
    current_key = None

    for line in meta_text.split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            current_key = key.strip()
            metadata[current_key] = value.strip()
        elif current_key and line.strip():
            metadata[current_key] += " " + line.strip()

    # Normalize 'name' to 'title' for SKILL Markdown files
    if "name" in metadata and "title" not in metadata:
        metadata["title"] = metadata["name"]

    return metadata


def escape_cell(text):
    """Escapes pipe characters in table cells to prevent Markdown breakage."""
    if not text:
        return ""
    return text.replace("|", "\\|")


def get_rule_files():
    """Retrieves all rule and skill Markdown files."""
    files = []
    # Current directory rules
    files.extend(
        [
            f
            for f in os.listdir(RULES_DIR)
            if f.endswith("-rules.md") and f not in [INDEX_OUTPUT, README_OUTPUT]
        ]
    )

    # Skills directory
    if os.path.exists(SKILLS_DIR):
        for skill_name in os.listdir(SKILLS_DIR):
            skill_path = os.path.join(SKILLS_DIR, skill_name)
            if os.path.isdir(skill_path):
                skill_file = os.path.join(skill_path, "SKILL.md")
                if os.path.isfile(skill_file):
                    # Store relative path from RULES_DIR
                    files.append(os.path.join(SKILLS_DIR, skill_name, "SKILL.md"))
    return files


def generate_readme_tables(rules_by_category):
    """Generates the Markdown tables for the README file."""
    output = []

    # Sort categories alphabetically ASC
    sorted_categories = sorted(rules_by_category.keys())

    for category in sorted_categories:
        rules = rules_by_category[category]
        if not rules:
            continue

        output.append(f"### {category}")
        output.append("")
        output.append("| Rule File | Purpose |")
        output.append("| :--- | :--- |")

        # Sort rules by filename
        sorted_rules = sorted(rules, key=lambda x: x["filename"])

        for rule in sorted_rules:
            link = f"[`{rule['filename']}`](./{rule['filename']})"
            desc = escape_cell(rule["description"])
            output.append(f"| {link} | {desc} |")

        output.append("")

    return "\n".join(output)


def generate_index_table(all_rules):
    """Generates the flat table for the agent rules file."""
    output = []
    output.append("")  # Ensure blank line before table
    output.append("| Rule Domain | File Name | Description |")
    output.append("| :--- | :--- | :--- |")

    # Sort by Title (Rule Domain)
    sorted_rules = sorted(all_rules, key=lambda x: x["title"])

    for rule in sorted_rules:
        link = f"[{rule['filename']}](./{rule['filename']})"
        title = escape_cell(rule["title"])
        desc = escape_cell(rule["description"])
        output.append(f"| {title} | {link} | {desc} |")

    return "\n".join(output)


def process_rule_file(filename, rules_dir, valid_rules, errors):
    """Reads a rule file, extracts metadata, and appends entries into valid_rules or errors."""
    filepath = os.path.join(rules_dir, filename)
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        metadata = parse_metadata(content)

        missing_fields = []
        if not metadata:
            missing_fields = ["metadata_block"]
        else:
            if "title" not in metadata:
                missing_fields.append("title")
            if "description" not in metadata:
                missing_fields.append("description")
            if "category" not in metadata:
                missing_fields.append("category")

        if missing_fields:
            errors.append({"file": filename, "missing": missing_fields})
        else:
            metadata["filename"] = filename
            valid_rules.append(metadata)

    except (OSError, ValueError) as e:
        errors.append({"file": filename, "missing": [f"READ_ERROR: {str(e)}"]})


def write_output_files(rules_only, skills_only, rules_by_category):
    """Generates the content and writes out the README and agent-rules index files."""
    readme_rules_block = generate_readme_tables(rules_by_category).strip()
    readme_skills_block = generate_index_table(skills_only).strip()

    index_rules_block = generate_index_table(rules_only).strip()
    index_skills_block = generate_index_table(skills_only).strip()

    # Write README file
    try:
        with open(README_TEMPLATE, "r", encoding="utf-8") as f:
            readme_template = f.read()

        new_readme = readme_template.replace(
            "<!-- RULES_README -->", readme_rules_block
        )
        new_readme = new_readme.replace("<!-- SKILLS_README -->", readme_skills_block)

        with open(README_OUTPUT, "w", encoding="utf-8") as f:
            f.write(new_readme)
        print(f"📄 Generated {README_OUTPUT}")

    except FileNotFoundError:
        print(f"❌ Template not found: {README_TEMPLATE}")
        sys.exit(1)

    # Write agent rules file
    try:
        with open(INDEX_TEMPLATE, "r", encoding="utf-8") as f:
            index_template = f.read()

        new_index = index_template.replace("<!-- RULES_INDEX -->", index_rules_block)
        new_index = new_index.replace("<!-- SKILLS_INDEX -->", index_skills_block)

        with open(INDEX_OUTPUT, "w", encoding="utf-8") as f:
            f.write(new_index)
        print(f"📄 Generated {INDEX_OUTPUT}")

    except FileNotFoundError:
        print(f"❌ Template not found: {INDEX_TEMPLATE}")
        sys.exit(1)


def main():
    """Main execution entry point."""
    rule_files = get_rule_files()
    valid_rules = []
    errors = []

    print(f"🔍 Scanning {len(rule_files)} rule files...")

    for filename in rule_files:
        process_rule_file(filename, RULES_DIR, valid_rules, errors)

    # Validation Check
    if errors:
        print("\n❌ Validation Failed! The following files have missing metadata:")
        print(f"{'File':<40} | {'Missing Fields'}")
        print("-" * 60)
        for error in errors:
            print(f"{error['file']:<40} | {', '.join(error['missing'])}")
        print("\nPlease add the missing metadata to these files and retry.")
        sys.exit(1)

    print("✅ All files validated successfully.")

    # Group by Category for README (Rules only)
    rules_only = [r for r in valid_rules if not r["filename"].startswith(SKILLS_DIR)]
    skills_only = [r for r in valid_rules if r["filename"].startswith(SKILLS_DIR)]

    rules_by_category = defaultdict(list)
    for rule in rules_only:
        rules_by_category[rule["category"]].append(rule)

    # Generate Output Files
    write_output_files(rules_only, skills_only, rules_by_category)


if __name__ == "__main__":
    main()
