import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  Factory,
  Package,
  FileSpreadsheet,
  ScanEye,
  BellRing,
  BarChart3,
  LogOut,
  DollarSign,
  AlertTriangle,
  FileText,
  PlusCircle,
  Mail,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle,
  Truck,
  Database,
  Trash2,
  UserPlus,
  Layers,
  FileDown,
  RefreshCw,
  Send,
  Sun,
  Moon
} from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Helper to get Auth Headers
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
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [reminderLogs, setReminderLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
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
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [ocrUploading, setOcrUploading] = useState(false);

  // Profile drawers state
  const [activeProductDetail, setActiveProductDetail] = useState<any | null>(null);
  const [activeSupplierDetail, setActiveSupplierDetail] = useState<any | null>(null);
  const [activeCustomerDetail, setActiveCustomerDetail] = useState<any | null>(null);

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
  const [purchaseItems, setPurchaseItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number; discountPercentage: number; description?: string }>>([
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
  
  const [invoiceItems, setInvoiceItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number; discountPercentage: number }>>([
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

  // Clear transient message banners when changing tabs
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

  // Submit Customer Creation
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
      setActionError(err.response?.data?.message || 'Error occurred while creating customer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Master Data Profile Drawer Fetchers
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

  // OCR Auto-Mapping Logic
  const handleOcrAutoMap = (ocrDoc: any) => {
    if (!ocrDoc || !ocrDoc.extractedData) return;
    const data = ocrDoc.extractedData;

    let supplierId = '';
    if (data.supplierGstin) {
      const match = suppliers.find(s => s.gstin?.toLowerCase() === data.supplierGstin.toLowerCase());
      if (match) supplierId = match.id;
    }
    if (!supplierId && data.supplierName) {
      const match = suppliers.find(s => s.companyName.toLowerCase().includes(data.supplierName.toLowerCase()));
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
      const mapped = data.items.map((item: any) => {
        let productId = '';
        if (item.productSku) {
          const match = products.find(p => p.sku?.toLowerCase() === item.productSku.toLowerCase());
          if (match) productId = match.id;
        }
        if (!productId && item.description) {
          const match = products.find(p => p.name.toLowerCase().includes(item.description.toLowerCase()) || p.description?.toLowerCase().includes(item.description.toLowerCase()));
          if (match) productId = match.id;
        }

        return {
          productId: productId || '',
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          discountPercentage: item.discountPercentage || 0,
          description: item.description || ''
        };
      });

      if (mapped.length > 0) {
        setPurchaseItems(mapped);
      }
    }

    setActionSuccess('AI OCR parsing completed: Auto-populated matching supplier, invoice number, items, and tax rates!');
  };

  // Upload Purchase Document OCR
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

  // Submit Product Suggestion creation
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
      setActionError(err.response?.data?.message || 'Error occurred while creating product suggestion.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Purchase Creation
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
      setActionError(err.response?.data?.message || 'Error occurred while creating purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Supplier Creation
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
      setActionError(err.response?.data?.message || 'Error occurred while creating supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Product Creation
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
      setActionError(err.response?.data?.message || 'Error occurred while creating product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Stock Adjustment
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
      setActionError(err.response?.data?.message || 'Error adjusting product stock.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Payment Reminder Setup
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

  // Trigger Manual Reminder Notification
  const triggerReminderNow = async (reminderId: string) => {
    setActionSuccess('');
    setActionError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/reminders/${reminderId}/trigger`, {}, getHeaders());
      if (res.data.success) {
        setActionSuccess('Follow-up notification sent successfully (WhatsApp/Email simulated).');
        fetchTabData();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to dispatch manual notification.');
    }
  };

  // Dynamic invoice live values computation
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

  // Submit Invoice Wizard
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
      const payload = {
        customerId: invoiceForm.customerId,
        invoiceDate: new Date(invoiceForm.invoiceDate),
        dueDate: new Date(invoiceForm.dueDate),
        discountAmount: Number(invoiceForm.discountAmount),
        paymentTerms: invoiceForm.paymentTerms,
        notes: invoiceForm.notes,
        termsAndConditions: invoiceForm.termsAndConditions,
        items: validItems
      };
      
      const res = await axios.post(`${API_BASE_URL}/invoices`, payload, getHeaders());
      if (res.data.success) {
        setActionSuccess('GST Tax Invoice generated and PDF created.');
        setIsCreatingInvoice(false);
        setInvoiceItems([{ productId: '', quantity: 0, unitPrice: 0, discountPercentage: 0 }]);
        fetchTabData();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Error occurred while creating tax invoice.');
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
    
    // Direct file download using token Authorization
    axios({
      url: `http://localhost:5000${pdfUrl}`,
      method: 'GET',
      responseType: 'blob', // Important
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

  const getInitials = () => {
    if (!user) return 'US';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const totals = getLiveGSTCalculations();

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="auth-wrapper">
        <div className="glass-panel auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Factory size={32} className="auth-logo-icon" />
              <span className="auth-logo-text">AI Brass ERP</span>
            </div>
            <p className="auth-subtitle">Enterprise Control System & Foundation Ledger</p>
          </div>

          {loginError && (
            <div className="auth-error">
              <AlertTriangle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Factory Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@brassflow.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN VIEW
  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="auth-logo" style={{ justifyContent: 'flex-start', marginBottom: 0 }}>
            <Factory size={24} className="auth-logo-icon" />
            <span className="auth-logo-text" style={{ fontSize: '18px' }}>AI Brass ERP</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <a href="#" className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setIsCreatingInvoice(false); setIsCreatingPurchase(false); }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>
          <a href="#" className={`menu-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => { setActiveTab('customers'); setIsCreatingInvoice(false); setIsCreatingPurchase(false); }}>
            <Users size={18} />
            <span>Customers</span>
          </a>
          <a href="#" className={`menu-item ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => { setActiveTab('suppliers'); setIsCreatingInvoice(false); setIsCreatingPurchase(false); }}>
            <Users size={18} />
            <span>Suppliers</span>
          </a>
          <a href="#" className={`menu-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => { setActiveTab('purchases'); setIsCreatingInvoice(false); setIsCreatingPurchase(false); }}>
            <Truck size={18} />
            <span>Purchases</span>
          </a>
          <a href="#" className={`menu-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => { setActiveTab('products'); setIsCreatingInvoice(false); setIsCreatingPurchase(false); }}>
            <Package size={18} />
            <span>Products</span>
          </a>
          <a href="#" className={`menu-item ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => { setActiveTab('invoices'); setIsCreatingInvoice(false); setIsCreatingPurchase(false); }}>
            <FileSpreadsheet size={18} />
            <span>Invoices</span>
          </a>
          <a href="#" className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); setIsCreatingInvoice(false); setIsCreatingPurchase(false); }}>
            <BarChart3 size={18} />
            <span>Reports</span>
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
              <div className="user-name">{`${user?.firstName} ${user?.lastName}`}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-panel">
        <header className="top-nav">
          <div className="page-title">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Control Panel
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button className="action-btn" style={{ padding: '6px 10px' }} onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="action-btn" style={{ padding: '6px 10px' }} onClick={fetchTabData} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            </button>
            <span className="status-badge success" style={{ fontSize: '12px' }}>
              <Database size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Live DB Online
            </span>
          </div>
        </header>

        {/* Global Notification Banner */}
        {actionError && (
          <div className="auth-error" style={{ margin: '16px 24px 0 24px', borderRadius: '8px' }}>
            <AlertTriangle size={18} />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="auth-error" style={{ margin: '16px 24px 0 24px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399' }}>
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="glass-panel kpi-card">
                <div className="kpi-header">
                  <span>Monthly Sales</span>
                  <div className="kpi-icon-wrapper"><TrendingUp size={16} /></div>
                </div>
                <div className="kpi-value">
                  {analytics.kpis.monthlySales ? analytics.kpis.monthlySales.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
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
                  {analytics.kpis.todaySales ? analytics.kpis.todaySales.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
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
                  {analytics.kpis.todayPurchases ? analytics.kpis.todayPurchases.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
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
                  {analytics.kpis.totalOutstanding.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
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
                  {analytics.kpis.totalPayable ? analytics.kpis.totalPayable.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '₹0'}
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
                <div className="kpi-value" style={{ color: analytics.kpis.lowStockCount > 0 ? '#ef4444' : '#10b981' }}>
                  {analytics.kpis.lowStockCount} Products
                </div>
                <div className="kpi-trend neutral">
                  <span>Below safety margin</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="actions-panel">
              <h3 className="section-title"><PlusCircle size={18} className="action-icon" /> Quick Actions</h3>
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
                    {analytics.recentInvoices.length > 0 ? (
                      analytics.recentInvoices.map((inv: any) => (
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
                  {analytics.recentActivities && analytics.recentActivities.length > 0 ? (
                    analytics.recentActivities.map((act: any) => (
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
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No recent activity.</div>
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
        )}

        {/* CUSTOMERS VIEW */}
        {activeTab === 'customers' && (
          <div className="dashboard-content">
            <div className="glass-panel table-container">
              <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
                <span>Customer Registry</span>
                <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setShowCustomerModal(true)}>
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
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No customers registered. Click Add Customer to get started.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUPPLIERS VIEW */}
        {activeTab === 'suppliers' && (
          <div className="dashboard-content">
            <div className="glass-panel table-container">
              <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
                <span>Supplier Registry (Procurement Vendors)</span>
                <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setShowSupplierModal(true)}>
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
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No suppliers registered. Click Add Supplier to start cataloging.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS VIEW */}
        {activeTab === 'products' && (
          <div className="dashboard-content">
            <div className="glass-panel table-container">
              <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
                <span>Product Master Catalog</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' }} onClick={() => setShowStockModal(true)}>
                    <Layers size={16} style={{ marginRight: '8px' }} />
                    Adjust Stock
                  </button>
                  <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setShowProductModal(true)}>
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
                            {isLow && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(239,68,68,0.2)', padding: '2px 4px', borderRadius: '3px' }}>LOW</span>}
                          </td>
                          <td>{Number(p.minimumStock).toFixed(0)} {p.unit}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No products in master catalog.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PURCHASE WIZARD MODAL */}
        {isCreatingPurchase && (
          <div className="modal-overlay" onClick={() => setIsCreatingPurchase(false)}>
            <div className="glass-panel modal-card wizard-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2><Truck size={22} style={{ color: 'var(--primary)' }} /> Log New Purchase Order</h2>
                  <p className="modal-subtitle">Record material receipts. Upload supplier invoice for AI auto-fill or enter manually.</p>
                </div>
                <button className="modal-close-btn" onClick={() => setIsCreatingPurchase(false)}>✕ Close</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Left: OCR + Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="ocr-drop-zone">
                    <ScanEye size={28} style={{ color: 'var(--primary)', marginBottom: '6px' }} />
                    <h4 style={{ fontWeight: '700', fontSize: '14px', margin: '0 0 4px 0' }}>AI-Powered OCR Auto-Map</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Upload PDF/Image — extracts items, prices, tax rates, matches supplier instantly.</p>
                    <input type="file" id="purchase-ocr-file" accept=".pdf,.png,.jpg,.jpeg" onChange={handlePurchaseOcrUpload} disabled={ocrUploading} />
                    <label htmlFor="purchase-ocr-file" className="ocr-label">
                      {ocrUploading ? '⏳ AI Analyzing...' : '📄 Scan Supplier Invoice'}
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Procurement Supplier *</label>
                    <select className="form-input" value={purchaseForm.supplierId} onChange={e => setPurchaseForm(p => ({ ...p, supplierId: e.target.value }))} required>
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName} ({s.gstin || 'URD'})</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Supplier Bill No *</label>
                      <input type="text" className="form-input" placeholder="INV-2026-001" value={purchaseForm.originalInvoiceNo} onChange={e => setPurchaseForm(p => ({ ...p, originalInvoiceNo: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Purchase Date *</label>
                      <input type="date" className="form-input" value={purchaseForm.purchaseDate} onChange={e => setPurchaseForm(p => ({ ...p, purchaseDate: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Due Date *</label>
                      <input type="date" className="form-input" value={purchaseForm.dueDate} onChange={e => setPurchaseForm(p => ({ ...p, dueDate: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount (₹)</label>
                      <input type="number" className="form-input" placeholder="0.00" value={purchaseForm.discountAmount} onChange={e => setPurchaseForm(p => ({ ...p, discountAmount: Number(e.target.value) }))} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-input" rows={2} placeholder="e.g. Quality inspection done. Stock received in Section A." value={purchaseForm.notes} onChange={e => setPurchaseForm(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>

                {/* Right: Line Items + Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '14px', margin: 0 }}>Material Receipt Items</h4>
                    <button className="action-btn" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setPurchaseItems(p => [...p, { productId: '', quantity: 1, unitPrice: 0, discountPercentage: 0 }])}>+ Add Item</button>
                  </div>

                  <div className="items-list">
                    {purchaseItems.map((item, index) => {
                      const prod = products.find(p => p.id === item.productId);
                      const taxRate = prod ? Number(prod.gstRate) : 0;
                      const lineTotal = (item.quantity * item.unitPrice) * (1 - item.discountPercentage / 100);
                      const taxAmt = lineTotal * (taxRate / 100);
                      return (
                        <div key={index} className="line-item-row">
                          <select className="form-input" value={item.productId} onChange={e => {
                            const updated = [...purchaseItems];
                            updated[index].productId = e.target.value;
                            const p = products.find(x => x.id === e.target.value);
                            if (p) updated[index].unitPrice = Number(p.purchasePrice);
                            setPurchaseItems(updated);
                          }}>
                            <option value="">-- Product --</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.sku} – {p.name}</option>)}
                          </select>
                          <input type="number" className="form-input" placeholder="Qty" value={item.quantity || ''} onChange={e => { const u = [...purchaseItems]; u[index].quantity = Number(e.target.value); setPurchaseItems(u); }} />
                          <input type="number" className="form-input" placeholder="Rate" value={item.unitPrice || ''} onChange={e => { const u = [...purchaseItems]; u[index].unitPrice = Number(e.target.value); setPurchaseItems(u); }} />
                          <button className="action-btn" style={{ color: '#ef4444', padding: '6px 8px' }} onClick={() => purchaseItems.length > 1 && setPurchaseItems(p => p.filter((_, i) => i !== index))}><Trash2 size={13} /></button>
                          <div className="line-item-meta">
                            <span>Disc: <input type="number" style={{ width: '36px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'inherit', fontSize: '11px', textAlign: 'center' }} value={item.discountPercentage} onChange={e => { const u = [...purchaseItems]; u[index].discountPercentage = Number(e.target.value); setPurchaseItems(u); }} />%</span>
                            {(item as any).description && !item.productId && (
                              <span style={{ color: '#f59e0b', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setPendingItemIndex(index); setProductSuggestionForm({ sku: ((item as any).description || '').replace(/\s+/g, '-').slice(0, 10).toUpperCase(), name: (item as any).description || '', description: 'Auto-suggested from OCR.', category: 'RAW_MATERIAL', hsnCode: '7403', gstRate: 18, unit: 'KG', purchasePrice: item.unitPrice, sellingPrice: item.unitPrice * 1.5, openingStock: 0, minimumStock: 100 }); setShowProductSuggestionModal(true); }}>💡 Suggest SKU</span>
                            )}
                            <span>Total: ₹{lineTotal.toFixed(2)} + GST ₹{taxAmt.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  {(() => { const sum = getPurchaseTotals(); return (
                    <div className="summary-panel">
                      <div className="summary-row sub"><span>Subtotal</span><span>₹{sum.subtotal.toFixed(2)}</span></div>
                      <div className="summary-row sub"><span>CGST</span><span>₹{sum.cgst.toFixed(2)}</span></div>
                      <div className="summary-row sub"><span>SGST</span><span>₹{sum.sgst.toFixed(2)}</span></div>
                      {sum.discount > 0 && <div className="summary-row sub" style={{ color: '#ef4444' }}><span>Discount</span><span>-₹{sum.discount.toFixed(2)}</span></div>}
                      <div className="summary-row total"><span>Grand Total</span><span>₹{sum.grandTotal.toFixed(2)}</span></div>
                    </div>
                  ); })()}

                  <button className="btn-primary" style={{ padding: '12px', fontWeight: '700' }} onClick={handlePurchaseSubmit} disabled={submitting}>
                    {submitting ? '⏳ Recording Transaction...' : '✓ Post Purchase to Ledger'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PURCHASES VIEW — table always visible, wizard opens as modal */}
        {activeTab === 'purchases' && (
          <div className="dashboard-content">
            <div className="glass-panel table-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>
                  <Truck size={20} style={{ marginRight: '8px', color: 'var(--primary)' }} />
                  Purchase Ledger (Materials Receipts)
                </h3>
                <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setIsCreatingPurchase(true)}>
                  <PlusCircle size={16} style={{ marginRight: '8px' }} />
                  Log Purchase Order
                </button>
              </div>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>PO ID / Invoice No</th><th>Supplier Name</th><th>Date</th>
                    <th>Subtotal</th><th>Tax (CGST+SGST)</th><th>Total Amt</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length > 0 ? purchases.map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 'bold' }}>{p.originalInvoiceNo || `PO-${p.id.slice(0, 8)}`}</td>
                      <td>{p.supplier?.companyName || '-'}</td>
                      <td>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</td>
                      <td>₹{Number(p.subTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>₹{(Number(p.cgst) + Number(p.sgst)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: '700' }}>₹{Number(p.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td><span className="status-badge success">Received</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No purchase transactions logged yet. Click Log Purchase Order to record raw material inventory.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'purchases' && (
          <div className="dashboard-content">
            <div className="glass-panel table-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>
                  <Truck size={20} style={{ marginRight: '8px', color: 'var(--primary)' }} />
                  Purchase Ledger (Materials Receipts)
                </h3>
                <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setIsCreatingPurchase(true)}>
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
                        <td style={{ fontWeight: '700' }}>₹{Number(p.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td><span className="status-badge success">Received</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No purchase transactions logged yet. Click Log Purchase Order to record raw material inventory.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}












                          <input
                            type="text"
                            className="form-input"
                            placeholder="INV-2026-001"
                            value={purchaseForm.originalInvoiceNo}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, originalInvoiceNo: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Purchase Date</label>
                          <input
                            type="date"
                            className="form-input"
                            value={purchaseForm.purchaseDate}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Payment Due Date</label>
                          <input
                            type="date"
                            className="form-input"
                            value={purchaseForm.dueDate}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, dueDate: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Additional Discount (₹)</label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="0.00"
                            value={purchaseForm.discountAmount}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Procurement & Receipt Notes</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          placeholder="e.g. Quality inspection completed. Stock received in Section A."
                          value={purchaseForm.notes}
                          onChange={(e) => setPurchaseForm(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Dynamic Line Items & Dynamic Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '16px' }}>
                      <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Material Receipt Items</span>
                        <button className="action-btn" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => setPurchaseItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, discountPercentage: 0 }])}>
                          + Add Item
                        </button>
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                        {purchaseItems.map((item, index) => {
                          const matchedProduct = products.find(p => p.id === item.productId);
                          const taxRate = matchedProduct ? Number(matchedProduct.gstRate) : 0;
                          const calculatedLineTotal = (item.quantity * item.unitPrice) * (1 - (item.discountPercentage / 100));
                          const calculatedTaxAmount = calculatedLineTotal * (taxRate / 100);

                          return (
                            <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', background: 'var(--bg-card)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                <select
                                  className="form-input"
                                  value={item.productId}
                                  onChange={(e) => {
                                    const updated = [...purchaseItems];
                                    updated[index].productId = e.target.value;
                                    const prod = products.find(p => p.id === e.target.value);
                                    if (prod) {
                                      updated[index].unitPrice = Number(prod.purchasePrice);
                                    }
                                    setPurchaseItems(updated);
                                  }}
                                >
                                  <option value="">-- Select Product --</option>
                                  {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                                  ))}
                                </select>

                                <input
                                  type="number"
                                  className="form-input"
                                  placeholder="Qty"
                                  value={item.quantity || ''}
                                  onChange={(e) => {
                                    const updated = [...purchaseItems];
                                    updated[index].quantity = Number(e.target.value);
                                    setPurchaseItems(updated);
                                  }}
                                />

                                <input
                                  type="number"
                                  className="form-input"
                                  placeholder="Price"
                                  value={item.unitPrice || ''}
                                  onChange={(e) => {
                                    const updated = [...purchaseItems];
                                    updated[index].unitPrice = Number(e.target.value);
                                    setPurchaseItems(updated);
                                  }}
                                />

                                <button 
                                  className="action-btn" 
                                  style={{ color: '#ef4444' }} 
                                  onClick={() => {
                                    if (purchaseItems.length > 1) {
                                      setPurchaseItems(prev => prev.filter((_, idx) => idx !== index));
                                    }
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <span>Discount %:</span>
                                  <input
                                    type="number"
                                    style={{ width: '40px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'inherit', fontSize: '11px', textAlign: 'center' }}
                                    value={item.discountPercentage}
                                    onChange={(e) => {
                                      const updated = [...purchaseItems];
                                      updated[index].discountPercentage = Number(e.target.value);
                                      setPurchaseItems(updated);
                                    }}
                                  />
                                </div>
                                {(item as any).description && !item.productId && (
                                  <span 
                                    style={{ color: '#f59e0b', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                                    onClick={() => {
                                      setPendingItemIndex(index);
                                      setProductSuggestionForm({
                                        sku: ((item as any).description || '').replace(/\s+/g, '-').slice(0, 10).toUpperCase(),
                                        name: (item as any).description || '',
                                        category: 'RAW_MATERIAL',
                                        description: 'Auto-suggested from OCR bill parsing.',
                                        hsnCode: '7403', // Default brass HSN
                                        unit: 'KG',
                                        purchasePrice: item.unitPrice,
                                        sellingPrice: item.unitPrice * 1.5,
                                        openingStock: 0,
                                        minimumStock: 100,
                                        gstRate: 18
                                      });
                                      setShowProductSuggestionModal(true);
                                    }}
                                  >
                                    💡 Suggest SKU: "{((item as any).description || '').slice(0,18)}..."
                                  </span>
                                )}
                                <span>Line Total: ₹{calculatedLineTotal.toFixed(2)} (+{taxRate}% GST: ₹{calculatedTaxAmount.toFixed(2)})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>GST & Valuation Breakdown</h4>
                      {(() => {
                        const sum = getPurchaseTotals();
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Subtotal Value:</span>
                              <span>₹{sum.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                              <span>CGST (Central):</span>
                              <span>₹{sum.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                              <span>SGST (State):</span>
                              <span>₹{sum.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {sum.discount > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                                <span>Additional Discount:</span>
                                <span>-₹{sum.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '15px', color: 'var(--primary)' }}>
                              <span>Total Ledger Valuation:</span>
                              <span>₹{sum.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '12px', fontWeight: 'bold' }} 
                      onClick={handlePurchaseSubmit}
                      disabled={submitting}
                    >
                      {submitting ? 'Recording Transaction & Adjusting Stock...' : 'Post Purchase to Ledger & Receipts'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVOICE WIZARD MODAL */}
        {isCreatingInvoice && (
          <div className="modal-overlay" onClick={() => setIsCreatingInvoice(false)}>
            <div className="glass-panel modal-card wizard-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2><FileSpreadsheet size={22} style={{ color: 'var(--primary)' }} /> New GST Tax Invoice</h2>
                  <p className="modal-subtitle">Create a GST-compliant invoice — PDF generated automatically on submission.</p>
                </div>
                <button className="modal-close-btn" onClick={() => setIsCreatingInvoice(false)}>✕ Close</button>
              </div>

              <form onSubmit={handleInvoiceSubmit}>
                {/* Top row: Customer + Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Customer *</label>
                    <select className="form-input" value={invoiceForm.customerId} onChange={e => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })} required>
                      <option value="">-- Choose Customer --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.companyName} ({c.billingState})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Invoice Date *</label>
                    <input type="date" className="form-input" value={invoiceForm.invoiceDate} onChange={e => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input type="date" className="form-input" value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
                  {/* Left: Line Items */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontWeight: '700', fontSize: '14px', margin: 0 }}>Invoice Line Items</h4>
                      <button type="button" className="action-btn" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => setInvoiceItems([...invoiceItems, { productId: '', quantity: 0, unitPrice: 0, discountPercentage: 0 }])}>
                        <PlusCircle size={13} /> Add Row
                      </button>
                    </div>

                    <div className="items-list">
                      {invoiceItems.map((item, index) => {
                        const selectedProd = products.find(p => p.id === item.productId);
                        const itemTotal = selectedProd ? (item.quantity * item.unitPrice * (1 - item.discountPercentage / 100)) * (1 + Number(selectedProd.gstRate) / 100) : 0;
                        return (
                          <div key={index} className="line-item-row">
                            <select className="form-input" value={item.productId} onChange={e => {
                              const prodId = e.target.value;
                              const prod = products.find(p => p.id === prodId);
                              const updated = [...invoiceItems];
                              updated[index].productId = prodId;
                              if (prod) updated[index].unitPrice = Number(prod.sellingPrice);
                              setInvoiceItems(updated);
                            }} required>
                              <option value="">-- Product --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.sku} – {p.name} (Stock: {Number(p.currentStock).toFixed(1)})</option>)}
                            </select>
                            <input type="number" step="any" className="form-input" placeholder="Qty" value={item.quantity || ''} onChange={e => { const u = [...invoiceItems]; u[index].quantity = Number(e.target.value); setInvoiceItems(u); }} required />
                            <input type="number" step="any" className="form-input" placeholder="Rate ₹" value={item.unitPrice || ''} onChange={e => { const u = [...invoiceItems]; u[index].unitPrice = Number(e.target.value); setInvoiceItems(u); }} required />
                            <button type="button" className="action-btn" style={{ color: '#ef4444', padding: '6px 8px' }} onClick={() => invoiceItems.length > 1 && setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}><Trash2 size={13} /></button>
                            <div className="line-item-meta">
                              <span>Disc: <input type="number" min="0" max="100" style={{ width: '36px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'inherit', fontSize: '11px', textAlign: 'center' }} value={item.discountPercentage || ''} onChange={e => { const u = [...invoiceItems]; u[index].discountPercentage = Number(e.target.value); setInvoiceItems(u); }} />%</span>
                              <span style={{ fontWeight: '600', color: 'var(--primary)' }}>GST Total: ₹{itemTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Payment Terms</label>
                        <input type="text" className="form-input" value={invoiceForm.paymentTerms} onChange={e => setInvoiceForm({ ...invoiceForm, paymentTerms: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Notes (PDF)</label>
                        <input type="text" className="form-input" value={invoiceForm.notes} onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} placeholder="Visible on invoice PDF" />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '12px' }}>
                      <label className="form-label">Terms &amp; Conditions</label>
                      <textarea className="form-input" rows={2} value={invoiceForm.termsAndConditions} onChange={e => setInvoiceForm({ ...invoiceForm, termsAndConditions: e.target.value })} />
                    </div>
                  </div>

                  {/* Right: Summary + Submit */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="summary-panel">
                      <h4 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '12px', margin: '0 0 12px 0' }}>Invoice Totals</h4>
                      <div className="summary-row sub"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                      <div className="summary-row sub"><span>CGST (Local)</span><span>₹{totals.cgst.toFixed(2)}</span></div>
                      <div className="summary-row sub"><span>SGST (Local)</span><span>₹{totals.sgst.toFixed(2)}</span></div>
                      <div className="summary-row sub"><span>IGST (Interstate)</span><span>₹{totals.igst.toFixed(2)}</span></div>
                      <div className="form-group" style={{ margin: '8px 0' }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Lump-sum Discount (₹)</label>
                        <input type="number" className="form-input" value={invoiceForm.discountAmount || ''} onChange={e => setInvoiceForm({ ...invoiceForm, discountAmount: Number(e.target.value) })} />
                      </div>
                      <div className="summary-row sub"><span>Round Off</span><span>₹{totals.roundOff.toFixed(2)}</span></div>
                      <div className="summary-row total"><span>Grand Total</span><span>₹{totals.grandTotal.toFixed(2)}</span></div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '14px', fontWeight: '700', fontSize: '15px' }} disabled={submitting}>
                      {submitting ? '⏳ Generating Invoice...' : '🖨️ Finalize & Generate PDF'}
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>PDF will be automatically downloaded after creation.</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* INVOICES VIEW */}
        {activeTab === 'invoices' && (
          <div className="dashboard-content">
            <>
              <div className="glass-panel table-container">
                <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
                  <span>Tax Invoice Ledger</span>
                  <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setIsCreatingInvoice(true)}>
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
                            ₹{(Number(inv.cgst) + Number(inv.sgst) + Number(inv.igst)).toLocaleString('en-IN')}
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
                                <button className="action-btn" style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', gap: '6px' }} onClick={() => triggerDownloadPDF(inv.pdfUrl)}>
                                  <FileDown size={14} /> PDF
                                </button>
                              )}
                              {inv.status === 'PENDING' && (
                                <button className="action-btn" style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', gap: '6px', color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => {
                                  setReminderForm({
                                    invoiceId: inv.id,
                                    reminderFrequency: 'WEEKLY',
                                    channel: 'WHATSAPP',
                                    nextReminderDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                  });
                                  setShowReminderModal(true);
                                }}>
                                  <BellRing size={14} /> Alert
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No GST invoices issued. Click New GST Invoice to create.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Scheduled Reminders & Dispatch Audit trail Sub-grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '24px' }}>
                <div className="glass-panel table-container">
                  <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
                    <span>Scheduled Payment Reminders (AI Agent Engine)</span>
                    <button className="btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowReminderModal(true)}>
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
                            <td><strong>{rem.invoice?.invoiceNumber}</strong></td>
                            <td>{rem.invoice?.customer?.companyName || '-'}</td>
                            <td>{rem.reminderFrequency}</td>
                            <td>
                              <span className="status-badge warning" style={{ background: 'rgba(255,255,255,0.05)', color: '#a78bfa', fontSize: '10px', padding: '2px 6px' }}>
                                {rem.channel}
                              </span>
                            </td>
                            <td>{new Date(rem.nextReminderDate).toLocaleDateString('en-IN')}</td>
                            <td style={{ fontWeight: 'bold' }}>{rem.reminderLogs?.length || 0}</td>
                            <td>
                              <span className={`status-badge ${rem.isActive ? 'success' : 'danger'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {rem.isActive ? 'Active' : 'Paused'}
                              </span>
                            </td>
                            <td>
                              <button className="action-btn" style={{ padding: '4px 8px', fontSize: '10px', display: 'inline-flex', gap: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }} onClick={() => triggerReminderNow(rem.id)}>
                                <Send size={10} /> Send
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No scheduled reminders.</td>
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
                            <td><strong>{log.reminder?.invoice?.invoiceNumber}</strong></td>
                            <td>{log.channel}</td>
                            <td style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.recipient}</td>
                            <td>
                              <span className={`status-badge ${log.status.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No notifications sent yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
            ) : (
              // CREATE INVOICE WIZARD SCREEN
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3>New GST Tax Invoice Creation</h3>
                  <button className="btn-primary" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }} onClick={() => setIsCreatingInvoice(false)}>
                    Cancel
                  </button>
                </div>
                
                <form onSubmit={handleInvoiceSubmit}>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Customer Accounts Entity *</label>
                      <select className="form-input" value={invoiceForm.customerId} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })} required>
                        <option value="">-- Choose Customer --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.companyName} ({c.billingState})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Billing Date *</label>
                      <input type="date" className="form-input" value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Due Date *</label>
                      <input type="date" className="form-input" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} required />
                    </div>
                  </div>

                  <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Invoice Line Items</h4>
                  {invoiceItems.map((item, index) => {
                    const selectedProd = products.find(p => p.id === item.productId);
                    const itemTotal = selectedProd ? (item.quantity * item.unitPrice * (1 - item.discountPercentage / 100)) * (1 + Number(selectedProd.gstRate)/100) : 0;
                    
                    return (
                      <div key={index} className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                        <div className="form-group">
                          <label className="form-label">{index === 0 && 'Product SKU / Item'}</label>
                          <select className="form-input" value={item.productId} onChange={(e) => {
                            const prodId = e.target.value;
                            const prod = products.find(p => p.id === prodId);
                            const updated = [...invoiceItems];
                            updated[index].productId = prodId;
                            if (prod) {
                              updated[index].unitPrice = Number(prod.sellingPrice);
                            }
                            setInvoiceItems(updated);
                          }} required>
                            <option value="">-- Select Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.sku} - {p.name} (Stock: {Number(p.currentStock).toFixed(2)})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">{index === 0 && 'Quantity'}</label>
                          <input type="number" step="any" placeholder="0.00" className="form-input" value={item.quantity || ''} onChange={(e) => {
                            const updated = [...invoiceItems];
                            updated[index].quantity = Number(e.target.value);
                            setInvoiceItems(updated);
                          }} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">{index === 0 && 'Unit Rate (₹)'}</label>
                          <input type="number" step="any" placeholder="0.00" className="form-input" value={item.unitPrice || ''} onChange={(e) => {
                            const updated = [...invoiceItems];
                            updated[index].unitPrice = Number(e.target.value);
                            setInvoiceItems(updated);
                          }} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">{index === 0 && 'Discount %'}</label>
                          <input type="number" min="0" max="100" placeholder="0" className="form-input" value={item.discountPercentage || ''} onChange={(e) => {
                            const updated = [...invoiceItems];
                            updated[index].discountPercentage = Number(e.target.value);
                            setInvoiceItems(updated);
                          }} />
                        </div>
                        <div className="form-group" style={{ paddingBottom: '10px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            GST Total: ₹{itemTotal.toFixed(2)}
                          </span>
                        </div>
                        <button type="button" className="btn-logout" style={{ marginBottom: '4px', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => {
                          if (invoiceItems.length > 1) {
                            setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
                          }
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}

                  <button type="button" className="action-btn" style={{ padding: '8px 16px', fontSize: '13px', marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => {
                    setInvoiceItems([...invoiceItems, { productId: '', quantity: 0, unitPrice: 0, discountPercentage: 0 }]);
                  }}>
                    <PlusCircle size={16} /> Add Item Row
                  </button>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label">Payment Terms Header</label>
                        <input type="text" className="form-input" value={invoiceForm.paymentTerms} onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentTerms: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label">Additional Billing Notes</label>
                        <textarea className="form-input" rows={2} value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} placeholder="Any notes visible on PDF..." />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Terms and Conditions</label>
                        <textarea className="form-input" rows={3} value={invoiceForm.termsAndConditions} onChange={(e) => setInvoiceForm({ ...invoiceForm, termsAndConditions: e.target.value })} />
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>Invoice Totals Summary</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0', color: 'var(--text-secondary)' }}>
                        <span>Subtotal:</span>
                        <span>₹{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0', color: 'var(--text-secondary)' }}>
                        <span>CGST (Local):</span>
                        <span>₹{totals.cgst.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0', color: 'var(--text-secondary)' }}>
                        <span>SGST (Local):</span>
                        <span>₹{totals.sgst.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0', color: 'var(--text-secondary)' }}>
                        <span>IGST (Out of state):</span>
                        <span>₹{totals.igst.toFixed(2)}</span>
                      </div>
                      
                      <div className="form-group" style={{ margin: '12px 0' }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Lump-sum Discount (₹)</label>
                        <input type="number" className="form-input" value={invoiceForm.discountAmount || ''} onChange={(e) => setInvoiceForm({ ...invoiceForm, discountAmount: Number(e.target.value) })} />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0', color: 'var(--text-secondary)' }}>
                        <span>Round Off:</span>
                        <span>₹{totals.roundOff.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', margin: '12px 0 0 0', fontWeight: 'bold', color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                        <span>Grand Total:</span>
                        <span>₹{totals.grandTotal.toFixed(2)}</span>
                      </div>
                      
                      <button type="submit" className="btn-primary" style={{ marginTop: '20px' }} disabled={submitting}>
                        {submitting ? 'Generating Invoice...' : 'Finalize & Print PDF'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Inspect Extracted OCR Data Modal Drawer (Rendered Globally) */}
        {ocrDetailDoc && (
          <div className="modal-overlay" onClick={() => setOcrDetailDoc(null)}>
            <div className="glass-panel modal-card" style={{ maxWidth: '650px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h4>Extracted AI OCR Metadata</h4>
                <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setOcrDetailDoc(null)}>X</button>
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

        {/* REPORTS & CHARTS VIEW */}
        {activeTab === 'reports' && (
          <div className="dashboard-content">
            <div className="split-grid" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
              {/* Left Panel: Accounts Receivables Breakdown */}
              <div className="glass-panel table-container">
                <h3 className="section-title"><BarChart3 size={18} className="action-icon" /> Outstanding Payables By Accounts</h3>
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
                    {analytics.topCustomers.length > 0 ? (
                      analytics.topCustomers.map((cust: any) => (
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
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No accounts data.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Right Panel: Inventory Distribution */}
              <div className="glass-panel table-container">
                <h3 className="section-title"><Layers size={18} className="action-icon" /> Stock Category Weights</h3>
                <div style={{ marginTop: '16px' }}>
                  {analytics.categoryStocks.length > 0 ? (
                    analytics.categoryStocks.map((cat: any, idx: number) => {
                      const maxVal = Math.max(...analytics.categoryStocks.map((c: any) => c.totalStock), 100);
                      const percentage = (cat.totalStock / maxVal) * 100;
                      return (
                        <div key={idx} style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>{cat.category}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{cat.totalStock.toFixed(2)} KG</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #b8860b, #fbbf24)', borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No stock categories configured.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD CUSTOMER */}
      {showCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="glass-panel modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4>Register New Customer</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowCustomerModal(false)}>X</button>
            </div>
            
            <form onSubmit={handleCustomerSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Company Name *</label>
                <input type="text" className="form-input" value={customerForm.companyName} onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })} required />
              </div>
              
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input type="text" className="form-input" value={customerForm.contactName} onChange={(e) => setCustomerForm({ ...customerForm, contactName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="text" className="form-input" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN (15-digit) *</label>
                  <input type="text" className="form-input" value={customerForm.gstin} onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value.toUpperCase() })} required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input type="text" className="form-input" value={customerForm.pan} onChange={(e) => setCustomerForm({ ...customerForm, pan: e.target.value.toUpperCase() })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Credit Terms (Days)</label>
                  <input type="number" className="form-input" value={customerForm.paymentTermsDays} onChange={(e) => setCustomerForm({ ...customerForm, paymentTermsDays: Number(e.target.value) })} />
                </div>
              </div>

              <h5 style={{ margin: '12px 0 6px 0', color: 'var(--primary)' }}>Billing Address</h5>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Street Address *</label>
                <input type="text" className="form-input" value={customerForm.billingStreet} onChange={(e) => setCustomerForm({ ...customerForm, billingStreet: e.target.value })} required />
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-input" value={customerForm.billingCity} onChange={(e) => setCustomerForm({ ...customerForm, billingCity: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input type="text" className="form-input" value={customerForm.billingState} onChange={(e) => setCustomerForm({ ...customerForm, billingState: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input type="text" className="form-input" value={customerForm.billingZip} onChange={(e) => setCustomerForm({ ...customerForm, billingZip: e.target.value })} required />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Registering...' : 'Save Customer Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {showSupplierModal && (
        <div className="modal-overlay" onClick={() => setShowSupplierModal(false)}>
          <div className="glass-panel modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4>Register Procurement Supplier</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowSupplierModal(false)}>X</button>
            </div>
            
            <form onSubmit={handleSupplierSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Company Name *</label>
                <input type="text" className="form-input" value={supplierForm.companyName} onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })} required />
              </div>
              
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input type="text" className="form-input" value={supplierForm.contactName} onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="text" className="form-input" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN (15-digit)</label>
                  <input type="text" className="form-input" value={supplierForm.gstin} onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value.toUpperCase() })} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input type="text" className="form-input" value={supplierForm.pan} onChange={(e) => setSupplierForm({ ...supplierForm, pan: e.target.value.toUpperCase() })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment terms (Days)</label>
                  <input type="number" className="form-input" value={supplierForm.paymentTermsDays} onChange={(e) => setSupplierForm({ ...supplierForm, paymentTermsDays: Number(e.target.value) })} />
                </div>
              </div>

              <h5 style={{ margin: '12px 0 6px 0', color: 'var(--primary)' }}>Billing / Company Address</h5>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Street Address *</label>
                <input type="text" className="form-input" value={supplierForm.billingStreet} onChange={(e) => setSupplierForm({ ...supplierForm, billingStreet: e.target.value })} required />
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-input" value={supplierForm.billingCity} onChange={(e) => setSupplierForm({ ...supplierForm, billingCity: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input type="text" className="form-input" value={supplierForm.billingState} onChange={(e) => setSupplierForm({ ...supplierForm, billingState: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input type="text" className="form-input" value={supplierForm.billingZip} onChange={(e) => setSupplierForm({ ...supplierForm, billingZip: e.target.value })} required />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Registering...' : 'Save Supplier Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="glass-panel modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4>Add New Product in Master Catalog</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowProductModal(false)}>X</button>
            </div>
            
            <form onSubmit={handleProductSubmit}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">SKU Code *</label>
                  <input type="text" placeholder="e.g. BR-ROD-10" className="form-input" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input type="text" placeholder="e.g. 10mm Brass Extrusion Rod" className="form-input" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required>
                    <option value="Brass Rods">Brass Rods</option>
                    <option value="Brass Billets">Brass Billets</option>
                    <option value="Brass Scrap">Brass Scrap / Swarf</option>
                    <option value="Valves & Fittings">Valves & Fittings</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">HSN Code *</label>
                  <input type="text" placeholder="8-digit HSN" className="form-input" value={productForm.hsnCode} onChange={(e) => setProductForm({ ...productForm, hsnCode: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Rate (%)</label>
                  <input type="number" className="form-input" value={productForm.gstRate} onChange={(e) => setProductForm({ ...productForm, gstRate: Number(e.target.value) })} required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Purchase Price (₹) *</label>
                  <input type="number" step="any" className="form-input" value={productForm.purchasePrice || ''} onChange={(e) => setProductForm({ ...productForm, purchasePrice: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹) *</label>
                  <input type="number" step="any" className="form-input" value={productForm.sellingPrice || ''} onChange={(e) => setProductForm({ ...productForm, sellingPrice: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Measurement Unit</label>
                  <select className="form-input" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}>
                    <option value="KG">Kilogram (KG)</option>
                    <option value="PCS">Pieces (PCS)</option>
                    <option value="METERS">Meters (M)</option>
                    <option value="TONS">Metric Tons (TONS)</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Opening Stock Quantity</label>
                  <input type="number" step="any" className="form-input" value={productForm.openingStock || ''} onChange={(e) => setProductForm({ ...productForm, openingStock: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Safety stock</label>
                  <input type="number" step="any" className="form-input" value={productForm.minimumStock || ''} onChange={(e) => setProductForm({ ...productForm, minimumStock: Number(e.target.value) })} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4>Log Physical Inventory Stock Level</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowStockModal(false)}>X</button>
            </div>
            
            <form onSubmit={handleStockSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Target Product SKU *</label>
                <select className="form-input" value={stockForm.productId} onChange={(e) => setStockForm({ ...stockForm, productId: e.target.value })} required>
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name} (Stock: {Number(p.currentStock).toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Adjustment Type *</label>
                  <select className="form-input" value={stockForm.type} onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })} required>
                    <option value="ADD">IN (Receive Purchase/Production Output)</option>
                    <option value="SUBTRACT">OUT (Manual Stock Reduction / Dispatch)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Adjustment Weight/Qty *</label>
                  <input type="number" step="any" className="form-input" value={stockForm.quantity || ''} onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Reference (P.O. No, Challan No, or Audit Reason) *</label>
                <input type="text" className="form-input" value={stockForm.reference} onChange={(e) => setStockForm({ ...stockForm, reference: e.target.value })} required />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Applying Adjustment...' : 'Commit Transaction Log'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SETUP PAYMENT REMINDER */}
      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="glass-panel modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4>Setup Automated Payment Reminder</h4>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowReminderModal(false)}>X</button>
            </div>
            
            <form onSubmit={handleReminderSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Select Invoice *</label>
                <select className="form-input" value={reminderForm.invoiceId} onChange={(e) => setReminderForm({ ...reminderForm, invoiceId: e.target.value })} required>
                  <option value="">-- Choose Invoice --</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customer?.companyName} (Amount: ₹{Number(inv.grandTotal).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Follow-up Frequency *</label>
                  <select className="form-input" value={reminderForm.reminderFrequency} onChange={(e) => setReminderForm({ ...reminderForm, reminderFrequency: e.target.value })} required>
                    <option value="DAILY">DAILY</option>
                    <option value="WEEKLY">WEEKLY</option>
                    <option value="BI_WEEKLY">BI_WEEKLY</option>
                    <option value="MONTHLY">MONTHLY</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Notification Channel *</label>
                  <select className="form-input" value={reminderForm.channel} onChange={(e) => setReminderForm({ ...reminderForm, channel: e.target.value })} required>
                    <option value="WHATSAPP">WHATSAPP (Automated Template)</option>
                    <option value="EMAIL">EMAIL (Detailed PDF Link)</option>
                    <option value="SMS">SMS (Simple Alert Text)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">First Notification Dispatch Date *</label>
                <input type="date" className="form-input" value={reminderForm.nextReminderDate} onChange={(e) => setReminderForm({ ...reminderForm, nextReminderDate: e.target.value })} required />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Configure Automated Reminder'}
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
              <button className="drawer-close-btn" onClick={() => setActiveProductDetail(null)}>X</button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span className="status-badge info" style={{ fontSize: '12px' }}>{activeProductDetail.sku}</span>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '8px' }}>{activeProductDetail.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{activeProductDetail.category}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
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
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>₹{Number(activeProductDetail.purchasePrice).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SELLING PRICE</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>₹{Number(activeProductDetail.sellingPrice).toFixed(2)}</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Physical Inventory Stock Status</h4>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CURRENT STOCK</div>
                    <div style={{ fontWeight: 'bold', fontSize: '24px', color: Number(activeProductDetail.currentStock) < Number(activeProductDetail.minimumStock) ? '#ef4444' : '#10b981' }}>
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
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Product Ledger Description</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {activeProductDetail.description || 'No description available for this catalog item.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: SUPPLIER PROFILE */}
      {activeSupplierDetail && (
        <div className="drawer-overlay active" onClick={() => setActiveSupplierDetail(null)}>
          <div className="drawer-panel active" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">Supplier Corporate Profile</h3>
              <button className="drawer-close-btn" onClick={() => setActiveSupplierDetail(null)}>X</button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{activeSupplierDetail.companyName}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>GSTIN: {activeSupplierDetail.gstin || 'URD'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
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
                  <div style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>{activeSupplierDetail.email || '-'}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>OUTSTANDING ACCOUNTS PAYABLE</div>
                <div style={{ fontWeight: 'bold', fontSize: '26px', color: Number(activeSupplierDetail.outstandingBalance) > 0 ? '#ef4444' : 'var(--text-primary)', marginTop: '4px' }}>
                  ₹{Number(activeSupplierDetail.outstandingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Registered Billing Address</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {activeSupplierDetail.billingStreet || '-'}<br />
                  {activeSupplierDetail.billingCity || '-'}, {activeSupplierDetail.billingState || '-'} - {activeSupplierDetail.billingZip || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: CUSTOMER PROFILE & INVOICES */}
      {activeCustomerDetail && (
        <div className="drawer-overlay active" onClick={() => setActiveCustomerDetail(null)}>
          <div className="drawer-panel active" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">Customer Profile & Invoices</h3>
              <button className="drawer-close-btn" onClick={() => setActiveCustomerDetail(null)}>X</button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{activeCustomerDetail.companyName}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>GSTIN: {activeCustomerDetail.gstin || 'URD'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
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
                  <div style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>{activeCustomerDetail.email || '-'}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>OUTSTANDING ACCOUNTS RECEIVABLE</div>
                <div style={{ fontWeight: 'bold', fontSize: '26px', color: Number(activeCustomerDetail.outstandingBalance) > 0 ? '#f59e0b' : 'var(--text-primary)', marginTop: '4px' }}>
                  ₹{Number(activeCustomerDetail.outstandingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Registered Billing Address</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {activeCustomerDetail.billingStreet || '-'}<br />
                  {activeCustomerDetail.billingCity || '-'}, {activeCustomerDetail.billingState || '-'} - {activeCustomerDetail.billingZip || '-'}
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Customer Sales History</h4>
                {activeCustomerDetail.invoices && activeCustomerDetail.invoices.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeCustomerDetail.invoices.map((inv: any) => (
                      <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px' }}>
                        <div>
                          <strong>{inv.invoiceNumber}</strong> ({new Date(inv.invoiceDate).toLocaleDateString('en-IN')})
                        </div>
                        <div>
                          <span>₹{Number(inv.grandTotal).toLocaleString('en-IN')}</span>
                          <span className={`status-badge ${inv.status.toLowerCase()}`} style={{ marginLeft: '8px', fontSize: '9px', padding: '2px 4px' }}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No sales transactions recorded for this customer.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRODUCT SUGGESTION CREATION */}
      {showProductSuggestionModal && (
        <div className="modal-overlay" onClick={() => setShowProductSuggestionModal(false)}>
          <div className="glass-panel modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontWeight: 'bold' }}>Register Raw Material SKU</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Bind AI OCR descriptive field into permanent master inventory.</p>
              </div>
              <button className="btn-logout" style={{ padding: '4px 8px' }} onClick={() => setShowProductSuggestionModal(false)}>X</button>
            </div>
            
            <form onSubmit={handleProductSuggestionSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Auto-Generated SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productSuggestionForm.sku}
                    onChange={(e) => setProductSuggestionForm(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name / Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productSuggestionForm.name}
                    onChange={(e) => setProductSuggestionForm(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setProductSuggestionForm(prev => ({ ...prev, unit: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">HSN Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productSuggestionForm.hsnCode}
                    onChange={(e) => setProductSuggestionForm(prev => ({ ...prev, hsnCode: e.target.value }))}
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
                    onChange={(e) => setProductSuggestionForm(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Tax Bracket (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productSuggestionForm.gstRate}
                    onChange={(e) => setProductSuggestionForm(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
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
}

export default App;
