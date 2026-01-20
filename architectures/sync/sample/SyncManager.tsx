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
    // 1. Context Discovery (Silently derive user identifier)
    // Assume currentUser is provided by your Auth Provider.
    const currentUserEmail = 'user@example.com'; 
    const platformId = 'prod-v1';
    
    // Industrial Standard: Use a compound ID for increased entropy
    const compoundId = [currentUserEmail, platformId];

    // 2. Singleton Initialization
    SyncEngine.init(compoundId, (newData) => {
      console.log('[SyncManager] Remote sync received:', newData);
      // Reactive UI Update
      setSyncedState((prev) => ({ ...prev, ...newData }));
    });

    // 3. Optional: Set Ready state when worker acknowledges
    // This is useful for showing a "Global Sync Active" indicator.
    setIsReady(true);
  }, []);

  const handleUpdate = (key: string, value: string | number | boolean | null) => {
    const fragment = { [key]: value };
    
    // Local Update (Immediate responsiveness)
    setSyncedState((prev) => ({ ...prev, ...fragment }));
    
    // Remote Push (Backgrounded)
    SyncEngine.pushUpdate(fragment);
  };

  return (
    <div style={{ padding: '2rem', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
      <h2>Zero-Backend Sync Manager</h2>
      <p>Status: {isReady ? '✅ Active (Decentralized Mesh Connected)' : '⏳ Initializing...'}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
        <button 
          onClick={() => handleUpdate('theme', syncedState.theme === 'dark' ? 'light' : 'dark')}
          style={{ padding: '0.8rem', cursor: 'pointer', borderRadius: '8px', border: 'none', background: '#007bff', color: 'white' }}
        >
          Toggle Theme ({syncedState.theme || 'light'})
        </button>
        
        <button 
          onClick={() => handleUpdate('fontSize', 16)}
          style={{ padding: '0.8rem', cursor: 'pointer', borderRadius: '8px', border: 'none', background: '#6c757d', color: 'white' }}
        >
          Reset Font Size
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h4>Current Sync State:</h4>
        <pre style={{ background: '#333', color: '#fff', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
          {JSON.stringify(syncedState, null, 2)}
        </pre>
      </div>
    </div>
  );
};
