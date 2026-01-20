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

export interface SyncMessage<T = unknown> {
  type: SyncMessageType;
  /**
   * Raw payload of the message.
   * Typed as unknown to enforce explicit type checking/casting.
   */
  payload: T;
}

export interface SyncConfig {
  relays: string[];
  platformSalt: string;
  nostrKind: number;
  defaultDTag: string;
}

export interface InitPayload {
  /**
   * Identity seed from existing app session.
   * Can be a string (email) or string[] (compound ID).
   */
  identitySeed: string | string[];
}

/**
 * Interface for synchronization data.
 * Replaces 'any' with a structured record for better type safety.
 */
export interface SyncData {
  [key: string]: string | number | boolean | null | undefined | SyncData | Array<string | number | boolean | null | undefined | SyncData>;
}

export interface SyncPayload {
  data: SyncData;
}
