import React from 'react';
import { SyncManager } from './components/SyncManager';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Zero-Backend Sync Industrial Sample (Vite)</h1>
      </header>
      <main>
        <SyncManager />
      </main>
    </div>
  );
}

export default App;
