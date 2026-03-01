#!/usr/bin/env python3
"""
Thin wrapper for rule synchronization using the Base Sync engine.
"""

import sys
import os

# Add current directory to path to import base_sync
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from base_sync import SyncManager


def main() -> None:
    """Main entry point for rule synchronization."""
    # Configure for ai-agent-rules: rules only, no skills.
    manager = SyncManager(
        rules_dir=".",
        skills_dir=None,  # Decoupled from skills
        templates_dir="templates",
        readme_template="README.md.template",
        index_template="agent-rules.md.template",
        readme_output="README.md",
        index_output="agent-rules.md",
    )
    manager.run()


if __name__ == "__main__":
    main()
