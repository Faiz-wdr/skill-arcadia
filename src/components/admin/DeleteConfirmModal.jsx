import React, { useEffect } from 'react';
import { IconTrash, IconClose } from './AdminIcons';

export default function DeleteConfirmModal({
  isOpen,
  count = 1,
  targetName = '',
  targetEmail = '',
  loading = false,
  onConfirm,
  onClose
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const isMultiple = count > 1;

  return (
    <div
      className="admin-modal-backdrop"
      onClick={() => {
        if (!loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
    >
      <div
        className="admin-modal-card admin-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="admin-modal-close admin-confirm-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <IconClose size={18} />
        </button>

        <div className="admin-confirm-body">
          <div className="admin-confirm-icon-wrap">
            <IconTrash size={24} />
          </div>

          <h3 id="admin-confirm-title" className="admin-confirm-title">
            {isMultiple ? `Delete ${count} Registrations?` : 'Delete Registration?'}
          </h3>

          <p className="admin-confirm-desc">
            {isMultiple ? (
              <>
                Are you sure you want to permanently delete these{' '}
                <strong>{count} selected registrations</strong>? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to permanently delete the registration for{' '}
                <strong>{targetName || 'this attendee'}</strong>
                {targetEmail ? ` (${targetEmail})` : ''}? This action cannot be undone.
              </>
            )}
          </p>

          <div className="admin-confirm-actions">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-btn-spinner" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <IconTrash size={16} />
                  <span>{isMultiple ? `Delete (${count})` : 'Delete'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
