import React from 'react';
import { BarChart3, Layers } from 'lucide-react';
import type { DashboardAnalytics } from '../../types';

interface ReportsViewProps {
  analytics: DashboardAnalytics;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ analytics }) => {
  const { topCustomers = [], categoryStocks = [] } = analytics;

  return (
    <div className="dashboard-content">
      <div className="split-grid" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
        {/* Left Panel: Accounts Receivables Breakdown */}
        <div className="glass-panel table-container">
          <h3 className="section-title">
            <BarChart3 size={18} className="action-icon" /> Outstanding Payables By Accounts
          </h3>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Account / Customer</th>
                <th>Billing Phone</th>
                <th>Outstanding Balance</th>
                <th>Billing State</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length > 0 ? (
                topCustomers.map((cust: any) => (
                  <tr key={cust.id}>
                    <td style={{ fontWeight: '600' }}>{cust.companyName}</td>
                    <td>{cust.phone}</td>
                    <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                    </td>
                    <td>Gujarat</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No accounts data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Panel: Inventory Distribution */}
        <div className="glass-panel table-container">
          <h3 className="section-title">
            <Layers size={18} className="action-icon" /> Stock Category Weights
          </h3>
          <div style={{ marginTop: '16px' }}>
            {categoryStocks.length > 0 ? (
              categoryStocks.map((cat: any, idx: number) => {
                const maxVal = Math.max(
                  ...categoryStocks.map((c: any) => c.totalStock),
                  100
                );
                const percentage = (cat.totalStock / maxVal) * 100;
                return (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600' }}>{cat.category}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{cat.totalStock.toFixed(2)} KG</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #b8860b, #fbbf24)',
                          borderRadius: '4px'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                No stock categories configured.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
