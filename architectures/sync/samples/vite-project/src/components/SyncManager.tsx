import React, { useState, useEffect } from 'react';
import { SyncEngine } from '../services/sync/lib/engine';
import { SyncData } from '../services/sync/lib/types';

/**
 * SyncManager: Pedogogical Component
 * Demonstrates silent identity discovery and reactive UI updates in a Vite environment.
 */
export const SyncManager: React.FC = () => {
  const [syncedState, setSyncedState] = useState<SyncData>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Silent Context Discovery
    const currentUserEmail = 'user@example.com'; 
    const platformId = 'prod-v1';
    const compoundId = [currentUserEmail, platformId];

    // 2. Initialize the Sync Engine (Background Thread)
    SyncEngine.init(compoundId, (newData) => {
      console.log('[SyncManager] Remote sync received:', newData);
      setSyncedState((prev) => ({ ...prev, ...newData }));
    });

    setIsReady(true);
  }, []);

  const handleUpdate = (key: string, value: any) => {
    const newState = { ...syncedState, [key]: value };
    setSyncedState(newState);
    
    // 3. Push to Sync Mesh
    SyncEngine.pushUpdate(newState);
  };

  if (!isReady) return <div>Discovering identity...</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Sync Manager (Industrial - Vite)</h3>
      <p>Status: {isReady ? 'Live Bridge Connected' : 'Connecting...'}</p>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => handleUpdate('theme', 'dark')}>Set Dark Mode</button>
        <button onClick={() => handleUpdate('theme', 'light')}>Set Light Mode</button>
      </div>

      <pre style={{ background: '#222', color: '#fff', padding: '10px', borderRadius: '4px' }}>
        {JSON.stringify(syncedState, null, 2)}
      </pre>
    </div>
  );
};
