<!--
title: Zero-Backend Auto-Sync Rules
description: Architecture and implementation standards for background, invisible data synchronization using decentralized relays (Nostr), local-first storage (RxDB), and WASM hardening.
category: Architecture & Sync
-->

# Zero-Backend Auto-Sync Rules

This rule defines the standard protocol for cross-device data synchronization in environments where a traditional backend is unavailable or involvement is prohibited. It ensures 100% backgrounded, invisible, and secure sync by bridging devices via a decentralized "Central Buffer."

**Core Principles**:
- **Zero User Intervention**: Sync MUST be invisible and automatic. Zero user action is mandatory for industrial-grade UX.
- **Local-First Mesh**: The solution MUST follow a local-first architecture (e.g., RxDB) to ensure offline availability and sub-millisecond responsiveness. Data persistence is immediate; UI reads/writes only to the local architecture instance without waiting for network ACK. **Do not wait for network acknowledgment to update the UI.**
- **Asynchronous Bridge & Real-Time Buffer**: Utilize a decentralized relay mesh (e.g., Nostr Protocol - Event Kind 30078 - Application Data) for cross-device bridging (Device A pushes status, Device B pulls it later). Relays act as a persistent storage for the latest "state event," allowing asynchronous sync.
- **Real-Time Reliability**: Target sub-second synchronization (< 500ms) between online devices using a global WebSocket mesh. Nostr relays handle millions of events daily and are as fast as real-time chat.

***

### 1. Context Discovery & Confirmation (Mandatory)

Before implementation, the assistant MUST perform the following discovery steps and obtain explicit user confirmation for each. This ensures the chosen technology stack fits the specific context:

1.  **Platform Environment (Context Discovery)**: Detect the build tool (Vite, Webpack, CRA) and framework (React, Vue).
    - **CRA / Webpack**: Building `.wasm` in CRA requires one config file (`craco.config.js`). Use **CRACO** to inject Webpack's `wasm-loader` via `@craco/craco` without ejecting. This is the standard way to add advanced features without losing CRA benefits.
    - **Vite**: Use the `vite-plugin-wasm` and `top-level-await` plugins.
    - **WASM MIME Type**: Ensure the server/environment serves `.wasm` files with `application/wasm` headers.
    - **Confirmation**: The assistant MUST propose the discovered environment and obtain explicit user confirmation before proceeding.
2.  **Unique Stable Identifier**: Identify a stable identifier (e.g., User Email, PubKey, or a Compound ID) found in the app session.
    - **Discovery Protocol**: Identify the identifier(s) silently from existing application state without explicit logins or user prompts.
    - **Confirmation**: The assistant MUST propose the discovered identifier(s) and obtain user confirmation. Sometimes the identifier will be a compound of multiple attributes.
3.  **Storage Context**: Evaluate data complexity and choose the best-fit storage layer (Prioritized):
    - **1. Relational/Reactive (RxDB + IndexedDB)**: Mandatory for complex data and reactive multi-device merges.
    - **2. NoSQL (PouchDB / Simple IndexedDB)**: Preferred for document-centric storage.
    - **3. File/Text (JSON/YAML/CSV)**: Only for extremely low-complexity, static data with **no indexing or relational capacity**.
    - **Decision Protocol**: Present all options in the sorted way (According to priority) above. Final decision MUST be according to context, discussion, and user approval - even for the file format in the third case.

***

### 2. Core Architecture (Industrial SSOT)

Implementations MUST follow the industrial folder structure to ensure maintainability and Single Source of Truth ([Reference Architecture Implementation](./architectures/sync/)).

#### 2.1 Standard Directory Structure
- `lib/types.ts`: Enums for all message types and recursive data interfaces ([Explainer](./architectures/sync/lib/types.ts.md)).
- `lib/config.json`: Decoupled configuration for relays and salts. **Hardcoding relays in logic is PROHIBITED.** ([Explainer](./architectures/sync/lib/config.json.md)).
- `lib/engine.ts`: Main thread bridge and lifecycle manager ([Explainer](./architectures/sync/lib/engine.ts.md)).
- `lib/worker/index.ts`: Background thread logic (Web Worker) ([Explainer](./architectures/sync/lib/worker/index.ts.md)).
- `lib/worker/crypto.asm.ts`: AssemblyScript (WASM) logic for identity hardening ([Explainer](./architectures/sync/lib/worker/crypto.asm.ts.md)).
- `lib/storage.ts`: Data access layer ([Explainer](./architectures/sync/lib/storage.ts.md)).

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
    - **Industrial Standard**: All major browsers (even mobile) promote it to a **"first-class"** language alongside JS. Used by companies like **Adobe** and **Figma** to protect performance-critical and proprietary logic.
    - **Security Conclusion**: While not 100% unbreakable, WASM is the highest bar available for frontend-only secret protection and is the future-proof standard for performance-critical logic.
    - **WASM MIME Type**: Ensure the host environment serves `.wasm` files with `application/wasm` headers.

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

- **Architectural Discussion**: [Zero-Backend Preferences Sync Implementation](../conversations/2026-01-15-zero-backend-preferences-sync.md)
- **Goal Document**: [Industrial Sync Plan (v15)](./architectures/sync/docs/implementation-plans/v15-industrial-plan.md)
- **Reference Implementation**: [Sync Architecture Template Package](./architectures/sync/lib/)
