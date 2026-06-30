import React from 'react';
import { PlusCircle, FileDown, BellRing, Send, Trash2, FileSpreadsheet } from 'lucide-react';
import type { Invoice, Customer, Product, Reminder, ReminderLog } from '../../types';

interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  reminders: Reminder[];
  reminderLogs: ReminderLog[];
  isCreatingInvoice: boolean;
  setIsCreatingInvoice: (show: boolean) => void;
  invoiceForm: {
    customerId: string;
    invoiceDate: string;
    dueDate: string;
    discountAmount: number;
    paymentTerms: string;
    notes: string;
    termsAndConditions: string;
  };
  setInvoiceForm: React.Dispatch<React.SetStateAction<any>>;
  invoiceItems: Array<{ productId: string; quantity: number; unitPrice: number; discountPercentage: number }>;
  setInvoiceItems: React.Dispatch<React.SetStateAction<any[]>>;
  getLiveGSTCalculations: () => {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    roundOff: number;
    grandTotal: number;
  };
  handleInvoiceSubmit: (e: React.FormEvent) => Promise<void>;
  triggerDownloadPDF: (url: string) => void;
  setReminderForm: React.Dispatch<React.SetStateAction<any>>;
  showReminderModal: boolean;
  setShowReminderModal: (show: boolean) => void;
  reminderForm: {
    invoiceId: string;
    reminderFrequency: string;
    channel: string;
    nextReminderDate: string;
  };
  handleReminderSubmit: (e: React.FormEvent) => Promise<void>;
  triggerReminderNow: (reminderId: string) => Promise<void>;
  submitting: boolean;
  actionError?: string;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  customers,
  products,
  reminders,
  reminderLogs,
  isCreatingInvoice,
  setIsCreatingInvoice,
  invoiceForm,
  setInvoiceForm,
  invoiceItems,
  setInvoiceItems,
  getLiveGSTCalculations,
  handleInvoiceSubmit,
  triggerDownloadPDF,
  setReminderForm,
  showReminderModal,
  setShowReminderModal,
  reminderForm,
  handleReminderSubmit,
  triggerReminderNow,
  submitting,
  actionError
}) => {
  const totals = getLiveGSTCalculations();

  return (
    <div className="dashboard-content">
      {/* LEDGER & LIST */}
      <div className="glass-panel table-container">
        <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
          <span>Tax Invoice Ledger</span>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={() => setIsCreatingInvoice(true)}
          >
            <PlusCircle size={16} style={{ marginRight: '8px' }} />
            New GST Invoice
          </button>
        </h3>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer Company</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Tax (CGST/SGST/IGST)</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 'bold' }}>{inv.invoiceNumber}</td>
                  <td>{inv.customer?.companyName || '-'}</td>
                  <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                  <td>{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                  <td>
                    ₹{Number(Number(inv.cgst) + Number(inv.sgst) + Number(inv.igst)).toLocaleString('en-IN')}
                  </td>
                  <td style={{ fontWeight: '700' }}>₹{Number(inv.grandTotal).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-badge ${inv.status.toLowerCase()}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {inv.pdfUrl && (
                        <button
                          className="action-btn"
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', gap: '6px' }}
                          onClick={() => triggerDownloadPDF(inv.pdfUrl!)}
                        >
                          <FileDown size={14} /> PDF
                        </button>
                      )}
                      {inv.status === 'PENDING' && (
                        <button
                          className="action-btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            display: 'inline-flex',
                            gap: '6px',
                            color: 'var(--primary)',
                            borderColor: 'var(--primary)'
                          }}
                          onClick={() => {
                            setReminderForm({
                              invoiceId: inv.id,
                              reminderFrequency: 'WEEKLY',
                              channel: 'WHATSAPP',
                              nextReminderDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                            });
                            setShowReminderModal(true);
                          }}
                        >
                          <BellRing size={14} /> Alert
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No GST invoices issued. Click New GST Invoice to create.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Scheduled Reminders & Dispatch Audit trail Stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        <div className="glass-panel table-container">
          <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
            <span>Scheduled Payment Reminders (AI Agent Engine)</span>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
              onClick={() => setShowReminderModal(true)}
            >
              <BellRing size={14} style={{ marginRight: '6px' }} />
              Setup Schedule
            </button>
          </h3>
          <table className="premium-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Frequency</th>
                <th>Channel</th>
                <th>Next Dispatch</th>
                <th>Dispatches</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.length > 0 ? (
                reminders.map((rem) => (
                  <tr key={rem.id}>
                    <td>
                      <strong>{rem.invoice?.invoiceNumber}</strong>
                    </td>
                    <td>{rem.invoice?.customer?.companyName || '-'}</td>
                    <td>{rem.reminderFrequency}</td>
                    <td>
                      <span
                        className="status-badge warning"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: '#a78bfa',
                          fontSize: '10px',
                          padding: '2px 6px'
                        }}
                      >
                        {rem.channel}
                      </span>
                    </td>
                    <td>{new Date(rem.nextReminderDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 'bold' }}>{rem.reminderLogs?.length || 0}</td>
                    <td>
                      <span
                        className={`status-badge ${rem.isActive ? 'success' : 'danger'}`}
                        style={{ fontSize: '10px', padding: '2px 6px' }}
                      >
                        {rem.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        style={{
                          padding: '4px 8px',
                          fontSize: '10px',
                          display: 'inline-flex',
                          gap: '4px',
                          background: 'rgba(16,185,129,0.15)',
                          color: '#10b981',
                          borderColor: 'rgba(16,185,129,0.3)'
                        }}
                        onClick={() => triggerReminderNow(rem.id)}
                      >
                        <Send size={10} /> Send
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No scheduled reminders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="glass-panel table-container">
          <h3 className="section-title">Notification Dispatches Audit Trail</h3>
          <table className="premium-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Invoice No</th>
                <th>Channel</th>
                <th>Recipient</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reminderLogs.length > 0 ? (
                reminderLogs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.sentAt).toLocaleString('en-IN')}</td>
                    <td>
                      <strong>{log.reminder?.invoice?.invoiceNumber}</strong>
                    </td>
                    <td>{log.channel}</td>
                    <td style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.recipient}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${log.status.toLowerCase()}`}
                        style={{ fontSize: '10px', padding: '2px 6px' }}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No notifications sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isCreatingInvoice && (
        <div className="modal-overlay" onClick={() => setIsCreatingInvoice(false)}>
          <div className="glass-panel modal-card wizard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  <FileSpreadsheet size={22} style={{ color: 'var(--primary)' }} /> New GST Tax Invoice
                </h2>
                <p className="modal-subtitle">
                  Create a GST-compliant invoice — PDF generated automatically on submission.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreatingInvoice(false)}>
                ✕ Close
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

            <form onSubmit={handleInvoiceSubmit}>
              {/* Top row: Customer + Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select
                    className="form-input"
                    value={invoiceForm.customerId}
                    onChange={(e) => setInvoiceForm((prev: any) => ({ ...prev, customerId: e.target.value }))}
                    required
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.billingState})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Invoice Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={invoiceForm.invoiceDate}
                    onChange={(e) => setInvoiceForm((prev: any) => ({ ...prev, invoiceDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm((prev: any) => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>


              {/* LINE ITEMS SECTION (Full Width Table) */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '15px', margin: 0, color: 'var(--primary)' }}>Invoice Line Items</h4>
                  <button
                    type="button"
                    className="action-btn"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                    onClick={() =>
                      setInvoiceItems((prev) => [
                        ...prev,
                        { productId: '', quantity: 1, unitPrice: 0, discountPercentage: 0 }
                      ])
                    }
                  >
                    <PlusCircle size={14} style={{ marginRight: '6px' }} /> Add Row
                  </button>
                </div>

                <div className="line-item-header" style={{
                  display: 'grid',
                  gridTemplateColumns: '3.2fr 1fr 1fr 1fr 1fr 1.2fr auto',
                  gap: '12px',
                  padding: '10px 14px',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '8px'
                }}>
                  <div>Product Name</div>
                  <div style={{ textAlign: 'center' }}>Qty</div>
                  <div style={{ textAlign: 'center' }}>Rate (₹)</div>
                  <div style={{ textAlign: 'center' }}>Disc (%)</div>
                  <div style={{ textAlign: 'center' }}>GST (%)</div>
                  <div style={{ textAlign: 'right' }}>Amount (₹)</div>
                  <div></div>
                </div>

                <div className="items-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {invoiceItems.map((item, index) => {
                    const selectedProd = products.find((p) => p.id === item.productId);
                    const itemTotal = selectedProd
                      ? item.quantity *
                        item.unitPrice *
                        (1 - item.discountPercentage / 100) *
                        (1 + Number(selectedProd.gstRate) / 100)
                      : 0;
                    return (
                      <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: '3.2fr 1fr 1fr 1fr 1fr 1.2fr auto',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '6px 14px',
                        background: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}>
                        <select
                          className="form-input"
                          style={{ paddingLeft: '12px' }}
                          value={item.productId}
                          onChange={(e) => {
                            const prodId = e.target.value;
                            const prod = products.find((p) => p.id === prodId);
                            const updated = [...invoiceItems];
                            updated[index].productId = prodId;
                            if (prod) updated[index].unitPrice = Number(prod.sellingPrice);
                            setInvoiceItems(updated);
                          }}
                          required
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku} – {p.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="any"
                          className="form-input"
                          style={{ paddingLeft: '12px', textAlign: 'center' }}
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const u = [...invoiceItems];
                            u[index].quantity = Number(e.target.value);
                            setInvoiceItems(u);
                          }}
                          required
                        />
                        <input
                          type="number"
                          step="any"
                          className="form-input"
                          style={{ paddingLeft: '12px', textAlign: 'center' }}
                          placeholder="0.00"
                          value={item.unitPrice || ''}
                          onChange={(e) => {
                            const u = [...invoiceItems];
                            u[index].unitPrice = Number(e.target.value);
                            setInvoiceItems(u);
                          }}
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="form-input"
                          style={{ paddingLeft: '12px', textAlign: 'center' }}
                          placeholder="0"
                          value={item.discountPercentage || ''}
                          onChange={(e) => {
                            const u = [...invoiceItems];
                            u[index].discountPercentage = Number(e.target.value);
                            setInvoiceItems(u);
                          }}
                        />
                        <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                          {selectedProd ? `${selectedProd.gstRate}%` : '-'}
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
                          ₹{itemTotal.toFixed(2)}
                        </div>
                        <button
                          type="button"
                          className="action-btn"
                          style={{ color: '#ef4444', padding: '6px 8px', border: 'none', background: 'transparent' }}
                          onClick={() =>
                            invoiceItems.length > 1 &&
                            setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
                          }
                          disabled={invoiceItems.length === 1}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FOOTER SECTION: SPLIT INVOICE DETAILS & TOTALS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                {/* Left: Notes & Conditions */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Payment Terms</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '12px' }}
                        value={invoiceForm.paymentTerms}
                        onChange={(e) => setInvoiceForm((prev: any) => ({ ...prev, paymentTerms: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notes (PDF)</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '12px' }}
                        value={invoiceForm.notes}
                        onChange={(e) => setInvoiceForm((prev: any) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Visible on invoice PDF"
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label className="form-label">Terms &amp; Conditions</label>
                    <textarea
                      className="form-input"
                      style={{ paddingLeft: '12px' }}
                      rows={2}
                      value={invoiceForm.termsAndConditions}
                      onChange={(e) => setInvoiceForm((prev: any) => ({ ...prev, termsAndConditions: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Right: Calculations & Print Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="summary-panel" style={{ padding: '20px' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '12px', margin: '0 0 12px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      Invoice Totals
                    </h4>
                    <div className="summary-row sub">
                      <span>Subtotal</span>
                      <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row sub">
                      <span>CGST (Local)</span>
                      <span>₹{totals.cgst.toFixed(2)}</span>
                    </div>
                    <div className="summary-row sub">
                      <span>SGST (Local)</span>
                      <span>₹{totals.sgst.toFixed(2)}</span>
                    </div>
                    <div className="summary-row sub">
                      <span>IGST (Interstate)</span>
                      <span>₹{totals.igst.toFixed(2)}</span>
                    </div>
                    <div className="form-group" style={{ margin: '10px 0' }}>
                      <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>
                        Lump-sum Discount (₹)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ paddingLeft: '12px' }}
                        value={invoiceForm.discountAmount || ''}
                        onChange={(e) =>
                          setInvoiceForm((prev: any) => ({ ...prev, discountAmount: Number(e.target.value) }))
                        }
                      />
                    </div>
                    <div className="summary-row sub">
                      <span>Round Off</span>
                      <span>₹{totals.roundOff.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total" style={{ fontSize: '16px' }}>
                      <span>Grand Total</span>
                      <span>₹{totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '14px', fontWeight: '700', fontSize: '15px' }}
                    disabled={submitting}
                  >
                    {submitting ? '⏳ Generating Invoice...' : '🖨️ Finalize & Generate PDF'}
                  </button>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                    PDF will be automatically downloaded after creation.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SETUP PAYMENT REMINDER */}
      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
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
              <h4>Setup Automated Payment Reminder</h4>
              <button
                className="btn-logout"
                style={{ padding: '4px 8px' }}
                onClick={() => setShowReminderModal(false)}
              >
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

            <form onSubmit={handleReminderSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Select Invoice *</label>
                <select
                  className="form-input"
                  value={reminderForm.invoiceId}
                  onChange={(e) => setReminderForm((prev: any) => ({ ...prev, invoiceId: e.target.value }))}
                  required
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customer?.companyName} (Amount: ₹
                      {Number(inv.grandTotal).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}
              >
                <div className="form-group">
                  <label className="form-label">Follow-up Frequency *</label>
                  <select
                    className="form-input"
                    value={reminderForm.reminderFrequency}
                    onChange={(e) =>
                      setReminderForm((prev: any) => ({ ...prev, reminderFrequency: e.target.value }))
                    }
                    required
                  >
                    <option value="DAILY">DAILY</option>
                    <option value="WEEKLY">WEEKLY</option>
                    <option value="BI_WEEKLY">BI_WEEKLY</option>
                    <option value="MONTHLY">MONTHLY</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Notification Channel *</label>
                  <select
                    className="form-input"
                    value={reminderForm.channel}
                    onChange={(e) => setReminderForm((prev: any) => ({ ...prev, channel: e.target.value }))}
                    required
                  >
                    <option value="WHATSAPP">WHATSAPP (Automated Template)</option>
                    <option value="EMAIL">EMAIL (Detailed PDF Link)</option>
                    <option value="SMS">SMS (Simple Alert Text)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">First Notification Dispatch Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={reminderForm.nextReminderDate}
                  onChange={(e) => setReminderForm((prev: any) => ({ ...prev, nextReminderDate: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Configure Automated Reminder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
