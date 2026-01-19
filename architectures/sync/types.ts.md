# types.ts Explainer

This file defines the **Single Source of Truth (SSOT)** for all data structures and message types used in the sync engine.

### Code Breakdown

- **SyncMessageType (Enum)**:
    - **Purpose**: Defines all valid message types exchanged between the Main thread (`engine.ts`) and the background thread (`worker/index.ts`).
    - **Why Enum?**: Prevents "magic string" typos that cause silent failures in inter-process communication.
    - **Types**:
        - `INIT`: Signal to initialize identity and relays.
        - `READY`: Signal from worker that identity is established.
        - `SYNC_OUT`: Pushing local changes to the relay mesh.
        - `SYNC_RECEIVED`: Incoming changes from the relay mesh.
        - `ERROR`: Standardized error reporting.

- **SyncMessage (Interface)**:
    - **Purpose**: Wraps all postMessage payloads in a consistent structure `{ type, payload }`.

- **SyncConfig (Interface)**:
    - **Purpose**: Typed structure for `config.json`. Ensures relay lists and salts are accessed safely.

- **InitPayload / SyncPayload**:
    - **Purpose**: Payloads for specific message types.
    - **identitySeed**: Abstracted identifier (can be Email, PubKey, or a compound ID like `user_id + platform_id`).

### Usage Scenario
When the UI thread needs to push a change, it sends a `SYNC_OUT` message. The worker receives this, encrypts the data, and broadcasts it to the Nostr mesh.
