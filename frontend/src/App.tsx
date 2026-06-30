import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Component Imports
import { LoginView } from './components/auth/LoginView';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { NotificationBanner } from './components/common/NotificationBanner';
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomersView } from './components/customers/CustomersView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { ProductsView } from './components/products/ProductsView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

// Type Imports
import type { User, Customer, Supplier, Product, Invoice, Purchase, Reminder, ReminderLog, DashboardAnalytics } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Master Data Lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    kpis: { totalOutstanding: 0, lowStockCount: 0, monthlySales: 0, pendingAmount: 0, pendingCount: 0 },
    recentInvoices: [],
    topCustomers: [],
    categoryStocks: []
  });

  // Action status indicators
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  
  // Custom screen state
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [ocrDetailDoc, setOcrDetailDoc] = useState<any | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Purchases list state
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [ocrUploading, setOcrUploading] = useState(false);

  // Profile drawers state
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [activeSupplierDetail, setActiveSupplierDetail] = useState<Supplier | null>(null);
  const [activeCustomerDetail, setActiveCustomerDetail] = useState<Customer | null>(null);

  // Suggestion Modal state
  const [showProductSuggestionModal, setShowProductSuggestionModal] = useState(false);
  const [productSuggestionForm, setProductSuggestionForm] = useState({
    sku: '', name: '', description: '', category: 'Brass Rods', hsnCode: '74072110', gstRate: 18, unit: 'KG', purchasePrice: 0, sellingPrice: 0, openingStock: 0, minimumStock: 100
  });
  const [pendingItemIndex, setPendingItemIndex] = useState<number | null>(null);

  // Purchases Form State
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    discountAmount: 0,
    originalInvoiceNo: '',
    notes: '',
    ocrDocumentId: ''
  });
  const [purchaseItems, setPurchaseItems] = useState<any[]>([
    { productId: '', quantity: 0, unitPrice: 0, discountPercentage: 0 }
  ]);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    companyName: '', contactName: '', email: '', phone: '', gstin: '', pan: '',
    billingStreet: '', billingCity: '', billingState: '', billingZip: '',
    shippingStreet: '', shippingCity: '', shippingState: '', shippingZip: '',
    paymentTermsDays: 30
  });

  const [supplierForm, setSupplierForm] = useState({
    companyName: '', contactName: '', email: '', phone: '', gstin: '', pan: '',
    billingStreet: '', billingCity: '', billingState: '', billingZip: '',
    paymentTermsDays: 15
  });

  const [productForm, setProductForm] = useState({
    sku: '', name: '', description: '', category: 'Brass Rods',
    hsnCode: '74072110', gstRate: 18, unit: 'KG',
    purchasePrice: 0, sellingPrice: 0, openingStock: 0, minimumStock: 100
  });

  const [stockForm, setStockForm] = useState({
    productId: '', quantity: 0, type: 'ADD', reference: 'Manual Adjust'
  });

  const [reminderForm, setReminderForm] = useState({
    invoiceId: '', reminderFrequency: 'WEEKLY', channel: 'WHATSAPP',
    nextReminderDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '', invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    discountAmount: 0, paymentTerms: 'Net 30 Days', notes: '', termsAndConditions: '1. Interest @ 18% p.a. will be charged for delayed payments.\n2. Disputes are subject to Jamnagar jurisdiction.'
  });
  
  const [invoiceItems, setInvoiceItems] = useState<any[]>([
    { productId: '', quantity: 0, unitPrice: 0, discountPercentage: 0 }
  ]);

  // Load basic configurations & theme
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const currentTheme = savedTheme || 'dark';
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, []);

  // Clear action notifications when active tab or modals toggle
  useEffect(() => {
    setActionError('');
    setActionSuccess('');
  }, [
    activeTab,
    showCustomerModal,
    showSupplierModal,
    showProductModal,
    showStockModal,
    isCreatingPurchase,
    isCreatingInvoice,
    showReminderModal,
    showProductSuggestionModal
  ]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        let matched = true;
        switch (e.key.toLowerCase()) {
          case 'd':
            setActiveTab('dashboard');
            break;
          case 'c':
            setActiveTab('customers');
            break;
          case 's':
            setActiveTab('suppliers');
            break;
          case 'p':
            setActiveTab('products');
            break;
          case 'i':
            setActiveTab('invoices');
            break;
          case 'r':
            setShowReminderModal(true);
            break;
          case 'b':
            setActiveTab('purchases');
            break;
          default:
            matched = false;
        }
        if (matched) {
          e.preventDefault();
          setIsCreatingInvoice(false);
          setIsCreatingPurchase(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clear transient messages when changing tabs
  useEffect(() => {
    setActionSuccess('');
    setActionError('');
  }, [activeTab]);

  // Fetch data on active tab changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchTabData();
    }
  }, [isLoggedIn, activeTab]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const fetchTabData = async () => {
    setRefreshing(true);
    setActionError('');
    try {
      if (activeTab === 'dashboard') {
        const res = await axios.get(`${API_BASE_URL}/analytics/dashboard`, getHeaders());
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
        const remRes = await axios.get(`${API_BASE_URL}/reminders`, getHeaders());
        if (remRes.data.success) {
          setReminders(remRes.data.data);
        }
      } else if (activeTab === 'customers') {
        const res = await axios.get(`${API_BASE_URL}/customers`, getHeaders());
        setCustomers(res.data.data);
      } else if (activeTab === 'suppliers') {
        const res = await axios.get(`${API_BASE_URL}/suppliers`, getHeaders());
        setSuppliers(res.data.data);
      } else if (activeTab === 'products') {
        const res = await axios.get(`${API_BASE_URL}/products`, getHeaders());
        setProducts(res.data.data);
      } else if (activeTab === 'invoices') {
        const res = await axios.get(`${API_BASE_URL}/invoices`, getHeaders());
        setInvoices(res.data.data);
        const custRes = await axios.get(`${API_BASE_URL}/customers`, getHeaders());
        setCustomers(custRes.data.data);
        const prodRes = await axios.get(`${API_BASE_URL}/products`, getHeaders());
        setProducts(prodRes.data.data);
        const remRes = await axios.get(`${API_BASE_URL}/reminders`, getHeaders());
        if (remRes.data.success) {
          setReminders(remRes.data.data);
        }
        const logRes = await axios.get(`${API_BASE_URL}/reminders/logs`, getHeaders());
        if (logRes.data.success) {
          setReminderLogs(logRes.data.data);
        }
      } else if (activeTab === 'purchases') {
        const res = await axios.get(`${API_BASE_URL}/purchases`, getHeaders());
        setPurchases(res.data.data);
        const suppRes = await axios.get(`${API_BASE_URL}/suppliers`, getHeaders());
        setSuppliers(suppRes.data.data);
        const prodRes = await axios.get(`${API_BASE_URL}/products`, getHeaders());
        setProducts(prodRes.data.data);
      } else if (activeTab === 'reports') {
        const res = await axios.get(`${API_BASE_URL}/analytics/dashboard`, getHeaders());
        setAnalytics(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to sync data with server.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken: token }, getHeaders());
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUser(null);
      setEmail('');
      setPassword('');
      setLoginError('');
    }
  };

  const getErrorMessage = (err: any, defaultMsg: string): string => {
    if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
      const details = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
      return `Validation failed - ${details}`;
    }
    return err.response?.data?.message || defaultMsg;
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/customers`, customerForm, getHeaders());
      if (res.data.success) {
        setActionSuccess('Customer created successfully.');
        setShowCustomerModal(false);
        setCustomerForm({
          companyName: '', contactName: '', email: '', phone: '', gstin: '', pan: '',
          billingStreet: '', billingCity: '', billingState: '', billingZip: '',
          shippingStreet: '', shippingCity: '', shippingState: '', shippingZip: '',
          paymentTermsDays: 30
        });
        fetchTabData();
      }
    } catch (err: any) {
      setActionError(getErrorMessage(err, 'Error occurred while creating customer.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openProductDetail = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products/${id}`, getHeaders());
      if (res.data.success) {
        setActiveProductDetail(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setActionError('Failed to fetch product details.');
    }
  };

  const openSupplierDetail = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/suppliers/${id}`, getHeaders());
      if (res.data.success) {
        setActiveSupplierDetail(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setActionError('Failed to fetch supplier details.');
    }
  };

  const openCustomerDetail = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customers/${id}`, getHeaders());
      if (res.data.success) {
        setActiveCustomerDetail(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setActionError('Failed to fetch customer details.');
    }
  };

  const handleOcrAutoMap = async (ocrDoc: any) => {
    if (!ocrDoc || !ocrDoc.extractedData) return;
    const data = ocrDoc.extractedData;

    let supplierId = '';
    const vendorGstin = data.supplierGstin || data.vendor?.gstin || '';
    const vendorName = data.supplierName || data.vendor?.companyName || '';

    if (vendorGstin) {
      const match = suppliers.find(s => s.gstin?.toLowerCase() === vendorGstin.toLowerCase());
      if (match) supplierId = match.id;
    }
    if (!supplierId && vendorName) {
      const match = suppliers.find(s => s.companyName.toLowerCase().includes(vendorName.toLowerCase()));
      if (match) supplierId = match.id;
    }

    setPurchaseForm(prev => ({
      ...prev,
      supplierId: supplierId || prev.supplierId,
      originalInvoiceNo: data.invoiceNumber || '',
      purchaseDate: data.invoiceDate ? data.invoiceDate.split('T')[0] : prev.purchaseDate,
      dueDate: data.dueDate ? data.dueDate.split('T')[0] : prev.dueDate,
      ocrDocumentId: ocrDoc.id
    }));

    if (data.items && Array.isArray(data.items)) {
      const updatedItems = [];
      for (const item of data.items) {
        let productId = '';
        const itemSku = (item.productSku || item.sku || '').toUpperCase();
        if (itemSku) {
          const match = products.find(p => p.sku?.toLowerCase() === itemSku.toLowerCase());
          if (match) {
            productId = match.id;
          } else {
            // Automatically register product in database
            try {
              const newProdPayload = {
                sku: itemSku,
                name: item.description || `Auto OCR Product ${itemSku}`,
                description: 'Automatically created during AI OCR upload.',
                category: 'Raw Materials',
                hsnCode: '74040012',
                gstRate: Number(item.gstRate || 18),
                unit: 'KG',
                purchasePrice: Number(item.rate || item.unitPrice || 0),
                sellingPrice: Number(item.rate || item.unitPrice || 0) * 1.25,
                openingStock: 0,
                minimumStock: 100
              };
              const createRes = await axios.post(`${API_BASE_URL}/products`, newProdPayload, getHeaders());
              if (createRes.data.success) {
                const createdProduct = createRes.data.data;
                productId = createdProduct.id;
                // Append to products state
                setProducts(prev => [...prev, createdProduct]);
              }
            } catch (createErr) {
              console.error('Failed to auto-create OCR product', createErr);
            }
          }
        }
        if (!productId && item.description) {
          const match = products.find(p => p.name.toLowerCase().includes(item.description.toLowerCase()) || p.description?.toLowerCase().includes(item.description.toLowerCase()));
          if (match) productId = match.id;
        }

        updatedItems.push({
          productId: productId || '',
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || item.rate || 0,
          discountPercentage: item.discountPercentage || 0,
          description: item.description || ''
        });
      }

      if (updatedItems.length > 0) {
        setPurchaseItems(updatedItems);
      }
      fetchTabData();
    }

    setActionSuccess('AI OCR parsing completed: Auto-populated matching supplier, invoice number, items, and tax rates!');
  };

  const handlePurchaseOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setOcrUploading(true);
    setActionError('');
    setActionSuccess('Uploading supplier invoice file for background AI parsing...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'PURCHASE_BILL');

    try {
      const res = await axios.post(`${API_BASE_URL}/ocr/upload`, formData, {
        headers: {
          ...getHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        const docId = res.data.data.id;
        setActionSuccess('Uploaded successfully. Analyzing data structure...');
        
        const interval = setInterval(async () => {
          try {
            const detailRes = await axios.get(`${API_BASE_URL}/ocr/${docId}`, getHeaders());
            if (detailRes.data.success) {
              const status = detailRes.data.data.status;
              if (status === 'COMPLETED' || status === 'FAILED') {
                clearInterval(interval);
                setOcrUploading(false);
                 if (status === 'COMPLETED') {
                  handleOcrAutoMap(detailRes.data.data);
                  alert('🎉 Success! Supplier invoice parsed and mapped successfully. All items auto-populated and unregistered products added to inventory!');
                } else {
                  setActionError(`AI OCR processing failed: ${detailRes.data.data.errorMessage}`);
                }
              }
            }
          } catch (pollErr) {
            clearInterval(interval);
            setOcrUploading(false);
            setActionError('Failed polling OCR parsing status.');
          }
        }, 1000);
      }
    } catch (err: any) {
      setOcrUploading(false);
      setActionError(err.response?.data?.message || 'Failed to upload document for OCR.');
    }
  };

  const handleProductSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await axios.post(`${API_BASE_URL}/products`, productSuggestionForm, getHeaders());
      if (res.data.success) {
        const newProduct = res.data.data;
        setProducts(prev => [...prev, newProduct]);
        setActionSuccess(`Product suggestion ${newProduct.sku} created and bound successfully!`);
        
        if (pendingItemIndex !== null) {
          const updated = [...purchaseItems];
          updated[pendingItemIndex].productId = newProduct.id;
          updated[pendingItemIndex].unitPrice = Number(newProduct.purchasePrice);
          setPurchaseItems(updated);
        }
        
        setShowProductSuggestionModal(false);
        setPendingItemIndex(null);
      }
    } catch (err: any) {
      setActionError(getErrorMessage(err, 'Error occurred while creating product suggestion.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    if (!purchaseForm.supplierId) {
      setActionError('Supplier is required.');
      setSubmitting(false);
      return;
    }

    const invalidItem = purchaseItems.find(item => !item.productId || item.quantity <= 0 || item.unitPrice <= 0);
    if (invalidItem) {
      setActionError('All purchase items must have a selected product, quantity > 0, and price > 0.');
      setSubmitting(false);
      return;
    }

    const payload = {
      ...purchaseForm,
      discountAmount: Number(purchaseForm.discountAmount),
      items: purchaseItems.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountPercentage: Number(item.discountPercentage)
      }))
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/purchases`, payload, getHeaders());
      if (res.data.success) {
        setActionSuccess('Purchase record created, stock levels adjusted, and supplier account balance logged.');
        setIsCreatingPurchase(false);
        setPurchaseForm({
          supplierId: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          discountAmount: 0,
          originalInvoiceNo: '',
          notes: '',
          ocrDocumentId: ''
        });
        setPurchaseItems([{ productId: '', quantity: 0, unitPrice: 0, discountPercentage: 0 }]);
        fetchTabData();
      }
    } catch (err: any) {
      setActionError(getErrorMessage(err, 'Error occurred while creating purchase.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/suppliers`, supplierForm, getHeaders());
      if (res.data.success) {
        setActionSuccess('Supplier created successfully.');
        setShowSupplierModal(false);
        setSupplierForm({
          companyName: '', contactName: '', email: '', phone: '', gstin: '', pan: '',
          billingStreet: '', billingCity: '', billingState: '', billingZip: '',
          paymentTermsDays: 15
        });
        fetchTabData();
      }
    } catch (err: any) {
      setActionError(getErrorMessage(err, 'Error occurred while creating supplier.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      const payload = {
        ...productForm,
        gstRate: Number(productForm.gstRate),
        purchasePrice: Number(productForm.purchasePrice),
        sellingPrice: Number(productForm.sellingPrice),
        openingStock: Number(productForm.openingStock),
        currentStock: Number(productForm.openingStock),
        minimumStock: Number(productForm.minimumStock),
      };
      const res = await axios.post(`${API_BASE_URL}/products`, payload, getHeaders());
      if (res.data.success) {
        setActionSuccess('Product created successfully.');
        setShowProductModal(false);
        setProductForm({
          sku: '', name: '', description: '', category: 'Brass Rods',
          hsnCode: '74072110', gstRate: 18, unit: 'KG',
          purchasePrice: 0, sellingPrice: 0, openingStock: 0, minimumStock: 100
        });
        fetchTabData();
      }
    } catch (err: any) {
      setActionError(getErrorMessage(err, 'Error occurred while creating product.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      const payload = {
        quantity: Number(stockForm.quantity),
        type: stockForm.type,
        reference: stockForm.reference
      };
      const res = await axios.post(`${API_BASE_URL}/products/${stockForm.productId}/adjust-stock`, payload, getHeaders());
      if (res.data.success) {
        setActionSuccess('Stock level adjusted successfully.');
        setShowStockModal(false);
        setStockForm({ productId: '', quantity: 0, type: 'ADD', reference: 'Manual Adjust' });
        fetchTabData();
      }
    } catch (err: any) {
      setActionError(getErrorMessage(err, 'Error adjusting product stock.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/reminders`, reminderForm, getHeaders());
      if (res.data.success) {
        setActionSuccess('Payment reminder scheduled successfully.');
        setShowReminderModal(false);
        fetchTabData();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Error scheduling payment reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerReminderNow = async (reminderId: string) => {
    setActionSuccess('');
    setActionError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/reminders/${reminderId}/trigger`, {}, getHeaders());
      if (res.data.success) {
        setActionSuccess('Follow-up notification processed (simulated).');
        fetchTabData();
        if (res.data.data && res.data.data.whatsappUrl) {
          window.open(res.data.data.whatsappUrl, '_blank');
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to dispatch manual notification.');
    }
  };

  const getLiveGSTCalculations = () => {
    const selectedCust = customers.find(c => c.id === invoiceForm.customerId);
    const isLocal = selectedCust ? (selectedCust.billingState.toLowerCase().trim() === 'gujarat') : true;
    
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    invoiceItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const rate = Number(product.gstRate);
        const itemSubtotal = item.quantity * item.unitPrice;
        const discountAmt = (itemSubtotal * item.discountPercentage) / 100;
        const taxable = itemSubtotal - discountAmt;
        
        subtotal += taxable;
        if (isLocal) {
          cgst += (taxable * (rate / 2)) / 100;
          sgst += (taxable * (rate / 2)) / 100;
        } else {
          igst += (taxable * rate) / 100;
        }
      }
    });
    
    const rawTotal = subtotal + cgst + sgst + igst - Number(invoiceForm.discountAmount);
    const grandTotal = Math.round(rawTotal);
    const roundOff = grandTotal - rawTotal;
    
    return { subtotal, cgst, sgst, igst, roundOff, grandTotal };
  };

  const getPurchaseTotals = () => {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    purchaseItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return;

      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const disc = Number(item.discountPercentage) || 0;

      const gross = qty * price;
      const afterDiscount = gross - (gross * (disc / 100));
      subtotal += afterDiscount;

      const rate = Number(prod.gstRate) || 0;
      const tax = afterDiscount * (rate / 100);
      
      cgst += tax / 2;
      sgst += tax / 2;
    });

    const discount = Number(purchaseForm.discountAmount) || 0;
    const grandTotal = Math.max(0, subtotal + cgst + sgst + igst - discount);

    return {
      subtotal,
      cgst,
      sgst,
      igst,
      discount,
      grandTotal
    };
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.customerId) {
      setActionError('Please select a customer.');
      return;
    }
    
    const validItems = invoiceItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      setActionError('Please add at least one product item.');
      return;
    }
    
    setSubmitting(true);
    setActionError('');
    try {
      const invoiceData = {
        ...invoiceForm,
        discountAmount: Number(invoiceForm.discountAmount),
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discountPercentage: Number(item.discountPercentage)
        }))
      };
      
      const res = await axios.post(`${API_BASE_URL}/invoices`, invoiceData, getHeaders());
      if (res.data.success) {
        setActionSuccess('Invoice finalized, stock levels updated, and accounts receivable registered.');
        setIsCreatingInvoice(false);
        setInvoiceForm({
          customerId: '', invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          discountAmount: 0, paymentTerms: 'Net 30 Days', notes: '', termsAndConditions: '1. Interest @ 18% p.a. will be charged for delayed payments.\n2. Disputes are subject to Jamnagar jurisdiction.'
        });
        setInvoiceItems([{ productId: '', quantity: 0, unitPrice: 0, discountPercentage: 0 }]);
        fetchTabData();
        
        // Auto-download PDF
        if (res.data.data.pdfUrl) {
          triggerDownloadPDF(res.data.data.pdfUrl);
        }
      }
    } catch (err: any) {
      setActionError(getErrorMessage(err, 'Error occurred while creating tax invoice.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOcrReview = async (docId: string) => {
    setActionError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/ocr/${docId}/review`, {}, getHeaders());
      if (res.data.success) {
        setActionSuccess('Document marked as reviewed successfully.');
        setOcrDetailDoc(res.data.data);
        fetchTabData();
      }
    } catch (err: any) {
      setActionError('Failed to review document.');
    }
  };

  const triggerDownloadPDF = (pdfUrl: string) => {
    const filename = pdfUrl.split('/').pop();
    const token = localStorage.getItem('token');
    
    axios({
      url: `http://localhost:5000${pdfUrl}`,
      method: 'GET',
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'invoice.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch((err) => {
      console.error(err);
      setActionError('Failed to download PDF invoice.');
    });
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <LoginView
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        isLoading={isLoading}
        onLogin={handleLogin}
      />
    );
  }

  // MAIN VIEW
  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsCreatingInvoice={setIsCreatingInvoice}
        setIsCreatingPurchase={setIsCreatingPurchase}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-panel">
        {/* Header Navigation */}
        <Header
          activeTab={activeTab}
          theme={theme}
          toggleTheme={toggleTheme}
          fetchTabData={fetchTabData}
          refreshing={refreshing}
        />

        {/* Global Notification Banner */}
        <NotificationBanner actionError={actionError} actionSuccess={actionSuccess} />

        {/* VIEW ROUTER */}
        {activeTab === 'dashboard' && (
          <DashboardView
            analytics={analytics}
            reminders={reminders}
            setActiveTab={setActiveTab}
            setIsCreatingInvoice={setIsCreatingInvoice}
            setIsCreatingPurchase={setIsCreatingPurchase}
            setShowReminderModal={setShowReminderModal}
            setShowStockModal={setShowStockModal}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            showCustomerModal={showCustomerModal}
            setShowCustomerModal={setShowCustomerModal}
            customerForm={customerForm}
            setCustomerForm={setCustomerForm}
            handleCustomerSubmit={handleCustomerSubmit}
            submitting={submitting}
            openCustomerDetail={openCustomerDetail}
            activeCustomerDetail={activeCustomerDetail}
            setActiveCustomerDetail={setActiveCustomerDetail}
            actionError={actionError}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersView
            suppliers={suppliers}
            showSupplierModal={showSupplierModal}
            setShowSupplierModal={setShowSupplierModal}
            supplierForm={supplierForm}
            setSupplierForm={setSupplierForm}
            handleSupplierSubmit={handleSupplierSubmit}
            submitting={submitting}
            openSupplierDetail={openSupplierDetail}
            activeSupplierDetail={activeSupplierDetail}
            setActiveSupplierDetail={setActiveSupplierDetail}
            actionError={actionError}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={products}
            showProductModal={showProductModal}
            setShowProductModal={setShowProductModal}
            productForm={productForm}
            setProductForm={setProductForm}
            handleProductSubmit={handleProductSubmit}
            showStockModal={showStockModal}
            setShowStockModal={setShowStockModal}
            stockForm={stockForm}
            setStockForm={setStockForm}
            handleStockSubmit={handleStockSubmit}
            submitting={submitting}
            openProductDetail={openProductDetail}
            activeProductDetail={activeProductDetail}
            setActiveProductDetail={setActiveProductDetail}
            actionError={actionError}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesView
            purchases={purchases}
            suppliers={suppliers}
            products={products}
            isCreatingPurchase={isCreatingPurchase}
            setIsCreatingPurchase={setIsCreatingPurchase}
            purchaseForm={purchaseForm}
            setPurchaseForm={setPurchaseForm}
            purchaseItems={purchaseItems}
            setPurchaseItems={setPurchaseItems}
            getPurchaseTotals={getPurchaseTotals}
            ocrUploading={ocrUploading}
            handlePurchaseOcrUpload={handlePurchaseOcrUpload}
            handlePurchaseSubmit={handlePurchaseSubmit}
            submitting={submitting}
            showProductSuggestionModal={showProductSuggestionModal}
            setShowProductSuggestionModal={setShowProductSuggestionModal}
            productSuggestionForm={productSuggestionForm}
            setProductSuggestionForm={setProductSuggestionForm}
            handleProductSuggestionSubmit={handleProductSuggestionSubmit}
            setPendingItemIndex={setPendingItemIndex}
            actionError={actionError}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesView
            invoices={invoices}
            customers={customers}
            products={products}
            reminders={reminders}
            reminderLogs={reminderLogs}
            isCreatingInvoice={isCreatingInvoice}
            setIsCreatingInvoice={setIsCreatingInvoice}
            invoiceForm={invoiceForm}
            setInvoiceForm={setInvoiceForm}
            invoiceItems={invoiceItems}
            setInvoiceItems={setInvoiceItems}
            getLiveGSTCalculations={getLiveGSTCalculations}
            handleInvoiceSubmit={handleInvoiceSubmit}
            triggerDownloadPDF={triggerDownloadPDF}
            setReminderForm={setReminderForm}
            showReminderModal={showReminderModal}
            setShowReminderModal={setShowReminderModal}
            reminderForm={reminderForm}
            handleReminderSubmit={handleReminderSubmit}
            triggerReminderNow={triggerReminderNow}
            submitting={submitting}
            actionError={actionError}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView analytics={analytics} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            API_BASE_URL={API_BASE_URL}
            getHeaders={getHeaders}
            actionError={actionError}
            setActionError={setActionError}
            actionSuccess={actionSuccess}
            setActionSuccess={setActionSuccess}
          />
        )}
      </main>

      {/* Inspect Extracted OCR Data Modal Drawer (Rendered Globally) */}
      {ocrDetailDoc && (
        <div className="modal-overlay" onClick={() => setOcrDetailDoc(null)}>
          <div className="glass-panel modal-card" style={{ maxWidth: '650px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4>Extracted AI OCR Metadata</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setOcrDetailDoc(null)}>✕</button>
            </div>
            
            <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <strong>Extracted Vendor:</strong> {ocrDetailDoc.extractedData?.vendor?.companyName || 'N/A'}<br />
                <strong>GSTIN:</strong> {ocrDetailDoc.extractedData?.vendor?.gstin || 'N/A'}<br />
                <strong>Invoice Ref:</strong> {ocrDetailDoc.extractedData?.invoiceNumber || 'N/A'}<br />
                <strong>Date:</strong> {ocrDetailDoc.extractedData?.invoiceDate || 'N/A'}
              </div>

              <table className="premium-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Item SKU</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>GST Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ocrDetailDoc.extractedData?.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td><strong>{item.sku}</strong><br />{item.description}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>₹{item.rate}</td>
                      <td>{item.gstRate}%</td>
                      <td>₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: 'right', marginTop: '16px', fontWeight: 'bold', fontSize: '15px' }}>
                Grand Total: ₹{ocrDetailDoc.extractedData?.totals?.grandTotal?.toLocaleString('en-IN')}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  OCR Confidence Score: <strong style={{ color: 'var(--primary)' }}>{Number(ocrDetailDoc.confidenceScore)}%</strong>
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {!ocrDetailDoc.reviewed ? (
                    <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => handleOcrReview(ocrDetailDoc.id)}>
                      Approve & Sync Ledger
                    </button>
                  ) : (
                    <span className="status-badge success" style={{ padding: '8px 16px' }}>Reviewed & Approved</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
