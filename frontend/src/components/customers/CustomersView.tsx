import React from 'react';
import { UserPlus } from 'lucide-react';
import type { Customer } from '../../types';

interface CustomersViewProps {
  customers: Customer[];
  showCustomerModal: boolean;
  setShowCustomerModal: (show: boolean) => void;
  customerForm: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    gstin: string;
    pan: string;
    billingStreet: string;
    billingCity: string;
    billingState: string;
    billingZip: string;
    paymentTermsDays: number;
  };
  setCustomerForm: React.Dispatch<React.SetStateAction<any>>;
  handleCustomerSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  openCustomerDetail: (id: string) => void;
  activeCustomerDetail: Customer | null;
  setActiveCustomerDetail: (customer: Customer | null) => void;
  actionError?: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  showCustomerModal,
  setShowCustomerModal,
  customerForm,
  setCustomerForm,
  handleCustomerSubmit,
  submitting,
  openCustomerDetail,
  activeCustomerDetail,
  setActiveCustomerDetail,
  actionError
}) => {
  return (
    <div className="dashboard-content">
      <div className="glass-panel table-container">
        <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
          <span>Customer Registry</span>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={() => setShowCustomerModal(true)}
          >
            <UserPlus size={16} style={{ marginRight: '8px' }} />
            Add Customer
          </button>
        </h3>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>GSTIN</th>
              <th>Outstanding Balance</th>
              <th>Credit Term</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.id} className="clickable-row" onClick={() => openCustomerDetail(c.id)}>
                  <td style={{ fontWeight: '600' }}>{c.companyName}</td>
                  <td>{c.contactName || '-'}</td>
                  <td>{c.email || '-'}</td>
                  <td>{c.phone}</td>
                  <td>{c.gstin || 'URD'}</td>
                  <td style={{ color: Number(c.outstandingBalance) > 0 ? '#f59e0b' : 'inherit' }}>
                    ₹{Number(c.outstandingBalance).toLocaleString('en-IN')}
                  </td>
                  <td>{c.paymentTermsDays} Days</td>
                  <td>
                    <span className={`status-badge ${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No customers registered. Click Add Customer to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD CUSTOMER */}
      {showCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="glass-panel modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}
            >
              <h4>Register New Customer</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowCustomerModal(false)}>
                ✕
              </button>
            </div>

            {actionError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                ⚠️ {actionError}
              </div>
            )}

            <form onSubmit={handleCustomerSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={customerForm.companyName}
                  onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </div>

              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}
              >
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerForm.contactName}
                    onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, contactName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}
              >
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN (15-digit) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerForm.gstin}
                    onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>
              </div>

              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}
              >
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerForm.pan}
                    onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Credit Terms (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={customerForm.paymentTermsDays}
                    onChange={(e) =>
                      setCustomerForm((prev: any) => ({ ...prev, paymentTermsDays: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <h5 style={{ margin: '12px 0 6px 0', color: 'var(--primary)' }}>Billing Address</h5>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  className="form-input"
                  value={customerForm.billingStreet}
                  onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, billingStreet: e.target.value }))}
                  required
                />
              </div>
              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}
              >
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerForm.billingCity}
                    onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, billingCity: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerForm.billingState}
                    onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, billingState: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerForm.billingZip}
                    onChange={(e) => setCustomerForm((prev: any) => ({ ...prev, billingZip: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Registering...' : 'Save Customer Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: CUSTOMER DETAIL PROFILE & INVOICES */}
      {activeCustomerDetail && (
        <div className="drawer-overlay active" onClick={() => setActiveCustomerDetail(null)}>
          <div className="drawer-panel active" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">Customer Profile & Invoices</h3>
              <button className="drawer-close-btn" onClick={() => setActiveCustomerDetail(null)}>
                ✕
              </button>
            </div>

            <div
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto'
              }}
            >
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{activeCustomerDetail.companyName}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                  GSTIN: {activeCustomerDetail.gstin || 'URD'}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  borderTop: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  padding: '16px 0'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CONTACT REPRESENTATIVE</div>
                  <div style={{ fontWeight: 'bold' }}>{activeCustomerDetail.contactName || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CREDIT CYCLE</div>
                  <div style={{ fontWeight: 'bold' }}>{activeCustomerDetail.paymentTermsDays} Days Net</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TELEPHONE</div>
                  <div style={{ fontWeight: 'bold' }}>{activeCustomerDetail.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>BUSINESS EMAIL</div>
                  <div style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>
                    {activeCustomerDetail.email || '-'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>OUTSTANDING ACCOUNTS RECEIVABLE</div>
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '26px',
                    color: Number(activeCustomerDetail.outstandingBalance) > 0 ? '#f59e0b' : 'var(--text-primary)',
                    marginTop: '4px'
                  }}
                >
                  ₹{Number(activeCustomerDetail.outstandingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Registered Billing Address</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {activeCustomerDetail.billingStreet || '-'}
                  <br />
                  {activeCustomerDetail.billingCity || '-'}, {activeCustomerDetail.billingState || '-'} -{' '}
                  {activeCustomerDetail.billingZip || '-'}
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Customer Sales History</h4>
                {activeCustomerDetail.invoices && activeCustomerDetail.invoices.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeCustomerDetail.invoices.map((inv: any) => (
                      <div
                        key={inv.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      >
                        <div>
                          <strong>{inv.invoiceNumber}</strong> ({new Date(inv.invoiceDate).toLocaleDateString('en-IN')})
                        </div>
                        <div>
                          <span>₹{Number(inv.grandTotal).toLocaleString('en-IN')}</span>
                          <span
                            className={`status-badge ${inv.status.toLowerCase()}`}
                            style={{ marginLeft: '8px', fontSize: '9px', padding: '2px 4px' }}
                          >
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    No sales transactions recorded for this customer.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
