/**
 * Sync Engine Types and Enums (SSOT)
 */

export enum SyncMessageType {
  /** Initial handshake: identitySeed -> privateKey derivation */
  INIT = 'INIT',
  /** Worker ready signal: Blind Vault established */
  READY = 'READY',
  /** Outbound: Pushing local state to relay mesh */
  SYNC_OUT = 'SYNC_OUT',
  /** Inbound: Remote state received from relay mesh */
  SYNC_RECEIVED = 'SYNC_RECEIVED',
  /** Internal worker event: Fetching existing state */
  SYNC_IN = 'SYNC_IN',
  /** Standardized error reporting */
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
