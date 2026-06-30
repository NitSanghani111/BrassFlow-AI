import React from 'react';
import { Truck, PlusCircle, ScanEye, Trash2 } from 'lucide-react';
import type { Purchase, Supplier, Product, PurchaseItem } from '../../types';

interface PurchasesViewProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  products: Product[];
  isCreatingPurchase: boolean;
  setIsCreatingPurchase: (show: boolean) => void;
  purchaseForm: {
    supplierId: string;
    purchaseDate: string;
    dueDate: string;
    discountAmount: number;
    originalInvoiceNo: string;
    notes: string;
    ocrDocumentId: string;
  };
  setPurchaseForm: React.Dispatch<React.SetStateAction<any>>;
  purchaseItems: PurchaseItem[];
  setPurchaseItems: React.Dispatch<React.SetStateAction<PurchaseItem[]>>;
  getPurchaseTotals: () => {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    discount: number;
    grandTotal: number;
  };
  ocrUploading: boolean;
  handlePurchaseOcrUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handlePurchaseSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  showProductSuggestionModal: boolean;
  setShowProductSuggestionModal: (show: boolean) => void;
  productSuggestionForm: {
    sku: string;
    name: string;
    description: string;
    category: string;
    hsnCode: string;
    gstRate: number;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    openingStock: number;
    minimumStock: number;
  };
  setProductSuggestionForm: React.Dispatch<React.SetStateAction<any>>;
  handleProductSuggestionSubmit: (e: React.FormEvent) => Promise<void>;
  setPendingItemIndex: (index: number | null) => void;
  actionError?: string;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  suppliers,
  products,
  isCreatingPurchase,
  setIsCreatingPurchase,
  purchaseForm,
  setPurchaseForm,
  purchaseItems,
  setPurchaseItems,
  getPurchaseTotals,
  ocrUploading,
  handlePurchaseOcrUpload,
  handlePurchaseSubmit,
  submitting,
  showProductSuggestionModal,
  setShowProductSuggestionModal,
  productSuggestionForm,
  setProductSuggestionForm,
  handleProductSuggestionSubmit,
  setPendingItemIndex,
  actionError
}) => {
  const sum = getPurchaseTotals();

  return (
    <div className="dashboard-content">
      {/* PURCHASES LIST */}
      <div className="glass-panel table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            <Truck size={20} style={{ marginRight: '8px', color: 'var(--primary)' }} />
            Purchase Ledger (Materials Receipts)
          </h3>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={() => setIsCreatingPurchase(true)}
          >
            <PlusCircle size={16} style={{ marginRight: '8px' }} />
            Log Purchase Order
          </button>
        </div>

        <table className="premium-table">
          <thead>
            <tr>
              <th>PO ID / Invoice No</th>
              <th>Supplier Name</th>
              <th>Date</th>
              <th>Subtotal</th>
              <th>Tax (CGST+SGST)</th>
              <th>Total Amt</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 'bold' }}>{p.originalInvoiceNo || `PO-${p.id.slice(0, 8)}`}</td>
                  <td>{p.supplier?.companyName || '-'}</td>
                  <td>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</td>
                  <td>₹{Number(p.subTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>₹{(Number(p.cgst) + Number(p.sgst)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ fontWeight: '700' }}>
                    ₹{Number(p.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className="status-badge success">Received</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No purchase transactions logged yet. Click Log Purchase Order to record raw material inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PURCHASE WIZARD MODAL */}
      {isCreatingPurchase && (
        <div className="modal-overlay" onClick={() => setIsCreatingPurchase(false)}>
          <div className="glass-panel modal-card wizard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  <Truck size={22} style={{ color: 'var(--primary)' }} /> Log New Purchase Order
                </h2>
                <p className="modal-subtitle">
                  Record material receipts. Upload supplier invoice for AI auto-fill or enter manually.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreatingPurchase(false)}>
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

              {/* LINE ITEMS SECTION (Full Width Table) */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '15px', margin: 0, color: 'var(--primary)' }}>Material Receipt Items</h4>
                  <button
                    type="button"
                    className="action-btn"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                    onClick={() =>
                      setPurchaseItems((p: any) => [
                        ...p,
                        { productId: '', quantity: 1, unitPrice: 0, discountPercentage: 0 }
                      ])
                    }
                  >
                    <PlusCircle size={14} style={{ marginRight: '6px' }} /> Add Item
                  </button>
                </div>

                <div className="line-item-header" style={{
                  display: 'grid',
                  gridTemplateColumns: '3.2fr 1fr 1fr 1fr 1.2fr auto',
                  gap: '12px',
                  padding: '10px 14px',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '8px'
                }}>
                  <div>Product Name / SKU</div>
                  <div style={{ textAlign: 'center' }}>Qty</div>
                  <div style={{ textAlign: 'center' }}>Rate (₹)</div>
                  <div style={{ textAlign: 'center' }}>Disc (%)</div>
                  <div style={{ textAlign: 'right' }}>Total (₹)</div>
                  <div></div>
                </div>

                <div className="items-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {purchaseItems.map((item, index) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const taxRate = prod ? Number(prod.gstRate) : 0;
                    const lineTotal = item.quantity * item.unitPrice * (1 - item.discountPercentage / 100);
                    const taxAmt = lineTotal * (taxRate / 100);
                    const itemTotal = lineTotal + taxAmt;
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.01)',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '3.2fr 1fr 1fr 1fr 1.2fr auto',
                          gap: '12px',
                          alignItems: 'center'
                        }}>
                          <select
                            className="form-input"
                            style={{ paddingLeft: '12px' }}
                            value={item.productId}
                            onChange={(e) => {
                              const updated = [...purchaseItems];
                              updated[index].productId = e.target.value;
                              const p = products.find((x) => x.id === e.target.value);
                              if (p) updated[index].unitPrice = Number(p.purchasePrice);
                              setPurchaseItems(updated);
                            }}
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
                            className="form-input"
                            style={{ paddingLeft: '12px', textAlign: 'center' }}
                            placeholder="Qty"
                            value={item.quantity || ''}
                            onChange={(e) => {
                              const u = [...purchaseItems];
                              u[index].quantity = Number(e.target.value);
                              setPurchaseItems(u);
                            }}
                          />
                          <input
                            type="number"
                            className="form-input"
                            style={{ paddingLeft: '12px', textAlign: 'center' }}
                            placeholder="Rate"
                            value={item.unitPrice || ''}
                            onChange={(e) => {
                              const u = [...purchaseItems];
                              u[index].unitPrice = Number(e.target.value);
                              setPurchaseItems(u);
                            }}
                          />
                          <input
                            type="number"
                            className="form-input"
                            style={{ paddingLeft: '12px', textAlign: 'center' }}
                            value={item.discountPercentage}
                            onChange={(e) => {
                              const u = [...purchaseItems];
                              u[index].discountPercentage = Number(e.target.value);
                              setPurchaseItems(u);
                            }}
                          />
                          <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
                            ₹{itemTotal.toFixed(2)}
                          </div>
                          <button
                            type="button"
                            className="action-btn"
                            style={{ color: '#ef4444', padding: '6px 8px', border: 'none', background: 'transparent' }}
                            onClick={() =>
                              purchaseItems.length > 1 && setPurchaseItems((p) => p.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        {/* Suggestion Link or Tax breakdown */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', paddingTop: '4px', borderTop: '1px dotted var(--border-color)' }}>
                          <div>
                            {item.description && !item.productId ? (
                              <span
                                style={{ color: '#f59e0b', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                                onClick={() => {
                                  setPendingItemIndex(index);
                                  setProductSuggestionForm({
                                    sku: (item.description || '').replace(/\s+/g, '-').slice(0, 10).toUpperCase(),
                                    name: item.description || '',
                                    description: 'Auto-suggested from OCR.',
                                    category: 'Brass Scrap',
                                    hsnCode: '74040012',
                                    gstRate: 18,
                                    unit: 'KG',
                                    purchasePrice: item.unitPrice,
                                    sellingPrice: item.unitPrice * 1.5,
                                    openingStock: 0,
                                    minimumStock: 100
                                  });
                                  setShowProductSuggestionModal(true);
                                }}
                              >
                                💡 Suggest SKU: "{item.description.slice(0, 24)}..."
                              </span>
                            ) : (
                              <span>Tax details: {taxRate}% GST (₹{taxAmt.toFixed(2)})</span>
                            )}
                          </div>
                          <span style={{ fontSize: '10px' }}>Ex-Tax Subtotal: ₹{lineTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FOOTER SECTION: SPLIT OCR/DATES & TOTALS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', width: '100%' }}>
                {/* Left: OCR & Procurement details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* OCR Scanning box */}
                  <div className="ocr-drop-zone" style={{ padding: '16px' }}>
                    <ScanEye size={24} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
                    <h4 style={{ fontWeight: '700', fontSize: '13px', margin: '0 0 2px 0' }}>AI-Powered OCR Auto-Map</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>Upload invoice to auto-extract items, prices, and matches vendor.</p>
                    <input
                      type="file"
                      id="purchase-ocr-file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handlePurchaseOcrUpload}
                      disabled={ocrUploading}
                    />
                    <label htmlFor="purchase-ocr-file" className="ocr-label" style={{ padding: '6px 16px', fontSize: '12px' }}>
                      {ocrUploading ? '⏳ AI Analyzing...' : '📄 Scan Supplier Invoice'}
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Procurement Supplier *</label>
                    <select
                      className="form-input"
                      style={{ paddingLeft: '12px' }}
                      value={purchaseForm.supplierId}
                      onChange={(e) => setPurchaseForm((p: any) => ({ ...p, supplierId: e.target.value }))}
                      required
                    >
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.companyName} ({s.gstin || 'URD'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Supplier Bill No *</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '12px' }}
                        placeholder="INV-2026-001"
                        value={purchaseForm.originalInvoiceNo}
                        onChange={(e) => setPurchaseForm((p: any) => ({ ...p, originalInvoiceNo: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Purchase Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        style={{ paddingLeft: '12px' }}
                        value={purchaseForm.purchaseDate}
                        onChange={(e) => setPurchaseForm((p: any) => ({ ...p, purchaseDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Due Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        style={{ paddingLeft: '12px' }}
                        value={purchaseForm.dueDate}
                        onChange={(e) => setPurchaseForm((p: any) => ({ ...p, dueDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ paddingLeft: '12px' }}
                        placeholder="0.00"
                        value={purchaseForm.discountAmount}
                        onChange={(e) =>
                          setPurchaseForm((p: any) => ({ ...p, discountAmount: Number(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-input"
                      style={{ paddingLeft: '12px' }}
                      rows={2}
                      placeholder="e.g. Quality inspection done. Stock received in Section A."
                      value={purchaseForm.notes}
                      onChange={(e) => setPurchaseForm((p: any) => ({ ...p, notes: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Right: Calculations & Post Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="summary-panel" style={{ padding: '20px' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '12px', margin: '0 0 12px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      Material Receipt Totals
                    </h4>
                    <div className="summary-row sub">
                      <span>Subtotal</span>
                      <span>₹{sum.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row sub">
                      <span>CGST</span>
                      <span>₹{sum.cgst.toFixed(2)}</span>
                    </div>
                    <div className="summary-row sub">
                      <span>SGST</span>
                      <span>₹{sum.sgst.toFixed(2)}</span>
                    </div>
                    {sum.discount > 0 && (
                      <div className="summary-row sub" style={{ color: '#ef4444' }}>
                        <span>Discount</span>
                        <span>-₹{sum.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="summary-row total" style={{ fontSize: '16px' }}>
                      <span>Grand Total</span>
                      <span>₹{sum.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '14px', fontWeight: '700', fontSize: '15px' }}
                    onClick={handlePurchaseSubmit}
                    disabled={submitting}
                  >
                    {submitting ? '⏳ Recording Transaction...' : '✓ Post Purchase to Ledger'}
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* MODAL: PRODUCT SUGGESTION CREATION */}
      {showProductSuggestionModal && (
        <div className="modal-overlay" onClick={() => setShowProductSuggestionModal(false)}>
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
              <div>
                <h4 style={{ fontWeight: 'bold' }}>Register Raw Material SKU</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Bind AI OCR descriptive field into permanent master inventory.
                </p>
              </div>
              <button
                className="btn-logout"
                style={{ padding: '4px 8px' }}
                onClick={() => setShowProductSuggestionModal(false)}
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

            <form onSubmit={handleProductSuggestionSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Auto-Generated SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productSuggestionForm.sku}
                    onChange={(e) =>
                      setProductSuggestionForm((prev: any) => ({ ...prev, sku: e.target.value.toUpperCase() }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name / Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productSuggestionForm.name}
                    onChange={(e) => setProductSuggestionForm((prev: any) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Measurement Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productSuggestionForm.unit}
                    onChange={(e) => setProductSuggestionForm((prev: any) => ({ ...prev, unit: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">HSN Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productSuggestionForm.hsnCode}
                    onChange={(e) => setProductSuggestionForm((prev: any) => ({ ...prev, hsnCode: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Procurement Cost (₹/Unit)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productSuggestionForm.purchasePrice}
                    onChange={(e) =>
                      setProductSuggestionForm((prev: any) => ({ ...prev, purchasePrice: Number(e.target.value) }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Tax Bracket (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productSuggestionForm.gstRate}
                    onChange={(e) =>
                      setProductSuggestionForm((prev: any) => ({ ...prev, gstRate: Number(e.target.value) }))
                    }
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }} disabled={submitting}>
                {submitting ? 'Registering SKU...' : 'Create SKU & Bind to Purchase Line'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
