<!--
title: KMP Version Upgrade Rules
description: A specific technical protocol for upgrading Kotlin, AGP, and related dependencies in a Kotlin Multiplatform project.
category: Build-Management
-->

# KMP Version Upgrade Protocol

This document defines the mandatory, technical procedure for upgrading Kotlin, the Android Gradle Plugin (AGP), or other core build dependencies within a Kotlin Multiplatform (KMP) project.

**Prerequisite**: All actions must first adhere to the context and pre-check protocols defined in [git-operation-rules.md](./git-operation-rules.md).

***

### 1. Gradle Environment Configuration

Before modifying any build scripts, the agent MUST ensure the Gradle environment itself is robust and correctly configured.

#### 1.1. Increase Gradle Heap Size
To prevent `OutOfMemoryError` crashes during compilation, the agent MUST ensure a `gradle.properties` file exists and allocates sufficient memory to the Gradle Daemon.

```properties
# In gradle.properties

# Set the JVM arguments for the Gradle Daemon.
# Increased heap size to 4GB to prevent OutOfMemoryError during large builds.
org.gradle.jvmargs=-Xmx4g
```

#### 1.2. Remove Deprecated Properties
The agent MUST remove deprecated properties from `gradle.properties` to avoid conflicts with modern Kotlin Gradle Plugin versions.

-   `kotlin.mpp.import.enableKgpDependencyResolution=true`: Obsolete. The modern KGP has a superior dependency resolution system built-in.
-   `kotlin.compiler.preciseCompilationResultsBackup=true`: Obsolete. The compiler now uses a more efficient backup method by default.

#### 1.3. Provision JDK Automatically
To resolve missing JDK issues, the agent MUST apply the `foojay-resolver-convention` plugin in `settings.gradle.kts`.

```kotlin
// In settings.gradle.kts

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.8.0"
}
```

***

### 2. Version Compatibility & Strategy

This is the most critical planning step. The agent is BLOCKED from modifying any build file until a versioning strategy is confirmed.

1.  **Strategy Confirmation**: To minimize risk, the default strategy MUST be to use the **exact same AGP version** the project was previously using. Upgrading AGP and Kotlin simultaneously is a high-risk operation. The agent MUST confirm this baseline strategy with the user before proceeding.
2.  **Consult Official Documentation**: If the user approves an upgrade, the agent MUST then consult official documentation for compatible versions.
    *   **Android Gradle Plugin Releases:** [https://developer.android.com/build/releases/gradle-plugin](https://developer.android.com/build/releases/gradle-plugin)
    *   **Kotlin Language Releases:** [https://kotlinlang.org/docs/releases.html](https://kotlinlang.org/docs/releases.html)

***

### 3. Build Script Migration (`build.gradle.kts`)

The agent MUST apply the following modernizations to the KMP library's `build.gradle.kts` file.

#### 3.1. Modernize Target Hierarchy
Replace `targetHierarchy.default()` with `targetHierarchy.applyDefaultHierarchyTemplate()`.

#### 3.2. Use Modern Compiler Options
Migrate from the legacy `kotlinOptions` to the `compilerOptions` DSL.

#### 3.3. Align Language and API Version
Set the `languageVersion` and `apiVersion` to match the major version of Kotlin being used (e.g., "2.0").

#### 3.4. Fix Ambiguous `all` Method
When configuring compilations, use `forEach {}` instead of `all {}` to avoid ambiguity between the Kotlin stdlib and Gradle API.

#### 3.5. Other Best Practices
-   **`minSdk`**: Ensure a `minSdk` value is defined within the `androidTarget` block.
-   **`optIn`**: Update `optIn` declarations to reflect changes in Kotlin versions (e.g., `ExperimentalEncodingApi` may no longer be experimental in Kotlin 2.0 and can be removed or changed to `ExperimentalStdlibApi`).

***

### 4. Code Craftsmanship & Documentation

- **Mandatory Commenting**: All code modifications made to Gradle build scripts (`.kts`) or property files MUST be accompanied by clear, concise comments explaining the *reason* for the change. This is critical for future maintenance and traceability.

***

### 5. Respect Existing Project Structure

The agent MUST preserve the project's existing architectural decisions.

-   **No Forced Version Catalog (`libs.versions.toml`)**: If the project applies plugins using the "old style" (e.g., `id("com.android.library")`), the agent is BLOCKED from introducing or migrating to a `libs.versions.toml` version catalog.
-   **Preserve Dependency Versions**: Do not change dependency versions (e.g., `<ktor>`) unless explicitly instructed.

***

### 6. Build, Verification, and Confirmation

The agent MUST verify the changes by running a build command and is BLOCKED from committing or suggesting a PR merge until the build succeeds.

```bash
# Run a clean build or check command from the project root
./gradlew --no-build-cache check
```

***

### 7. Related Conversations & Traceability

This rule was established based on the findings and procedural resolutions documented in the following session:

*   [KMP Gradle Upgrade Protocol Derivation](./conversations/2024-05-23-kmp-upgrade-protocol-derivation.md)
