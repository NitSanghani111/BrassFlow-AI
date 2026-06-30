import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface NotificationBannerProps {
  actionError: string;
  actionSuccess: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  actionError,
  actionSuccess
}) => {
  return (
    <>
      {actionError && (
        <div className="auth-error" style={{ margin: '16px 24px 0 24px', borderRadius: '8px' }}>
          <AlertTriangle size={18} />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div
          className="auth-error"
          style={{
            margin: '16px 24px 0 24px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399'
          }}
        >
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}
    </>
  );
};
