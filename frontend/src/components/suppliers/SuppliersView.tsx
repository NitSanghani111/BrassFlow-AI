import React from 'react';
import { UserPlus } from 'lucide-react';
import type { Supplier } from '../../types';

interface SuppliersViewProps {
  suppliers: Supplier[];
  showSupplierModal: boolean;
  setShowSupplierModal: (show: boolean) => void;
  supplierForm: {
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
  setSupplierForm: React.Dispatch<React.SetStateAction<any>>;
  handleSupplierSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  openSupplierDetail: (id: string) => void;
  activeSupplierDetail: Supplier | null;
  setActiveSupplierDetail: (supplier: Supplier | null) => void;
  actionError?: string;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  showSupplierModal,
  setShowSupplierModal,
  supplierForm,
  setSupplierForm,
  handleSupplierSubmit,
  submitting,
  openSupplierDetail,
  activeSupplierDetail,
  setActiveSupplierDetail,
  actionError
}) => {
  return (
    <div className="dashboard-content">
      <div className="glass-panel table-container">
        <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
          <span>Supplier Registry (Procurement Vendors)</span>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={() => setShowSupplierModal(true)}
          >
            <UserPlus size={16} style={{ marginRight: '8px' }} />
            Add Supplier
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
              <th>Outstanding Payable</th>
              <th>Payment Term</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length > 0 ? (
              suppliers.map((s) => (
                <tr key={s.id} className="clickable-row" onClick={() => openSupplierDetail(s.id)}>
                  <td style={{ fontWeight: '600' }}>{s.companyName}</td>
                  <td>{s.contactName || '-'}</td>
                  <td>{s.email || '-'}</td>
                  <td>{s.phone}</td>
                  <td>{s.gstin || '-'}</td>
                  <td style={{ color: Number(s.outstandingBalance) > 0 ? '#ef4444' : 'inherit' }}>
                    ₹{Number(s.outstandingBalance).toLocaleString('en-IN')}
                  </td>
                  <td>{s.paymentTermsDays} Days</td>
                  <td>
                    <span className={`status-badge ${s.status.toLowerCase()}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No suppliers registered. Click Add Supplier to start cataloging.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD SUPPLIER */}
      {showSupplierModal && (
        <div className="modal-overlay" onClick={() => setShowSupplierModal(false)}>
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
              <h4>Register Procurement Supplier</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowSupplierModal(false)}>
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

            <form onSubmit={handleSupplierSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={supplierForm.companyName}
                  onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, companyName: e.target.value }))}
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
                    value={supplierForm.contactName}
                    onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, contactName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, phone: e.target.value }))}
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
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN (15-digit) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={supplierForm.gstin}
                    onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
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
                    value={supplierForm.pan}
                    onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Terms (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={supplierForm.paymentTermsDays}
                    onChange={(e) =>
                      setSupplierForm((prev: any) => ({ ...prev, paymentTermsDays: Number(e.target.value) }))
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
                  value={supplierForm.billingStreet}
                  onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, billingStreet: e.target.value }))}
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
                    value={supplierForm.billingCity}
                    onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, billingCity: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={supplierForm.billingState}
                    onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, billingState: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={supplierForm.billingZip}
                    onChange={(e) => setSupplierForm((prev: any) => ({ ...prev, billingZip: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Registering...' : 'Save Supplier Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: SUPPLIER PROFILE */}
      {activeSupplierDetail && (
        <div className="drawer-overlay active" onClick={() => setActiveSupplierDetail(null)}>
          <div className="drawer-panel active" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">Supplier Corporate Profile</h3>
              <button className="drawer-close-btn" onClick={() => setActiveSupplierDetail(null)}>
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{activeSupplierDetail.companyName}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                  GSTIN: {activeSupplierDetail.gstin || 'URD'}
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
                  <div style={{ fontWeight: 'bold' }}>{activeSupplierDetail.contactName || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PAYMENT TERMS</div>
                  <div style={{ fontWeight: 'bold' }}>{activeSupplierDetail.paymentTermsDays} Days Net</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TELEPHONE</div>
                  <div style={{ fontWeight: 'bold' }}>{activeSupplierDetail.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CORPORATE EMAIL</div>
                  <div style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>
                    {activeSupplierDetail.email || '-'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>OUTSTANDING ACCOUNTS PAYABLE</div>
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '26px',
                    color: Number(activeSupplierDetail.outstandingBalance) > 0 ? '#ef4444' : 'var(--text-primary)',
                    marginTop: '4px'
                  }}
                >
                  ₹{Number(activeSupplierDetail.outstandingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Registered Billing Address</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {activeSupplierDetail.billingStreet || '-'}
                  <br />
                  {activeSupplierDetail.billingCity || '-'}, {activeSupplierDetail.billingState || '-'} -{' '}
                  {activeSupplierDetail.billingZip || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
