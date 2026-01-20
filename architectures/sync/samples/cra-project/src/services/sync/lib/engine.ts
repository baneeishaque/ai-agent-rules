/**
 * Sync Engine (Reference Implementation)
 */

import { SyncMessageType, SyncMessage, InitPayload, SyncData, SyncPayload } from './types';

export class SyncEngine {
  // Singleton instance of the background worker
  private static worker: Worker;
  // Reactive UI callback for incoming data
  private static onUpdateCallback: (data: SyncData) => void;

  /**
   * Initializes the sync engine as a singleton.
   * @param identitySeed - Email or Compound ID from app session
   * @param onUpdate - Reactive listener for remote changes
   */
  static init(identitySeed: string | string[], onUpdate: (data: SyncData) => void) {
    if (this.worker) return; // Guard against multi-init
    this.onUpdateCallback = onUpdate;
    this.worker = new Worker(new URL('./worker/index.ts', import.meta.url));

    // Listens for structured messages from the background worker
    this.worker.onmessage = (event: MessageEvent<SyncMessage<unknown>>) => {
      try {
        const data = event.data;
        if (!data || typeof data !== 'object') throw new Error('Invalid worker response');
        
        const { type, payload } = data;

        switch (type) {
          case SyncMessageType.READY:
            console.log('[SyncEngine] Backend Bridge Ready (Nostr + WASM Established)');
            break;
          case SyncMessageType.SYNC_RECEIVED:
            if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
              const syncData = (payload as SyncPayload).data;
              if (this.onUpdateCallback) this.onUpdateCallback(syncData);
            }
            break;
          case SyncMessageType.ERROR:
            console.error('[SyncEngine] Critical Failure:', (payload as { message: string }).message);
            break;
        }
      } catch (err) {
        console.error('[SyncEngine] Error parsing worker message:', err);
      }
    };

    const normalizedSeed = Array.isArray(identitySeed) ? identitySeed.join('|') : identitySeed;
    const initMsg: SyncMessage<InitPayload> = {
      type: SyncMessageType.INIT,
      payload: { identitySeed: normalizedSeed }
    };
    this.worker.postMessage(initMsg);
  }

  /**
   * Pushes local changes to the worker for encryption and broadcast.
   * @param data - The local state fragment to synchronize
   */
  static pushUpdate(data: SyncData) {
    if (!this.worker) return;
    const msg: SyncMessage<SyncPayload> = { 
      type: SyncMessageType.SYNC_OUT, 
      payload: { data } 
    };
    this.worker.postMessage(msg);
  }
}
