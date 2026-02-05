/**
 * Sync Engine (Reference Implementation)
 * Acts as the main-thread bridge between the UI and the decentralized background mesh.
 * Manages the singleton lifecycle of both the worker and the local-first database.
 */

import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { SyncMessageType, SyncMessage, SyncData, SyncPayload } from './types';
import { PreferenceSchema, SyncStorageHandler, PreferenceDoc } from './storage';

export class SyncEngine {
  /** Singleton instance of the background worker thread */
  private static worker: Worker;

  /** Handle for the Local-First database (RxDB) */
  private static storage: SyncStorageHandler;

  /** Reactive callback for UI state updates */
  private static onUpdateCallback: (data: SyncData) => void;

  /** Prevent double-initialization during React Strict Mode */
  private static isInitializing = false;

  /**
   * Initializes the sync engine singleton.
   * Performs three primary steps: 
   * 1. Sets up RxDB.
   * 2. Spawns the background SyncWorker.
   * 3. Establishes a reactive bridge between them.
   * 
   * @param identitySeed - User identifier(s) (e.g., Email, CID) to derive keys from.
   * @param onUpdate - Callback fired whenever the local state changes.
   */
  static async init(identitySeed: string | string[], onUpdate: (data: SyncData) => void) {
    if (this.worker || this.isInitializing) {
      console.warn('[SyncEngine] INIT: Engine already active or initializing. Ignoring multi-init.');
      return;
    }

    this.isInitializing = true;
    console.log('[SyncEngine] INIT: Bootstrapping Industrial Sync Stack...');
    this.onUpdateCallback = onUpdate;

    try {
      // 1. Initialize Local-First Storage (RxDB)
      // This ensures data is stored on-disk and available offline.
      const db = await createRxDatabase({
        name: 'sync_engine_db',
        storage: getRxStorageDexie()
      });

      const collections = await db.addCollections({
        preferences: { schema: PreferenceSchema }
      });

      this.storage = new SyncStorageHandler(collections.preferences);
      console.log('[SyncEngine] Storage: Local Database (Dexie) Ready');

      // 2. Initialize Worker for Mesh Sync
      // Offloads E2EE, PBKDF2, and WebSockets to a dedicated thread.
      this.worker = new Worker(new URL('./worker/index.ts', import.meta.url));

      this.worker.onmessage = (event: MessageEvent<SyncMessage<unknown>>) => {
        this.handleWorkerMessage(event.data);
      };

      // 3. Reactively Bridge Storage to UI
      // Whenever RxDB updates (locally or via worker), we notify the React UI.
      this.storage.watchAllChanges((docs: PreferenceDoc[]) => {
        const mainDoc = docs.find(d => d.id === 'app_preferences');
        if (mainDoc && this.onUpdateCallback) {
          this.onUpdateCallback(mainDoc.value);
        }
      });

      // 4. Initial Handshake with Worker
      const normalizedSeed = Array.isArray(identitySeed) ? identitySeed.join('|') : identitySeed;
      this.worker.postMessage({
        type: SyncMessageType.INIT,
        payload: { identitySeed: normalizedSeed }
      });

    } catch (err) {
      console.error('[SyncEngine] FATAL: Initialization failed', err);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Pushes a local state fragment into the synchronization pipeline.
   * This is a "Fire-and-Forget" operation that updates both local disk and remote mesh.
   * @param data - The state change (e.g., { theme: 'dark' }).
   */
  static pushUpdate(data: SyncData) {
    if (!this.worker || !this.storage) {
      console.warn('[SyncEngine] TX: Skip (Engine not initialized)');
      return;
    }

    // 1. Local Persistence (Immediate)
    // RxDB handles the IndexedDB write.
    this.storage.upsert('app_preferences', data);

    // 2. Remote Broadcast (Backgrounded)
    // Worker handles encryption and publishing.
    this.worker.postMessage({
      type: SyncMessageType.SYNC_OUT,
      payload: { data }
    });

    console.log('[SyncEngine] TX: Update pushed to pipeline');
  }

  /**
   * Internal handler for processing messages coming from the background worker.
   */
  private static handleWorkerMessage(message: any) {
    try {
      // Runtime Safety Check
      if (!message || typeof message !== 'object') return;

      const { type, payload } = message as SyncMessage<unknown>;

      switch (type) {
        case SyncMessageType.READY:
          console.log('[SyncEngine] MESH: Backend Bridge Active (Nostr + WASM Established)');
          break;

        case SyncMessageType.SYNC_RECEIVED:
          if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
            const syncData = (payload as SyncPayload).data;
            // Atomic update to local-first storage
            this.storage.upsert('app_preferences', syncData);
          }
          break;

        case SyncMessageType.ERROR:
          console.error('[SyncEngine] MESH: Background error reported', (payload as { message: string }).message);
          break;

        default:
          console.debug('[SyncEngine] WORKER: Undocumented event', type);
      }
    } catch (err) {
      console.error('[SyncEngine] FATAL: Background message parsing failed', err);
    }
  }
}
