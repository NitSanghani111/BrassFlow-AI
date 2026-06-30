import React from 'react';
import { Layers, PlusCircle } from 'lucide-react';
import type { Product } from '../../types';

interface ProductsViewProps {
  products: Product[];
  showProductModal: boolean;
  setShowProductModal: (show: boolean) => void;
  productForm: {
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
  setProductForm: React.Dispatch<React.SetStateAction<any>>;
  handleProductSubmit: (e: React.FormEvent) => Promise<void>;
  showStockModal: boolean;
  setShowStockModal: (show: boolean) => void;
  stockForm: {
    productId: string;
    quantity: number;
    type: string;
    reference: string;
  };
  setStockForm: React.Dispatch<React.SetStateAction<any>>;
  handleStockSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  openProductDetail: (id: string) => void;
  activeProductDetail: Product | null;
  setActiveProductDetail: (product: Product | null) => void;
  actionError?: string;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  showProductModal,
  setShowProductModal,
  productForm,
  setProductForm,
  handleProductSubmit,
  showStockModal,
  setShowStockModal,
  stockForm,
  setStockForm,
  handleStockSubmit,
  submitting,
  openProductDetail,
  activeProductDetail,
  setActiveProductDetail,
  actionError
}) => {
  return (
    <div className="dashboard-content">
      <div className="glass-panel table-container">
        <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
          <span>Product Master Catalog</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-primary"
              style={{
                width: 'auto',
                padding: '8px 16px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fbbf24'
              }}
              onClick={() => setShowStockModal(true)}
            >
              <Layers size={16} style={{ marginRight: '8px' }} />
              Adjust Stock
            </button>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 16px' }}
              onClick={() => setShowProductModal(true)}
            >
              <PlusCircle size={16} style={{ marginRight: '8px' }} />
              Add Product
            </button>
          </div>
        </h3>
        <table className="premium-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>HSN Code</th>
              <th>GST Rate</th>
              <th>Purchase Price</th>
              <th>Selling Price</th>
              <th>Current Stock</th>
              <th>Min Level</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => {
                const isLow = Number(p.currentStock) < Number(p.minimumStock);
                return (
                  <tr key={p.id} className="clickable-row" onClick={() => openProductDetail(p.id)}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.hsnCode}</td>
                    <td>{Number(p.gstRate)}%</td>
                    <td>₹{Number(p.purchasePrice).toFixed(2)}</td>
                    <td>₹{Number(p.sellingPrice).toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold', color: isLow ? '#ef4444' : '#10b981' }}>
                      {Number(p.currentStock).toFixed(3)} {p.unit}
                      {isLow && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '10px',
                            background: 'rgba(239,68,68,0.2)',
                            padding: '2px 4px',
                            borderRadius: '3px'
                          }}
                        >
                          LOW
                        </span>
                      )}
                    </td>
                    <td>{Number(p.minimumStock).toFixed(0)} {p.unit}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No products in master catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD PRODUCT */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
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
              <h4>Add New Product Spec Sheet</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowProductModal(false)}>
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

            <form onSubmit={handleProductSubmit}>
              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px', marginBottom: '12px' }}
              >
                <div className="form-group">
                  <label className="form-label">SKU Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ROD-BR-12MM"
                    value={productForm.sku}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, sku: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Catalog Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Free Cutting Brass Rod 12mm"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Technical Specification / Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Composition details, dimensions, application standards."
                  value={productForm.description}
                  onChange={(e) => setProductForm((p: any) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}
              >
                <div className="form-group">
                  <label className="form-label">Product Category</label>
                  <select
                    className="form-input"
                    value={productForm.category}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="Brass Rods">Brass Rods</option>
                    <option value="Brass Ingots">Brass Ingots</option>
                    <option value="Brass Billets">Brass Billets</option>
                    <option value="Brass Scrap">Brass Scrap (Raw Scrap)</option>
                    <option value="Brass Turned Components">Brass Turned Components</option>
                    <option value="Hardware Parts">Hardware Parts</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">HSN Code (8 Digit) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.hsnCode}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, hsnCode: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Tax rate (%) *</label>
                  <select
                    className="form-input"
                    value={productForm.gstRate}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, gstRate: Number(e.target.value) }))}
                    required
                  >
                    <option value="18">18% (Standard Metals)</option>
                    <option value="12">12% (Fittings)</option>
                    <option value="5">5% (Special Scrap)</option>
                    <option value="28">28% (Luxury items)</option>
                    <option value="0">0% (Exempted)</option>
                  </select>
                </div>
              </div>

              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}
              >
                <div className="form-group">
                  <label className="form-label">Purchase Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={productForm.purchasePrice || ''}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, purchasePrice: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={productForm.sellingPrice || ''}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, sellingPrice: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Measurement Unit</label>
                  <select
                    className="form-input"
                    value={productForm.unit}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, unit: e.target.value }))}
                  >
                    <option value="KG">Kilogram (KG)</option>
                    <option value="PCS">Pieces (PCS)</option>
                    <option value="METERS">Meters (M)</option>
                    <option value="TONS">Metric Tons (TONS)</option>
                  </select>
                </div>
              </div>

              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}
              >
                <div className="form-group">
                  <label className="form-label">Opening Stock Quantity</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={productForm.openingStock || ''}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, openingStock: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Safety stock</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={productForm.minimumStock || ''}
                    onChange={(e) => setProductForm((p: any) => ({ ...p, minimumStock: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating Product...' : 'Add to Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST STOCK */}
      {showStockModal && (
        <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
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
              <h4>Log Physical Inventory Stock Level</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowStockModal(false)}>
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

            <form onSubmit={handleStockSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Target Product SKU *</label>
                <select
                  className="form-input"
                  value={stockForm.productId}
                  onChange={(e) => setStockForm((s: any) => ({ ...s, productId: e.target.value }))}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name} (Stock: {Number(p.currentStock).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="form-row"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}
              >
                <div className="form-group">
                  <label className="form-label">Adjustment Type *</label>
                  <select
                    className="form-input"
                    value={stockForm.type}
                    onChange={(e) => setStockForm((s: any) => ({ ...s, type: e.target.value }))}
                    required
                  >
                    <option value="ADD">IN (Receive Purchase/Production Output)</option>
                    <option value="SUBTRACT">OUT (Manual Stock Reduction / Dispatch)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Adjustment Weight/Qty *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={stockForm.quantity || ''}
                    onChange={(e) => setStockForm((s: any) => ({ ...s, quantity: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Reference (P.O. No, Challan No, or Audit Reason) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={stockForm.reference}
                  onChange={(e) => setStockForm((s: any) => ({ ...s, reference: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Applying Adjustment...' : 'Commit Transaction Log'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: PRODUCT DETAIL PROFILE */}
      {activeProductDetail && (
        <div className="drawer-overlay active" onClick={() => setActiveProductDetail(null)}>
          <div className="drawer-panel active" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">Product Technical Specifications</h3>
              <button className="drawer-close-btn" onClick={() => setActiveProductDetail(null)}>
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span className="status-badge info" style={{ fontSize: '12px' }}>
                  {activeProductDetail.sku}
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '8px' }}>
                  {activeProductDetail.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                  {activeProductDetail.category}
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
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>HSN CODE</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{activeProductDetail.hsnCode}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>GST TAX RATE</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{activeProductDetail.gstRate}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PURCHASE PRICE</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    ₹{Number(activeProductDetail.purchasePrice).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SELLING PRICE</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    ₹{Number(activeProductDetail.sellingPrice).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                  Physical Inventory Stock Status
                </h4>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CURRENT STOCK</div>
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '24px',
                        color:
                          Number(activeProductDetail.currentStock) < Number(activeProductDetail.minimumStock)
                            ? '#ef4444'
                            : '#10b981'
                      }}
                    >
                      {Number(activeProductDetail.currentStock).toFixed(3)} {activeProductDetail.unit}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SAFETY STOCK LEVEL</div>
                    <div style={{ fontWeight: 'bold', fontSize: '24px' }}>
                      {Number(activeProductDetail.minimumStock).toFixed(3)} {activeProductDetail.unit}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                  Product Ledger Description
                </h4>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {activeProductDetail.description || 'No description available for this catalog item.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
