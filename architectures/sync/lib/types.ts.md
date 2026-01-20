# Sync Types Explainer (`types.ts`)

[View Source File](./types.ts)

This file defines the **Single Source of Truth (SSOT)** for all data structures and message types used in the sync engine. It ensures that the Main thread and the Web Worker speak the same language.

### Code Breakdown

- **SyncMessageType (Enum)**:
    - **Purpose**: Defines all valid message types exchanged between the Main thread (`engine.ts`) and the background thread (`worker/index.ts`).
    - **Industrial Mandate**: Using Enums prevents "magic string" typos that cause silent failures in inter-process communication.
    - **Messages**:
        - `INIT`: Signal to initialize identity and relays.
        - `READY`: Signal from worker that identity is established.
        - `SYNC_OUT`: Pushing local changes to the relay mesh.
        - `SYNC_RECEIVED`: Incoming changes from the relay mesh.
        - `ERROR`: Standardized error reporting.

- **SyncMessage (Interface)**:
    - **Purpose**: Wraps all `postMessage` payloads in a consistent structure `{ type, payload }`.
    - **Type Safety**: Uses `unknown` for the payload to force the developer to cast it to a specific sub-type (like `InitPayload`), preventing runtime crashes.

- **SyncConfig (Interface)**:
    - **Purpose**: Typed structure for [config.json](./config.json). Ensures relay lists and salts are accessed safely by the worker without hardcoding ([Config Explainer](./config.json.md)).

- **SyncData (Interface)**:
    - **Industrial Standard**: Instead of `any`, we use a recursive record type. This enforces that the data being synced is a valid JSON-like object (strings, numbers, booleans, nested objects/arrays).

- **InitPayload / SyncPayload**:
    - **Purpose**: Payloads for specific message types.
    - **identitySeed**: Abstracted identifier (can be Email, PubKey, or a compound ID like `user_id + platform_id`).

### Usage Scenario
When the UI thread needs to push a change, it constructs a `SyncMessage<SyncPayload>` with `type: SyncMessageType.SYNC_OUT`. The worker receives this `MessageEvent`, verifies the type, and proceeds to encrypt the `data` before broadcasting.
