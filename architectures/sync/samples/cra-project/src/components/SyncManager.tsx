import React, { useState, useEffect } from 'react';
import { SyncEngine } from '../../../../lib/engine';
import { SyncData } from '../../../../lib/types';

/**
 * SyncManager: Pedogogical Component
 * Demonstrates silent identity discovery and reactive UI updates.
 */
export const SyncManager: React.FC = () => {
  const [syncedState, setSyncedState] = useState<SyncData>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Silent Context Discovery
    // Identify a stable identifier from the app session (e.g., email)
    const currentUserEmail = 'user@example.com';
    const platformId = 'prod-v1';
    const compoundId = [currentUserEmail, platformId];

    // 2. Initialize the Sync Engine (Background Thread)
    // No need to dispatch manual actions; RxDB triggers updates silently.
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
    // This happens in the background via the Web Worker
    SyncEngine.pushUpdate(newState);
  };

  if (!isReady) return <div>Discovering identity...</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h3>Sync Manager (Industrial)</h3>
      <p>Status: {isReady ? 'Live Bridge Connected' : 'Connecting...'}</p>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => handleUpdate('theme', 'dark')}>Set Dark Mode</button>
        <button onClick={() => handleUpdate('theme', 'light')}>Set Light Mode</button>
      </div>

      <pre style={{ background: '#f4f4f4', padding: '10px' }}>
        {JSON.stringify(syncedState, null, 2)}
      </pre>
    </div>
  );
};
