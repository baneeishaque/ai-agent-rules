# Storage Logic Explainer (`storage.ts`)

[View Source File](./storage.ts)

This file defines the **Data Layer** using RxDB. It standardizes how information is structured, queried, and updated in a local-first application.

The storage layer utilizes **RxDB (Reactive Database)** over IndexedDB. This ensures that the application follows a **Local-First** architecture.

## Code Breakdown

- **PreferenceDoc (Interface)**:
  - **id**: Primary Key. Length 25-100 is recommended to provide enough entropy for compound identifiers (e.g., `user:settings`) while remaining indexed-efficient.
  - **value**: Flexible container. Supports **Arrays**, **Objects**, **Primitives**, and **Null**.
  - **updatedAt**: Industrial standard numeric Epoch (milliseconds).
    - **Why number?**: Native sorting in databases is significantly faster for numbers than string date formats. All modern JS `Date.now()` calls return this format.
- **PreferenceSchema**:
  - **type: ['object', 'array', ...]**: This is a multi-type schema definition. It ensures that the `value` field can store complex structures like a list of favourite items (`array`) or a deep settings object (`object`) with **runtime safety**. If you try to save a type not in this list, RxDB will throw an error before it touches the disk. This ensures both compile-time (TypeScript) and runtime (RxDB Schema) safety.
- **SyncStorageHandler**:
  - **upsert()**: Atomic "Update or Insert". This is the engine of the sync process. When remote data arrives, we upsert it to the local store.
  - **watchAllChanges()**:
    - **Use Case**: This is for **Reactivity**. Your UI components can subscribe to this stream. If data changes in the background (via sync), the UI updates automatically without a page refresh or manual pull.
  - **getById()**: Basic query for a specific preference scope.

## Usage Scenario

If a user adds a new item to their "Favourites" array on Device A:

1. Device A calls `upsert`.
2. Sync Engine detects the change and pushes to the mesh.
3. Device B receives the change via the worker.
4. Device B calls `upsert` in its local RxDB.
5. All UI components on Device B subscribed via `watchAllChanges` update immediately.
6. **Result**: Seamless cross-device experience.

## Industrial Schema Design (`PreferenceSchema`)

- **Primary Key (`id`)**:
  - **Industrial Mandate**: A stable, unique ID is required to prevent duplicate records when merging data from multiple devices. Length 25-100 is recommended for compound identifiers.
- **Value Container (`SyncData`)**:
  - **type: ['object', 'array', ...]**: This is a multi-type schema definition. It ensures that the `value` field can store complex structures like a list of favourite items (`array`) or a deep settings object (`object`) with **runtime safety**. If you try to save a type not in this list, RxDB will throw an error before it touches the disk.
- **Atomic Timestamp (`updatedAt`)**:
  - **Why number?**: Native sorting in databases is significantly faster for numbers than string date formats. We use `Date.now()` (milliseconds) for **Conflict Resolution (LWW - Last Write Wins)**.

## Reactive Data Layer (`SyncStorageHandler`)

- **upsert()**:
  - **Definition**: "Update or Insert." It effectively handles both new preferences and modifications to existing ones.
- **watchAllChanges() (The "Magic" of Reactivity)**:
  - **How it works**: This method returns an observable stream. When the background sync worker updates the local database with data from another device, this stream automatically emits the new data.
  - **UI Impact**: Your UI components can subscribe to this. The UI updates instantly (sub-millisecond) without the user ever clicking "Refresh."

## Pedagogical Note: Type vs. Runtime Safety

While `SyncData` (in `types.ts`) provides **Compile-Time** safety in TypeScript, the `RxJsonSchema` provides **Runtime** safety. Together, they ensure that your sync mesh never gets corrupted by faulty data structures.
