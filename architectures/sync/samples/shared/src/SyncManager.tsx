import React, { useEffect, useState } from 'react';
import { SyncEngine, type SyncData } from '@sync/core';

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

  const currentTheme = (syncedState['theme'] as string) || 'light';
  const isDark = currentTheme === 'dark';

  return (
    <div style={{
      padding: '2rem',
      background: isDark ? '#1e1e1e' : '#f9f9f9',
      color: isDark ? '#ffffff' : '#000000',
      borderRadius: '12px',
      border: isDark ? '1px solid #333' : '1px solid #eee',
      transition: 'all 0.3s ease',
      fontSize: `${syncedState['fontSize'] || 14}px`
    }}>
      <h2 style={{ fontSize: '1.5em' }}>Zero-Backend Sync Manager</h2>
      <p>Status: {isReady ? '✅ Active (Decentralized Mesh Connected)' : '⏳ Initializing...'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          onClick={() => handleUpdate('theme', isDark ? 'light' : 'dark')}
          style={{
            padding: '0.8rem',
            cursor: 'pointer',
            borderRadius: '8px',
            border: 'none',
            background: isDark ? '#444' : '#007bff',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Toggle Theme ({currentTheme})
        </button>

        <button
          onClick={() => handleUpdate('fontSize', (syncedState['fontSize'] as number || 14) + 2)}
          style={{
            padding: '0.8rem',
            cursor: 'pointer',
            borderRadius: '8px',
            border: 'none',
            background: '#6c757d',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Increase Font Size
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '1.1em' }}>Current Sync State:</h4>
        <pre style={{
          background: isDark ? '#000' : '#333',
          color: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          overflowX: 'auto',
          fontSize: '0.9em'
        }}>
          {JSON.stringify(syncedState, null, 2)}
        </pre>
      </div>
    </div>
  );
};
