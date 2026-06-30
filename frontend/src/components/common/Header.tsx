import React from 'react';
import { Sun, Moon, RefreshCw, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  fetchTabData: () => Promise<void>;
  refreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  theme,
  toggleTheme,
  fetchTabData,
  refreshing
}) => {
  return (
    <header className="top-nav">
      <div className="page-title">
        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Control Panel
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button
          className="action-btn"
          style={{ padding: '6px 10px' }}
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button
          className="action-btn"
          style={{ padding: '6px 10px' }}
          onClick={fetchTabData}
          disabled={refreshing}
          title="Sync Data"
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
        </button>
        <span className="status-badge success" style={{ fontSize: '12px' }}>
          <Database size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          Live DB Online
        </span>
      </div>
    </header>
  );
};
