<!-- markdownlint-disable MD013 -->

<!--
title: KMP Gradle Upgrade Protocol Derivation
description: A session log detailing the diagnosis and resolution of a complex KMP build failure, leading to the creation of a new, robust upgrade protocol.
category: Session Logs
date: 2024-05-23
-->

# Session Log: Derivation of the KMP Version Upgrade Protocol

## Session Date: 2024-05-23

### 1. Initial Problem Statement

The user presented a Kotlin Multiplatform (KMP) project that failed to build. The initial error messages were related to unresolved plugin versions, incorrect plugin IDs (`com.android.kotlin.multiplatform` vs. `com.android.library`), and ultimately, a Gradle Daemon crash due to an `OutOfMemoryError`.

### 2. Diagnostic & Resolution Chronology

This session was characterized by a collaborative refinement process, moving from a superficial fix to a deep, protocol-driven solution.

#### Attempt 1: Superficial Version Upgrade (Incorrect)

* **Agent Action:** The agent initially proposed upgrading the Android Gradle Plugin (AGP) and Kotlin versions to the latest stable releases found in official documentation.
* **User Correction:** The user immediately intervened, clarifying that the goal was **not** to upgrade, but to **fix the build with the existing versions**. This was a critical insight, revealing the agent's flawed assumption that "latest" is always "best." The user emphasized that a less risky approach is to stabilize the current configuration first.

#### Attempt 2: Misinterpretation of Rule Creation

* **Agent Action:** The agent correctly identified the need to codify the learnings into a rule file. However, it misinterpreted the user's guidance and attempted to create a generic `github-pr-management-rules.md` file.
* **User Correction:** The user steered the agent back on course, specifying that a new, highly specific rule (`kmp-version-upgrade-rules.md`) was needed. The user also directed the agent to first update the foundational `git-operation-rules.md` with the environment checks we had discovered (e.g., `gh auth`, `chmod`). This established a clear hierarchy of rules.

#### Attempt 3: Codification of Expert Knowledge (The Turning Point)

This phase was driven entirely by expert user feedback. The agent proposed a basic rule, and the user provided a comprehensive set of detailed, technical instructions that became the core of the final protocol.

**User-Provided Knowledge Captured:**

1. **Gradle Environment:**
    * The Gradle Daemon was crashing due to insufficient memory. **Resolution:** Create a `gradle.properties` file and set `org.gradle.jvmargs=-Xmx4g`.
    * The build environment was missing a JDK. **Resolution:** Automatically provision a JDK by adding the `foojay-resolver-convention` plugin to `settings.gradle.kts`.
    * Certain KMP-related properties were deprecated. **Resolution:** Explicitly remove `kotlin.mpp.import.enableKgpDependencyResolution` and `kotlin.compiler.preciseCompilationResultsBackup` from `gradle.properties`.

2. **Build Script (`build.gradle.kts`) Migrations:**
    * `targetHierarchy.default()` is deprecated. **Resolution:** Replace with `targetHierarchy.applyDefaultHierarchyTemplate()`.
    * `publishAllLibraryVariants()` is too broad. **Resolution:** Remove it and explicitly define variants to publish.
    * `kotlinOptions` is deprecated. **Resolution:** Migrate to the modern `compilerOptions` DSL.
    * The `all {}` method was causing ambiguous compiler errors. **Resolution:** Use `forEach {}` for configuring compilations to ensure type safety.
    * Language/API versions should be consistent. **Resolution:** Align `languageVersion` and `apiVersion` with the project's Kotlin version (e.g., "2.0").
    * `minSdk` is a mandatory Android setting.

3. **Procedural & Strategic Mandates:**
    * **Safety First:** The default strategy must be to use the project's *existing* AGP version, not to upgrade.
    * **Traceability:** All changes to build files **must** be accompanied by comments explaining the reason for the change.
    * **Respect Architecture:** Do not introduce a version catalog (`libs.versions.toml`) if the project is not already using one.

This iterative process resulted in the creation of a new, comprehensive rule file: **[kmp-version-upgrade-rules.md](../kmp-version-upgrade-rules.md)**.

This file, developed through a partnership between the agent's organizational capabilities and the user's deep technical expertise, now serves as the authoritative protocol for all future KMP dependency upgrades. It ensures that the environment is correctly configured, that a safe versioning strategy is chosen, and that all build script modifications follow modern best practices.

The session concluded with the agent ready to restart the fix, this time correctly equipped with a perfected, user-approved protocol.
