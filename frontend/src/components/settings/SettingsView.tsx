import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck } from 'lucide-react';
import axios from 'axios';

interface SettingsViewProps {
  API_BASE_URL: string;
  getHeaders: () => { headers: { Authorization: string } };
  actionError: string;
  setActionError: (msg: string) => void;
  actionSuccess: string;
  setActionSuccess: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  API_BASE_URL,
  getHeaders,
  actionError,
  setActionError,
  actionSuccess,
  setActionSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    companyName: '',
    address: '',
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    logoUrl: '',
    smtpEmail: '',
    smtpPassword: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/business-profile`, getHeaders());
      if (res.data.success && res.data.data) {
        setProfile({
          companyName: res.data.data.companyName || '',
          address: res.data.data.address || '',
          gstin: res.data.data.gstin || '',
          pan: res.data.data.pan || '',
          email: res.data.data.email || '',
          phone: res.data.data.phone || '',
          logoUrl: res.data.data.logoUrl || '',
          smtpEmail: res.data.data.smtpEmail || '',
          smtpPassword: res.data.data.smtpPassword || '',
          smtpHost: res.data.data.smtpHost || 'smtp.gmail.com',
          smtpPort: res.data.data.smtpPort || 587,
        });
      }
    } catch (err) {
      setActionError('Failed to load business settings profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await axios.post(`${API_BASE_URL}/business-profile`, profile, getHeaders());
      if (res.data.success) {
        setActionSuccess('🎉 Business settings profile saved successfully! Invoices will now generate using these details.');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Error occurred while saving profile settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>⏳ Loading settings configuration...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'left' }}>
          <h3 className="section-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px', margin: 0 }}>
            <Settings size={20} style={{ marginRight: '8px', color: 'var(--primary)' }} />
            <span>Organization Profile & Settings</span>
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Factory / Company Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={profile.companyName}
                onChange={(e) => setProfile(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="e.g. Jamnagar Brass Castings Ltd"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registered Office Address *</label>
              <textarea
                className="form-input"
                rows={3}
                required
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Plot 42, GIDC Industrial Estate Phase II, Jamnagar, Gujarat, 361004"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">GSTIN Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.gstin}
                  onChange={(e) => setProfile(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  placeholder="24AAACB1234A1Z0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.pan}
                  onChange={(e) => setProfile(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  placeholder="AAACB1234A"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Billing Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="accounts@factory.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone / Mobile</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Static Local Logo Path / Image URL</label>
              <input
                type="text"
                className="form-input"
                value={profile.logoUrl}
                onChange={(e) => setProfile(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="/uploads/logo.png"
              />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Leave blank to render company name text instead of a logo picture at the top of PDFs.
              </p>
            </div>

            <div style={{ background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.1)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                <strong>Single System Environment</strong>: Since this application operates from a single central computer in the office, these details serve as the master parameters for the invoice header.
              </p>
            </div>

            {/* SMTP Email Configuration Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '4px' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                📧 Email Reminder Configuration (SMTP)
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                Enter your Gmail address and <strong>App Password</strong> here. Automatic payment reminder emails will be sent from this address.
                To generate a Gmail App Password: <strong>Google Account → Security → 2-Step Verification → App passwords</strong>.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Gmail / SMTP Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profile.smtpEmail}
                    onChange={(e) => setProfile(prev => ({ ...prev, smtpEmail: e.target.value }))}
                    placeholder="yourfactory@gmail.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gmail App Password (16-digit)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={profile.smtpPassword}
                    onChange={(e) => setProfile(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    placeholder="xxxx xxxx xxxx xxxx"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginTop: '4px' }}>
                <div className="form-group">
                  <label className="form-label">SMTP Host</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.smtpHost}
                    onChange={(e) => setProfile(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SMTP Port</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profile.smtpPort}
                    onChange={(e) => setProfile(prev => ({ ...prev, smtpPort: Number(e.target.value) }))}
                    placeholder="587"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', fontWeight: '700', fontSize: '14px', width: 'auto', alignSelf: 'flex-end', minWidth: '150px' }} disabled={saving}>
              <Save size={16} style={{ marginRight: '8px' }} />
              {saving ? 'Saving Config...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
