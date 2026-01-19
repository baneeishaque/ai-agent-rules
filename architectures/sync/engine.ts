/**
 * Sync Engine (Reference Implementation)
 */

import { SyncMessageType, SyncMessage, InitPayload } from './types';

export class SyncEngine {
  private static worker: Worker;
  private static onUpdateCallback: (data: any) => void;

  /**
   * Initializes the sync engine.
   * @param identitySeed Unique stable identifier (Email, Composite ID, etc.)
   * @param onUpdate Data change listener
   */
  static init(identitySeed: string, onUpdate: (data: any) => void) {
    this.onUpdateCallback = onUpdate;
    this.worker = new Worker(new URL('./worker/index.ts', import.meta.url));

    this.worker.onmessage = (event: MessageEvent<SyncMessage>) => {
      const { type, payload } = event.data;

      switch (type) {
        case SyncMessageType.READY:
          console.log('[Sync] Ready. Identity Verified.');
          break;
        case SyncMessageType.SYNC_RECEIVED:
          if (this.onUpdateCallback) this.onUpdateCallback(payload.data);
          break;
        case SyncMessageType.ERROR:
          console.error('[Sync] Fault detected:', payload.message);
          break;
      }
    };

    const initMsg: SyncMessage<InitPayload> = {
      type: SyncMessageType.INIT,
      payload: { identitySeed }
    };
    this.worker.postMessage(initMsg);
  }

  static pushUpdate(data: any) {
    if (!this.worker) return;
    const msg: SyncMessage = { type: SyncMessageType.SYNC_OUT, payload: { data } };
    this.worker.postMessage(msg);
  }
}
