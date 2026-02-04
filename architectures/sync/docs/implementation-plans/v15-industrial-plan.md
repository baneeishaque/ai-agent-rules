# Industrial Sync Goal: Zero-Backend, Zero-Action Auto-Sync

This document defines the technical objectives for implementing a background, invisible data synchronization layer.

## Architectural Objectives

1. **Industrial Portability**: All logic, rules, and logs are part of the `ai-agent-rules` submodule.
2. **Generic Identity**: Abstracted from specific fields (Email) to a "Stable Identifier" discovery pattern.
3. **Performance Abstraction**: Mandates **60 FPS UI stability** via background process (Web Worker) isolation.
4. **SSOT & Stability**: Uses Enums for inter-thread messaging and decoupled JSON for environment configuration.
5. **Hardened Security**: ASM (WASM) binary encapsulation of salts.

## Component Specification

- **Reference Implementation**: `ai-agent-rules/architectures/sync/`
- **Rule Entry Point**: `ai-agent-rules/zero-backend-sync-rules.md`
- **Context Discovery**: Assistant MUST confirm build tool and identifier before implementation.

## Tech Stack Hierarchy

- **Buffer**: Nostr Relay Mesh (Kind 30078).
- **Storage**: RxDB + IndexedDB (Standard) -> NoSQL -> File based on complexity.
- **Crypto**: AES-256-GCM + PBKDF2 (100k iterations).
