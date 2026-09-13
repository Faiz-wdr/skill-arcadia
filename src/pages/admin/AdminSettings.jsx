import React, { useState, useEffect } from 'react';
import { getWebinarBySlug, updateWebinarDate } from '../../services/webinarService';
import { IconCheck, IconCheckCircle, IconAlertCircle } from '../../components/admin/AdminIcons';

export default function AdminSettings() {
  const [webinar, setWebinar] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadWebinar() {
      setLoading(true);
      const res = await getWebinarBySlug('grow-through-industry-2026');
      if (res.data) {
        setWebinar(res.data);
        setNewDate(res.data.date || 'September 23, 2026');
      }
      setLoading(false);
    }
    loadWebinar();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!newDate.trim()) {
      setErrorMsg('Please specify a valid webinar date.');
      return;
    }

    if (!webinar?.id) {
      setErrorMsg('No active webinar found to update.');
      return;
    }

    setSaving(true);
    const res = await updateWebinarDate(webinar.id, newDate.trim());
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update webinar date.');
      return;
    }

    setWebinar((prev) => ({ ...prev, date: newDate.trim() }));
    setSuccessMsg('Webinar date updated successfully. Changes are now live on the public landing page.');
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
        </div>
      </div>

      {successMsg && (
        <div className="admin-alert admin-alert-success">
          <IconCheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="admin-alert admin-alert-error">
          <IconAlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="admin-card" style={{ maxWidth: 640 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">Webinar Date</div>
        </div>

        <div className="admin-card-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: 20 }}>
            Updating this date immediately updates the public webinar landing page, schedule badge, and live countdown timer.
          </p>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label
                htmlFor="webinarDateInput"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--admin-text-secondary)',
                  marginBottom: 6
                }}
              >
                Event Date
              </label>
              <input
                type="text"
                id="webinarDateInput"
                className="admin-input"
                placeholder="e.g. September 30, 2026 or 2026-09-30"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  if (successMsg) setSuccessMsg('');
                  if (errorMsg) setErrorMsg('');
                }}
                disabled={loading || saving}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={loading || saving || newDate === webinar?.date}
              >
                {saving ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <IconCheck size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
