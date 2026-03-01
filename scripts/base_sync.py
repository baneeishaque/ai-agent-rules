#!/usr/bin/env python3
"""
Base synchronization script for indexing rules and skills.
"""

import os
import re
import sys
from collections import defaultdict
from typing import Optional, List, Dict, Any, DefaultDict


class SyncManager:
    """Manages the synchronization of rule and skill indices."""

    SKILL_FILE: str = "SKILL.md"

    def __init__(
        self,
        rules_dir: Optional[str] = None,
        skills_dir: Optional[str] = None,
        templates_dir: str = "templates",
        readme_template: Optional[str] = "README.md.template",
        index_template: Optional[str] = None,
        readme_output: str = "README.md",
        index_output: Optional[str] = None,
    ) -> None:
        """
        Initializes the SyncManager with directory and template configurations.
        """
        self.rules_dir = rules_dir
        self.skills_dir = skills_dir
        self.templates_dir = templates_dir
        self.readme_template_path: Optional[str] = (
            os.path.join(templates_dir, readme_template) if readme_template else None
        )
        self.index_template_path: Optional[str] = (
            os.path.join(templates_dir, index_template) if index_template else None
        )
        self.readme_output = readme_output
        self.index_output = index_output

    def parse_metadata(self, content: str) -> Optional[Dict[str, str]]:
        """Extracts metadata from YAML front matter (--- ... ---)."""
        meta_match = re.search(r"^---\s*(.*?)\s*---", content, re.DOTALL)
        if not meta_match:
            return None

        meta_text = meta_match.group(1)
        metadata: Dict[str, str] = {}
        current_key: Optional[str] = None

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

    def escape_cell(self, text: str) -> str:
        """Escapes pipe characters in table cells."""
        if not text:
            return ""
        return text.replace("|", "\\|")

    def get_files(self) -> List[str]:
        """Retrieves targeted rule and skill files based on configuration."""
        files: List[str] = []
        if self.rules_dir:
            files.extend(
                [
                    os.path.join(self.rules_dir, f)
                    for f in os.listdir(self.rules_dir)
                    if f.endswith("-rules.md")
                    and f not in [self.index_output, self.readme_output]
                ]
            )

        if self.skills_dir and os.path.exists(self.skills_dir):
            for skill_name in os.listdir(self.skills_dir):
                skill_path = os.path.join(self.skills_dir, skill_name)
                if os.path.isdir(skill_path):
                    skill_file = os.path.join(skill_path, self.SKILL_FILE)
                    if os.path.isfile(skill_file):
                        files.append(skill_file)
        return files

    def run(self) -> None:
        """Main execution flow."""
        files = self.get_files()
        valid_entries: List[Dict[str, str]] = []
        errors: List[Dict[str, Any]] = []

        print(f"🔍 Scanning {len(files)} files...")

        for filepath in files:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                metadata = self.parse_metadata(content)
                if not metadata or not all(
                    k in metadata for k in ["title", "description", "category"]
                ):
                    errors.append(
                        {
                            "file": filepath,
                            "missing": ["metadata_block/title/description/category"],
                        }
                    )
                else:
                    is_skill = filepath.endswith(self.SKILL_FILE)
                    metadata["filename"] = (
                        os.path.basename(os.path.dirname(filepath))
                        + "/"
                        + self.SKILL_FILE
                        if is_skill
                        else os.path.basename(filepath)
                    )
                    metadata["fullpath"] = filepath
                    valid_entries.append(metadata)
            except (OSError, ValueError) as e:
                errors.append({"file": filepath, "missing": [f"READ_ERROR: {str(e)}"]})

        if errors:
            print("\n❌ Validation Failed!")
            for error in errors:
                print(f"{error['file']}: {', '.join(error['missing'])}")
            sys.exit(1)

        print("✅ All files validated.")

        # Filter by type
        rules = [
            r for r in valid_entries if not r["fullpath"].endswith(self.SKILL_FILE)
        ]
        skills = [r for r in valid_entries if r["fullpath"].endswith(self.SKILL_FILE)]

        self.sync(rules, skills)

    def generate_readme_tables(
        self, grouped_entries: Dict[str, List[Dict[str, str]]]
    ) -> str:
        """Generates Markdown tables for the README categorized by domain."""
        output: List[str] = []
        for category in sorted(grouped_entries.keys()):
            items = grouped_entries[category]
            output.append(f"### {category}\n")
            output.append("| File | Purpose |")
            output.append("| :--- | :--- |")
            for item in sorted(items, key=lambda x: x["filename"]):
                link = f"[`{item['filename']}`](./{item['filename']})"
                desc = self.escape_cell(item["description"])
                output.append(f"| {link} | {desc} |")
            output.append("")
        return "\n".join(output)

    def generate_index_table(self, entries: List[Dict[str, str]]) -> str:
        """Generates a flat Markdown table for index files."""
        output = ["", "| Domain | File | Description |", "| :--- | :--- | :--- |"]
        for item in sorted(entries, key=lambda x: x["title"]):
            link = f"[{item['filename']}](./{item['filename']})"
            output.append(
                f"| {self.escape_cell(item['title'])} | {link} | {self.escape_cell(item['description'])} |"
            )
        return "\n".join(output)

    def sync(self, rules: List[Dict[str, str]], skills: List[Dict[str, str]]) -> None:
        """Synchronizes content into Markdown templates."""
        rules_by_cat: DefaultDict[str, List[Dict[str, str]]] = defaultdict(list)
        for r in rules:
            rules_by_cat[r["category"]].append(r)

        rules_readme = self.generate_readme_tables(rules_by_cat)
        skills_readme = self.generate_index_table(skills)
        skills_index = self.generate_index_table(skills)

        if self.readme_template_path and os.path.exists(self.readme_template_path):
            with open(self.readme_template_path, "r", encoding="utf-8") as f:
                template = f.read()
            content = template.replace("<!-- RULES_README -->", rules_readme).replace(
                "<!-- SKILLS_README -->", skills_readme
            )
            with open(self.readme_output, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"📄 Written {self.readme_output}")

        if (
            self.index_template_path
            and self.index_output
            and os.path.exists(self.index_template_path)
        ):
            with open(self.index_template_path, "r", encoding="utf-8") as f:
                template = f.read()
            content = template.replace("<!-- RULES_INDEX -->", rules_readme).replace(
                "<!-- SKILLS_INDEX -->", skills_index
            )
            with open(self.index_output, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"📄 Written {self.index_output}")
