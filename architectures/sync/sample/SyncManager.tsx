import React, { useEffect, useState } from 'react';
import { SyncEngine } from '../engine';
import { SyncData } from '../types';

/**
 * SyncManager (Industrial React Boilerplate)
 * Demonstrates silent identity discovery and reactive UI integration.
 */
export const SyncManager: React.FC = () => {
  const [syncedState, setSyncedState] = useState<SyncData>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Context Discovery (Silently find user identifier)
    // Assume currentUser is provided by your Auth Provider.
    const currentUserEmail = 'user@example.com'; 
    const platformId = 'web-v1';
    
    // Industrial Standard: Use a compound ID for increased entropy
    const compoundId = [currentUserEmail, platformId];

    // 2. Singleton Initialization
    SyncEngine.init(compoundId, (newData) => {
      console.log('[SyncManager] Remote update received:', newData);
      // Reactive UI Update
      setSyncedState((prev) => ({ ...prev, ...newData }));
    });

    // 3. Optional: Set Ready state when worker acknowledges
    // This is useful for showing a "Global Sync Active" indicator.
    setIsReady(true);
  }, []);

  const handleUpdate = (key: string, value: any) => {
    const fragment = { [key]: value };
    
    // Local update (Immediate responsiveness)
    setSyncedState((prev) => ({ ...prev, ...fragment }));
    
    // Remote update (Backgrounded)
    SyncEngine.pushUpdate(fragment);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Zero-Backend Sync Manager</h3>
      <p>Status: {isReady ? '✅ Active (Background Bridge Established)' : '⏳ Initializing...'}</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button onClick={() => handleUpdate('theme', 'dark')}>Set Dark Mode</button>
        <button onClick={() => handleUpdate('theme', 'light')}>Set Light Mode</button>
        <button onClick={() => handleUpdate('fontSize', 16)}>Reset Font</button>
      </div>

      <pre style={{ background: '#f4f4f4', padding: '10px', marginTop: '20px' }}>
        {JSON.stringify(syncedState, null, 2)}
      </pre>
    </div>
  );
};
