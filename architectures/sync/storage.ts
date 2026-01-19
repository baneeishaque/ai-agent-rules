/**
 * RxDB Schema and Data Layer (Industrial Reference)
 * Handles structured, relational, and reactive storage for synced data.
 */

import { RxJsonSchema, RxCollection } from 'rxdb';

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
  value: any;

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
      // Multi-type support for complex settings
      type: ['object', 'array', 'string', 'number', 'boolean', 'null'] 
    }, 
    updatedAt: { type: 'number', minimum: 0 }
  },
  required: ['id', 'value', 'updatedAt']
};

export class SyncStorageHandler {
  constructor(private collection: RxCollection<PreferenceDoc>) {}

  /**
   * Persists data locally and triggers reactivity.
   */
  async upsert(id: string, value: any) {
    return await this.collection.upsert({
      id,
      value,
      updatedAt: Date.now()
    });
  }

  /**
   * Reactive subscription for UI synchronization.
   */
  watchAllChanges(callback: (docs: PreferenceDoc[]) => void) {
    return this.collection.find().$.subscribe(callback);
  }

  /**
   * Generic query for a specific preference scope.
   */
  async getById(id: string): Promise<any | null> {
    const doc = await this.collection.findOne(id).exec();
    return doc ? doc.value : null;
  }
}
