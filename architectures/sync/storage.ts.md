# storage.ts Explainer

This file defines the **Data Layer** using RxDB. It standardizes how information is structured, queried, and updated in a local-first application.

### Code Breakdown

- **PreferenceDoc (Interface)**:
    - **id**: Primary Key. Length 25-100 is recommended to provide enough entropy for compound identifiers (e.g., `user:settings`) while remaining indexed-efficient.
    - **value**: Flexible container. Supports **Arrays**, **Objects**, **Primitives**, and **Null**.
    - **updatedAt**: Industrial standard numeric Epoch (milliseconds).
        - **Why number?**: Native sorting in databases is significantly faster for numbers than string date formats. All modern JS `Date.now()` calls return this format.

- **PreferenceSchema**:
    - **type: ['object', 'array', ...]**: This is a multi-type schema definition. It ensures that the `value` field can store complex structures like a list of favorite items (`array`) or a deep settings object (`object`) with runtime safety.

- **SyncStorageHandler**:
    - **upsert()**: Atomic "Update or Insert". This is the engine of the sync process. When remote data arrives, we upsert it to the local store.
    - **watchAllChanges()**: 
        - **Use Case**: This is for **Reactivity**. Your UI components can subscribe to this stream. If data changes in the background (via sync), the UI updates automatically without a page refresh or manual pull.
    - **getById()**: Basic query for a specific preference scope.

### Usage Scenario
If a user adds a new item to their "Favorites" array on Device A:
1. Device A calls `upsert`.
2. Sync Engine detects the change and pushes to the mesh.
3. Device B receives the change via the worker.
4. Device B calls `upsert` in its local RxDB.
5. All UI components on Device B subscribed via `watchAllChanges` update immediately.
6. **Result**: Seamless cross-device experience.
