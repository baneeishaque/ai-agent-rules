# Zero-Backend Sync: Industrial Integration Guide

This guide provides a high-fidelity walkthrough for integrating the background sync engine into a production React application.

## 1. Environment Setup

Confirm your environment before implementation:
- **Build Tool**: CRA (requires CRACO) or Vite (requires `vite-plugin-wasm`).
- **Identifier**: Determine the stable identifier (e.g., `user.email`) from your app's session state.
- **WASM Support**: In a CRA project, use a `craco.config.js` to inject the `wasm-loader`.

### Install Dependencies
```bash
npm install rxdb nostr-tools rxjs
npm install @craco/craco assemblyscript --save-dev
```

## 2. Industrial Folder Restructuring

Copy the reference architecture into your project to maintain the industrial standard:
```bash
mkdir -p src/services/sync/worker
cp ai-agent-rules/architectures/sync/*.ts src/services/sync/
cp ai-agent-rules/architectures/sync/config.json src/services/sync/
cp ai-agent-rules/architectures/sync/worker/*.ts src/services/sync/worker/
```

## 3. Webpack Modification (CRACO)

Building `.wasm` in CRA requires a `craco.config.js` in your root. This allows you to add advanced features without ejecting:

```javascript
module.exports = {
  webpack: {
    configure: (config) => {
      // Enable WASM and Worker Support
      config.experiments = { 
        ...config.experiments,
        asyncWebAssembly: true,
        syncWebAssembly: true 
      };
      
      // Handle .wasm files via Webpack's wasm-loader
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });

      return config;
    }
  }
};
```
**Important**: Update your `package.json` scripts to use `craco start`, `craco build`, etc.

## 4. Identity Discovery & Initialization

Inside your app entry point (e.g., `App.tsx`), implement silent discovery:

```typescript
import { SyncEngine } from './services/sync/engine';

function App() {
  useEffect(() => {
    // 1. Context Discovery: Detect User Identifier
    // We use the session email. Support for Compound IDs (Email + Salt) is built-in.
    const userIdentifier = auth.session.user.email; 

    // 2. Initialize the Sync Engine (Background Thread)
    SyncEngine.init(userIdentifier, (remoteData) => {
      // 3. Reactive Storage Upsert
      // When remote data arrives, RxDB merges it and triggers UI reactivity.
      storageHandler.upsert(remoteData.key, remoteData.value);
    });
  }, []);

  return <div>Industrial Zero-Backend Sync Active</div>;
}
```

## 5. Storage Layer (RxDB)

Initialize your RxDB collection using the schema in `storage.ts`.
- **Primary Key**: The `id` field (max length 100) is the primary key. 
- **Value**: Supports complex nested JSON or Arrays with **runtime safety**.
- **Timestamp**: Uses numeric Epoch for cross-device conflict resolution.

## 6. Verification Protocol

1.  **Real-time Check**: Open two browsers. Change a setting in one. Verify the update appears in the second in **< 500ms**.
2.  **Persistence Check**: Close both browsers. Re-open. Verify state is recovered from the Nostr Mesh.
3.  **Security Check**: Inspect Network traffic. Verify all content is **encrypted** (ciphertext) and the **Salt** is absent from the JS bundle (**Hardened in WASM**).
4.  **WASM MIME Type**: Verify that your host serves `.wasm` files with the `application/wasm` header.
