import React from 'react';
import {
  TrendingUp,
  Truck,
  DollarSign,
  AlertTriangle,
  Layers,
  PlusCircle,
  FileText,
  ScanEye,
  BellRing,
  Package,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import type { DashboardAnalytics, Reminder } from '../../types';

interface DashboardViewProps {
  analytics: DashboardAnalytics;
  reminders: Reminder[];
  setActiveTab: (tab: string) => void;
  setIsCreatingInvoice: (v: boolean) => void;
  setIsCreatingPurchase: (v: boolean) => void;
  setShowReminderModal: (v: boolean) => void;
  setShowStockModal: (v: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  reminders,
  setActiveTab,
  setIsCreatingInvoice,
  setIsCreatingPurchase,
  setShowReminderModal,
  setShowStockModal
}) => {
  const { kpis, recentInvoices = [], recentActivities = [] } = analytics;

  return (
    <div className="dashboard-content">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Monthly Sales</span>
            <div className="kpi-icon-wrapper"><TrendingUp size={16} /></div>
          </div>
          <div className="kpi-value">
            {kpis.monthlySales ? kpis.monthlySales.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
          </div>
          <div className="kpi-trend up">
            <span>Current billing month</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Today's Sales</span>
            <div className="kpi-icon-wrapper"><TrendingUp size={16} /></div>
          </div>
          <div className="kpi-value">
            {kpis.todaySales ? kpis.todaySales.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
          </div>
          <div className="kpi-trend up">
            <span>Real-time invoice value</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Today's Purchases</span>
            <div className="kpi-icon-wrapper"><Truck size={16} /></div>
          </div>
          <div className="kpi-value">
            {kpis.todayPurchases ? kpis.todayPurchases.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
          </div>
          <div className="kpi-trend neutral">
            <span>Raw material imports</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Outstanding Receivables</span>
            <div className="kpi-icon-wrapper"><DollarSign size={16} /></div>
          </div>
          <div className="kpi-value">
            {kpis.totalOutstanding ? kpis.totalOutstanding.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
          </div>
          <div className="kpi-trend down">
            <AlertTriangle size={12} />
            <span>Customer outstandings</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Outstanding Payables</span>
            <div className="kpi-icon-wrapper"><Layers size={16} /></div>
          </div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>
            {kpis.totalPayable ? kpis.totalPayable.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
          </div>
          <div className="kpi-trend down">
            <AlertTriangle size={12} />
            <span>Supplier liabilities</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Low Stock Alert</span>
            <div className="kpi-icon-wrapper"><AlertTriangle size={16} /></div>
          </div>
          <div className="kpi-value" style={{ color: kpis.lowStockCount > 0 ? '#ef4444' : '#10b981' }}>
            {kpis.lowStockCount} Products
          </div>
          <div className="kpi-trend neutral">
            <span>Below safety margin</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-panel">
        <h3 className="section-title">
          <PlusCircle size={18} className="action-icon" /> Quick Actions
        </h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => { setActiveTab('invoices'); setIsCreatingInvoice(true); }}>
            <FileText size={18} className="action-icon" />
            <span>Create GST Invoice</span>
          </button>
          <button className="action-btn" onClick={() => { setActiveTab('purchases'); setIsCreatingPurchase(true); }}>
            <PlusCircle size={18} className="action-icon" />
            <span>New Purchase Order</span>
          </button>
          <button className="action-btn" onClick={() => { setActiveTab('purchases'); setIsCreatingPurchase(true); }}>
            <ScanEye size={18} className="action-icon" />
            <span>Scan Supplier Bill</span>
          </button>
          <button className="action-btn" onClick={() => setShowReminderModal(true)}>
            <BellRing size={18} className="action-icon" />
            <span>Setup Reminder</span>
          </button>
          <button className="action-btn" onClick={() => { setActiveTab('products'); setShowStockModal(true); }}>
            <Package size={18} className="action-icon" />
            <span>Adjust Inventory</span>
          </button>
        </div>
      </div>

      {/* Split tables */}
      <div className="split-grid" style={{ gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: '20px' }}>
        {/* Column 1: Recent Invoices */}
        <div className="glass-panel table-container">
          <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
            <span>Recent Invoices</span>
            <button className="action-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setActiveTab('invoices')}>
              View All <ArrowUpRight size={12} />
            </button>
          </h3>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length > 0 ? (
                recentInvoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.companyName}</td>
                    <td>₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No invoices created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Column 2: Live Activity Log */}
        <div className="glass-panel table-container">
          <h3 className="section-title">
            <Activity size={18} className="action-icon" />
            <span>Recent Audit Log</span>
          </h3>
          <div className="activity-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act: any) => (
                <div className="activity-item" key={act.id}>
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{act.userName}</strong>: {act.action.replace(/_/g, ' ')} ({act.entityName})
                    </div>
                    <div className="activity-time">
                      {new Date(act.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '16px 0' }}>No recent activity.</div>
            )}
          </div>
        </div>

        {/* Column 3: Active Payment Reminders */}
        <div className="glass-panel table-container">
          <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
            <span>Active Reminders</span>
            <button className="action-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowReminderModal(true)}>
              Setup <ArrowUpRight size={12} />
            </button>
          </h3>
          <table className="premium-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Next Date</th>
                <th>Channel</th>
              </tr>
            </thead>
            <tbody>
              {reminders.length > 0 ? (
                reminders.slice(0, 5).map((rem: any) => (
                  <tr key={rem.id}>
                    <td style={{ fontWeight: 'bold' }}>{rem.invoice?.invoiceNumber || 'Invoice'}</td>
                    <td>{new Date(rem.nextReminderDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className="status-badge warning" style={{ background: 'rgba(255,255,255,0.05)', color: '#a78bfa', fontSize: '9px', padding: '2px 4px' }}>
                        {rem.channel}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No scheduled reminders.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
