import React from 'react';
import { SyncManager } from './SyncManager';

interface BaseAppProps {
    title: string;
}

export const BaseApp: React.FC<BaseAppProps> = ({ title }) => {
    return (
        <div className="App">
            <header className="App-header">
                <h1>{title}</h1>
            </header>
            <main>
                <SyncManager />
            </main>
        </div>
    );
};
