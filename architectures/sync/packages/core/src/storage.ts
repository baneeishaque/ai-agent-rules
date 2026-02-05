import type { RxJsonSchema, RxCollection } from 'rxdb';
import type { SyncData } from './types';

/**
 * Data Layer: RxDB Standard Implementation.
 * Standardizes how information is structured, queried, and updated in a local-first application.
 */

/**
 * Single Source of Truth for Preference Document
 */
export interface PreferenceDoc {
  /** 
   * Unique ID (Primary Key). 
   * length: 25-100 recommended for stability.
   */
  id: string;

  /** 
   * Complex value container (Objects, Arrays, Primitives).
   */
  value: SyncData;

  /** 
   * Timestamp in Epoch Milliseconds (Industrial Standard for sorting/merging).
   */
  updatedAt: number;
}

export const PreferenceSchema: RxJsonSchema<PreferenceDoc> = {
  title: 'Preference Schema',
  version: 0,
  description: 'Stores and tracks cross-device synced preferences',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    value: {
      // Multi-type support for deeply nested structures
      type: ['object', 'array', 'string', 'number', 'boolean', 'null']
    },
    updatedAt: {
      type: 'number',
      minimum: 0
    }
  },
  required: ['id', 'value', 'updatedAt']
};

export class SyncStorageHandler {
  constructor(private collection: RxCollection<PreferenceDoc>) { }

  /**
   * Persists data locally and triggers reactivity.
   */
  async upsert(id: string, value: SyncData) {
    return await this.collection.upsert({
      id,
      value,
      updatedAt: Date.now()
    });
  }

  /**
   * Reactive subscription for UI synchronization.
   * Fires whenever the local database is updated (manually or via sync).
   * @param callback - Function receiving the latest collection state
   */
  watchAllChanges(callback: (docs: PreferenceDoc[]) => void) {
    // Leveraging RxDB's observable stream for sub-millisecond UI updates
    return this.collection.find().$.subscribe(callback);
  }

  /**
   * Generic query for a specific preference scope.
   */
  async getById(id: string): Promise<SyncData | null> {
    try {
      const doc = await this.collection.findOne(id).exec();
      // Industrial Standard: Manual cast with runtime null check
      if (!doc || !doc.value) return null;

      // Defensive parsing/casting
      return doc.value as SyncData;
    } catch (err: unknown) {
      console.error('[SyncStorage] Query failed for id:', id, err);
      return null;
    }
  }
}
