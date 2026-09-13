import React, { useEffect } from 'react';
import { IconClose } from './AdminIcons';

export default function RegistrationModal({ registration, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!registration) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">Attendee Details</div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-detail-row">
            <span className="admin-detail-label">Full Name</span>
            <span className="admin-detail-val">{registration.name}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Email Address</span>
            <span className="admin-detail-val">{registration.email}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">WhatsApp Number</span>
            <span className="admin-detail-val">{registration.whatsapp}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Course</span>
            <span className="admin-detail-val" style={{ textTransform: 'uppercase' }}>
              {registration.course}
            </span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Current Status</span>
            <span className="admin-detail-val">
              <span className={`admin-badge ${registration.status}`}>
                {registration.status === 'professional' ? 'Working Professional' : 'Student'}
              </span>
            </span>
          </div>

          <div className="admin-detail-row" style={{ borderBottom: 'none' }}>
            <span className="admin-detail-label">Registered At</span>
            <span className="admin-detail-val">{formatDate(registration.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
