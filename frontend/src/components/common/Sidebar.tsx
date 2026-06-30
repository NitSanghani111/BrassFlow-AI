import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  Truck,
  BarChart3,
  LogOut,
  Factory,
  Settings
} from 'lucide-react';
import type { User } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsCreatingInvoice: (v: boolean) => void;
  setIsCreatingPurchase: (v: boolean) => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  setIsCreatingInvoice,
  setIsCreatingPurchase,
  user,
  onLogout
}) => {
  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName ? user.firstName.charAt(0) : '';
    const last = user.lastName ? user.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsCreatingInvoice(false);
    setIsCreatingPurchase(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="auth-logo" style={{ justifyContent: 'flex-start', marginBottom: 0 }}>
          <Factory size={24} className="auth-logo-icon" />
          <span className="auth-logo-text" style={{ fontSize: '18px' }}>AI Brass ERP</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <a
          href="#"
          className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleTabChange('dashboard'); }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </a>
        <a
          href="#"
          className={`menu-item ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleTabChange('customers'); }}
        >
          <Users size={18} />
          <span>Customers</span>
        </a>
        <a
          href="#"
          className={`menu-item ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleTabChange('suppliers'); }}
        >
          <Users size={18} />
          <span>Suppliers</span>
        </a>
        <a
          href="#"
          className={`menu-item ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleTabChange('purchases'); }}
        >
          <Truck size={18} />
          <span>Purchases</span>
        </a>
        <a
          href="#"
          className={`menu-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleTabChange('products'); }}
        >
          <Package size={18} />
          <span>Products</span>
        </a>
        <a
          href="#"
          className={`menu-item ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleTabChange('invoices'); }}
        >
          <FileSpreadsheet size={18} />
          <span>Invoices</span>
        </a>
        <a
          href="#"
          className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleTabChange('reports'); }}
        >
          <BarChart3 size={18} />
          <span>Reports</span>
        </a>
        <a
          href="#"
          className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleTabChange('settings'); }}
        >
          <Settings size={18} />
          <span>Settings</span>
        </a>
      </nav>

      {/* Keyboard Shortcuts Help */}
      <div style={{ padding: '12px 16px', fontSize: '11px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Keyboard Shortcuts</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px' }}>
          <span>Ctrl+D</span><span>Dashboard</span>
          <span>Ctrl+P</span><span>Products</span>
          <span>Ctrl+B</span><span>Purchases</span>
          <span>Ctrl+I</span><span>Invoices</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{getInitials()}</div>
          <div className="user-details">
            <div className="user-name">{user ? `${user.firstName} ${user.lastName}` : 'System User'}</div>
            <div className="user-role">{user?.role || 'Guest'}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout} title="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
