/**
 * Sync Engine Types and Enums (SSOT)
 */

export enum SyncMessageType {
  INIT = 'INIT',
  READY = 'READY',
  SYNC_OUT = 'SYNC_OUT',
  SYNC_RECEIVED = 'SYNC_RECEIVED',
  SYNC_IN = 'SYNC_IN',
  ERROR = 'ERROR'
}

export interface SyncMessage<T = any> {
  type: SyncMessageType;
  payload: T;
}

export interface SyncConfig {
  relays: string[];
  platformSalt: string;
  nostrKind: number;
  defaultDTag: string;
}

export interface InitPayload {
  identitySeed: string; // Generic: can be email, pubkey, or compound ID
}

export interface SyncPayload {
  data: any;
}
