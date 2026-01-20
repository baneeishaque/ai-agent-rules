<!--
title: Zero-Backend Auto-Sync Rules
description: Architecture and implementation standards for background, invisible data synchronization using decentralized relays (Nostr), local-first storage (RxDB), and WASM hardening.
category: Architecture & Sync
-->

# Zero-Backend Auto-Sync Rules

This rule defines the standard protocol for cross-device data synchronization in environments where a traditional backend is unavailable or involvement is prohibited. It ensures 100% backgrounded, invisible, and secure sync by bridging devices via a decentralized "Central Buffer."

**Core Principles**:
- **Zero User Intervention**: Sync MUST be invisible and automatic. Zero user action is mandatory for industrial-grade UX.
- **Local-First Mesh**: The solution MUST follow a local-first architecture (e.g., RxDB) to ensure offline availability and sub-millisecond responsiveness. Data persistence is immediate; UI reads/writes only to the local architecture instance without waiting for network ACK.
- **Asynchronous Bridge**: Utilize a decentralized relay mesh (e.g., Nostr) to bridge devices asynchronously and in real-time. This ensures architecture-level reliability (Device A pushes status, Device B pulls it later) even if devices are never online at the same time.
- **Real-Time Reliability**: Target sub-second synchronization (< 500ms) between online devices using a global WebSocket mesh (e.g., Nostr) which handles millions of events daily.

***

### 1. Context Discovery & Confirmation (Mandatory)

Before implementation, the assistant MUST perform the following discovery steps and obtain explicit user confirmation for each. This ensures the chosen technology stack fits the specific context:

1.  **Platform Environment**: Detect the build tool (e.g., Vite, Webpack, CRA) and framework (e.g., React, Vue).
    - **CRA / Webpack**: Building `.wasm` in CRA requires **CRACO** to inject Webpack's `wasm-loader` without ejecting. This is the industrial standard.
    - **Confirmation**: The user MUST confirm the discovered environment before implementation.
2.  **Unique Identifier (Identity Discovery)**: The assistant MUST identify the stable identifier already available in the app session (e.g., User Email, PubKey, or a Compound ID).
    - **Zero Prompts**: Identity MUST be derived silently from existing application state without explicit logins or user prompts.
    - **Confirmation**: The user MUST confirm the discovered identifier(s) before proceeding.
3.  **Storage Context**: Evaluate data complexity and choose the best-fit storage layer (Prioritized):
    - **1. Relational/Reactive (RxDB + IndexedDB)**: Mandatory for complex data, multi-device merges, and relational needs.
    - **2. NoSQL (PouchDB / Simple IndexedDB)**: Preferred for document-centric storage without complex relations.
    - **3. File/Text (JSON/YAML/CSV)**: Only for extremely low-complexity, static data with **no indexing or relational capacity**.

***

### 2. Core Architecture (Industrial SSOT)

Implementations MUST follow the industrial folder structure to ensure maintainability and Single Source of Truth ([Reference Architecture Implementation](./architectures/sync/)).

#### 2.1 Standard Directory Structure
- `types.ts`: Enums for all inter-process message types and data interfaces ([Explainer](./architectures/sync/types.ts.md)).
- `config.json`: Decoupled configuration for relays, salt, and constants. **Hardcoding relays in logic is PROHIBITED.** ([Explainer](./architectures/sync/config.json.md)).
- `engine.ts`: Main thread bridge and lifecycle manager ([Explainer](./architectures/sync/engine.ts.md)).
- `worker/index.ts`: Background thread logic (Web Worker) ([Explainer](./architectures/sync/worker/index.ts.md)).
- `worker/crypto.asm.ts`: AssemblyScript (WASM) logic for identity hardening ([Explainer](./architectures/sync/worker/crypto.asm.ts.md)).
- `storage.ts`: Data access layer (RxDB/NoSQL/File) ([Explainer](./architectures/sync/storage.ts.md)).

#### 2.2 Performance & UI Stability (60 FPS Goal)
- **Background-Only**: All cryptographic hashing (PBKDF2), encryption (AES-GCM), and **Network Operations** MUST reside in a background process (e.g., Web Worker).
- **Prohibited**: The main UI thread MUST NOT execute heavy logic that causes frame drops.

#### 2.3 Real-time Reactivity
- **Protocol**: Use **WebSockets** for the relay bridge.
- **Speed**: Target sub-second synchronization (< 500ms) between online devices. Nostr relays handle millions of events daily and are as fast as real-time chat.

***

### 3. Identity & Security (Blind Vault)

#### 3.1 Key Derivation Logic
- **Silent Derivation**: Identity MUST be derived silently from existing app state without explicit logins or prompts. 
- **Keys**: Generate a **Nostr Private Key** and a **Symmetric AES-256 Key** using **PBKDF2** (>= 100,000 iterations).
- **Hardening (WASM)**: The Salt MUST NOT be stored as a plain string in JS. Use **AssemblyScript (WASM)** to encapsulate the salt and derivation logic, creating a cryptographic "Black Box."
    - **Why WASM?**: Frontend secrets have two options:
        - **Option A (Plain JS)**: Very easy to find via "Inspect Source" or simple string-scraping from JS bundles.
        - **Option B (WASM Binary)**: Requires a specialist with reverse-engineering tools. It prevents 99% of casual extraction attempts.
    - **Industrial Standard**: WASM is the biggest shift in web technology in 20 years. All major browsers promote it to a **"first-class"** language.
    - **Conclusion**: While not 100% unbreakable, WASM is the highest bar available for frontend-only secret protection and is the future-proof standard for performance-critical logic.

#### 3.2 End-to-End Encryption (E2EE)
- **Mandatory**: All data MUST be encrypted using **AES-GCM** *before* transmission.
- **Relay Blindness**: The relay mesh (e.g., Nostr Kind 30078) stores only the **ciphertext**. It acts as a "Blind Vault" with zero access to plain user data.

***

### 4. Technical Guardrails & Trade-offs

- **Redundancy**: Connect to at least 3 high-uptime relays (e.g., `wss://nos.lol`, `wss://relay.damus.io`, `wss://relay.nostr.band`).
- **Failover**: The client MUST automatically failover between relays if a connection drops.
- **Schema Management**: Use strict schemas (e.g., RxDB JSON Schema) to prevent data corruption during cross-device merges.
- **No Plaintext Fallback**: If encryption fails, the sync MUST fail securely rather than transmitting plaintext.

***

### 5. Prohibited Behaviors

- **DO NOT** use `localStorage` for primary sync data (performance/race condition risk).
- **DO NOT** use "magic strings" for worker messages; **Enums are mandatory** for inter-thread passing.
- **DO NOT** prompt the user for "Enable Sync" or "Login" if a unique identifier is available; sync MUST be silent.
- **DO NOT** hardcode environment-specific parameters (Relay URLs, Salts) in logic files.
- **DO NOT** block the UI during key derivation or relay sync; offload to Workers.
- **DO NOT** store API keys or Anon Keys in plain text if a decentralized alternative exists.
- **DO NOT** fallback to plaintext transmission if encryption fails; the sync must fail securely.
- **DO NOT** rely on a single relay; the client MUST implement **Relay Fallback** and failover between mesh points automatically.

***

### 6. Related Conversations & Traceability

- **Architectural Discussion**: [Zero-Backend Preferences Sync Implementation](./conversations/2026-01-15-zero-backend-preferences-sync.md)
- **Goal Document**: [Industrial Sync Plan (v15)](./architectures/sync/docs/implementation-plans/v15-industrial-plan.md)
- **Reference Implementation**: [Sync Architecture Template Package](./architectures/sync/)
