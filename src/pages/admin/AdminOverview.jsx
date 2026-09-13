import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWebinarBySlug } from '../../services/webinarService';
import { getRegistrationCount, getRecentRegistrations } from '../../services/registrationService';
import RegistrationModal from '../../components/admin/RegistrationModal';
import { IconUsers, IconEdit, IconEmpty } from '../../components/admin/AdminIcons';
import { calculateDaysRemaining } from '../../utils/dateUtils';

export default function AdminOverview() {
  const [webinar, setWebinar] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [recentRegs, setRecentRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [webinarRes, countRes, recentRes] = await Promise.all([
        getWebinarBySlug('grow-through-industry-2026'),
        getRegistrationCount(),
        getRecentRegistrations(null, 5)
      ]);

      if (webinarRes.data) setWebinar(webinarRes.data);
      if (countRes.success) setTotalCount(countRes.count);
      if (recentRes.success) setRecentRegs(recentRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Overview</h1>
        </div>
        <Link to="/admin/registrations" className="admin-btn admin-btn-primary">
          <IconUsers size={16} />
          <span>Manage Registrations</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-label">Total Registrations</div>
          <div className="admin-metric-value">{loading ? '...' : totalCount}</div>
          <div className="admin-metric-sub">Confirmed live attendees</div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-label">Webinar Date</div>
          <div className="admin-metric-value" style={{ fontSize: '1.5rem' }}>
            {webinar?.date || 'September 23, 2026'}
          </div>
          <div className="admin-metric-sub">Time: {webinar?.time || '7:30 PM IST'}</div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-label">Days Remaining</div>
          <div className="admin-metric-value">
            {loading ? '...' : calculateDaysRemaining(webinar?.date)}
          </div>
          <div className="admin-metric-sub">Countdown active on live page</div>
        </div>
      </div>

      {/* Webinar Information Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">Active Webinar Information</div>
          <Link to="/admin/settings" className="admin-btn admin-btn-secondary" style={{ height: 32, fontSize: '0.8rem' }}>
            <IconEdit size={14} />
            <span>Edit Date</span>
          </Link>
        </div>
        <div className="admin-card-body">
          <div className="admin-info-grid">
            <div className="admin-info-item">
              <label>Event Title</label>
              <span>{webinar?.title || 'GROW THROUGH INDUSTRY'}</span>
            </div>
            <div className="admin-info-item">
              <label>Date & Time</label>
              <span>
                {webinar?.date} • {webinar?.time}
              </span>
            </div>
            <div className="admin-info-item">
              <label>Speaker / Partners</label>
              <span>{webinar?.speaker_name || 'Skill Arcadia × Grant Thornton'}</span>
            </div>
            <div className="admin-info-item">
              <label>Status</label>
              <span style={{ color: 'var(--admin-success)', fontWeight: 600 }}>
                ● Registration Open
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">Recent Registrations</div>
          <Link
            to="/admin/registrations"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--admin-accent-blue)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            View all registrations →
          </Link>
        </div>

        <div className="admin-table-container">
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
              Loading recent registrations...
            </div>
          ) : recentRegs.length === 0 ? (
            <div className="admin-empty-state">
              <IconEmpty size={36} />
              <p>No registrations received yet.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {recentRegs.map((reg) => (
                  <tr key={reg.id} onClick={() => setSelectedReg(reg)}>
                    <td style={{ fontWeight: 600 }}>{reg.name}</td>
                    <td>{reg.email}</td>
                    <td>{reg.whatsapp}</td>
                    <td style={{ textTransform: 'uppercase' }}>{reg.course}</td>
                    <td>
                      <span className={`admin-badge ${reg.status}`}>
                        {reg.status === 'professional' ? 'Professional' : 'Student'}
                      </span>
                    </td>
                    <td>{new Date(reg.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Registration Details Modal */}
      {selectedReg && (
        <RegistrationModal registration={selectedReg} onClose={() => setSelectedReg(null)} />
      )}
    </div>
  );
}
