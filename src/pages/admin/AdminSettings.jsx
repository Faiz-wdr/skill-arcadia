import React, { useState, useEffect, useMemo } from 'react';
import { getWebinarBySlug, updateWebinarSchedule } from '../../services/webinarService';
import {
  IconCheck,
  IconCheckCircle,
  IconAlertCircle,
  IconCalendar,
  IconClock
} from '../../components/admin/AdminIcons';
import {
  dateStringToYMD,
  ymdToFriendlyDate,
  timeStringToHHMM,
  hhmmToFriendlyTime,
  calculateDaysRemaining
} from '../../utils/dateUtils';


export default function AdminSettings() {
  const [webinar, setWebinar] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('19:30');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Initial load
  useEffect(() => {
    async function loadWebinar() {
      setLoading(true);
      const res = await getWebinarBySlug('grow-through-industry-2026');
      if (res.data) {
        setWebinar(res.data);
        const ymd = dateStringToYMD(res.data.date || 'September 23, 2026');
        const hhmm = timeStringToHHMM(res.data.time || '7:30 PM IST');
        setSelectedDate(ymd);
        setSelectedTime(hhmm);
      }
      setLoading(false);
    }
    loadWebinar();
  }, []);

  // Compute presentation formats
  const friendlyDate = useMemo(() => ymdToFriendlyDate(selectedDate), [selectedDate]);
  const friendlyTime = useMemo(() => hhmmToFriendlyTime(selectedTime), [selectedTime]);
  const daysRemaining = useMemo(() => {
    if (!friendlyDate) return 0;
    return calculateDaysRemaining(friendlyDate, friendlyTime);
  }, [friendlyDate, friendlyTime]);

  const hasChanges = useMemo(() => {
    if (!webinar) return false;
    const currentYMD = dateStringToYMD(webinar.date);
    const currentHHMM = timeStringToHHMM(webinar.time);
    return selectedDate !== currentYMD || selectedTime !== currentHHMM;
  }, [webinar, selectedDate, selectedTime]);

  const handleReset = () => {
    if (!webinar) return;
    setSelectedDate(dateStringToYMD(webinar.date));
    setSelectedTime(timeStringToHHMM(webinar.time));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedDate) {
      setErrorMsg('Please choose a valid date.');
      return;
    }

    if (!selectedTime) {
      setErrorMsg('Please choose a valid time.');
      return;
    }

    if (!webinar?.id) {
      setErrorMsg('No active webinar record found to update.');
      return;
    }

    setSaving(true);
    const res = await updateWebinarSchedule(webinar.id, friendlyDate, friendlyTime);
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update webinar schedule.');
      return;
    }

    setWebinar((prev) => ({
      ...prev,
      date: friendlyDate,
      time: friendlyTime
    }));
    setSuccessMsg('Webinar date & time updated successfully! Changes are now live on the public landing page.');
  };


  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Schedule Settings</h1>
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

      <div className="admin-card" style={{ maxWidth: 680 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">Choose Webinar Date & Time</div>
        </div>

        <div className="admin-card-body">

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="admin-schedule-grid">
              {/* Date Choosing */}
              <div>
                <label
                  htmlFor="webinarDatePicker"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--admin-text-secondary)',
                    marginBottom: 6
                  }}
                >
                  <IconCalendar size={15} />
                  <span>Choose Date</span>
                </label>
                <input
                  type="date"
                  id="webinarDatePicker"
                  className="admin-input"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSuccessMsg('');
                    setErrorMsg('');
                  }}
                  disabled={loading || saving}
                  required
                />

              </div>

              {/* Time Choosing */}
              <div>
                <label
                  htmlFor="webinarTimePicker"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--admin-text-secondary)',
                    marginBottom: 6
                  }}
                >
                  <IconClock size={15} />
                  <span>Choose Time (IST)</span>
                </label>
                <input
                  type="time"
                  id="webinarTimePicker"
                  className="admin-input"
                  value={selectedTime}
                  onChange={(e) => {
                    setSelectedTime(e.target.value);
                    setSuccessMsg('');
                    setErrorMsg('');
                  }}
                  disabled={loading || saving}
                  required
                />

              </div>
            </div>

            {/* Live Website Preview Card */}
            <div className="admin-schedule-preview">
              <div className="admin-preview-header">
                <div className="admin-preview-badge">
                  <span className="admin-preview-dot"></span>
                  <span>Public Website Live Preview</span>
                </div>
              </div>
              <div className="admin-preview-details">
                <div className="admin-preview-item">
                  <label>Scheduled Date</label>
                  <span>{friendlyDate || '—'}</span>
                </div>
                <div className="admin-preview-item">
                  <label>Scheduled Time</label>
                  <span>{friendlyTime || '—'}</span>
                </div>
                <div className="admin-preview-item">
                  <label>Countdown Timer</label>
                  <span style={{ color: daysRemaining > 0 ? 'var(--admin-accent-blue)' : 'var(--admin-text-secondary)' }}>
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Webinar Live / Today'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={loading || saving || !hasChanges}
              >
                {saving ? (
                  <span>Saving Schedule...</span>
                ) : (
                  <>
                    <IconCheck size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              {hasChanges && (
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleReset}
                  disabled={loading || saving}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
