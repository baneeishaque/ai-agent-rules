# Sync Architecture Integration Guide (Industrial PoC)

This guide provides a step-by-step walkthrough to implement a **Zero-Backend Preferences Sync** Proof of Concept (PoC) in a React application.

## 1. Environment Setup
The standard for this PoC is **React with Create-React-App (CRA)**.

### Install Dependencies
```bash
npm install rxdb nostr-tools rxjs --save
npm install @craco/craco assemblyscript --save-dev
```

## 2. Industrial Folder Restructuring
Copy the reference architecture into your project:
```bash
mkdir -p src/services/sync/worker
cp ai-agent-rules/architectures/sync/*.ts src/services/sync/
cp ai-agent-rules/architectures/sync/config.json src/services/sync/
cp ai-agent-rules/architectures/sync/worker/*.ts src/services/sync/worker/
```

## 3. Webpack Modification (CRACO)
Building `.wasm` in CRA requires a `craco.config.js` in your root:

```javascript
// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Enable WASM support
      webpackConfig.experiments = {
        ...webpackConfig.experiments,
        asyncWebAssembly: true,
      };
      
      // Handle .wasm files
      webpackConfig.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });

      return webpackConfig;
    },
  },
};
```
**Important**: Update your `package.json` scripts to use `craco start`, `craco build`, etc.

## 4. Identity Discovery & Initialization
Inside your app entry point (e.g., `App.tsx`):

```typescript
import { SyncEngine } from './services/sync/engine';
import { SyncStorageHandler } from './services/sync/storage';

function App() {
  useEffect(() => {
    // 1. Context Discovery: Detect User Identifier
    // In this PoC, we use the session email. Support for Compound IDs (Email + Salt) is built-in.
    const userIdentifier = auth.session.user.email; 

    // 2. Initialize the Sync Engine (Background Thread)
    SyncEngine.init(userIdentifier, (remoteData) => {
      // 3. Reactive Storage Upsert
      // When remote data arrives, RxDB merges it and triggers UI reactivity.
      storageHandler.upsert(remoteData.key, remoteData.value);
    });
  }, []);
}
```

## 5. Storage Layer (RxDB)
Initialize your RxDB collection using the schema in `storage.ts`.
- **Primary Key**: The `id` field (max length 100) is the primary key. 
- **Value**: Supports complex nested JSON or Arrays.
- **Timestamp**: Uses numeric Epoch for cross-device conflict resolution.

## 6. Verification Protocol
1. **Real-time Check**: Open two browsers. Change a setting in one. Verify the update appears in the second in **< 500ms**.
2. **Persistence Check**: Close both browsers. Re-open. Verify state is recovered from the Nostr Mesh.
3. **Security Check**: Inspect Network traffic. Verify all content is **encrypted** (ciphertext) and the **Salt** is absent from the JS bundle (Hardened in WASM).
