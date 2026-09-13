import React, { useState, useEffect, useMemo } from 'react';
import { getRegistrations } from '../../services/registrationService';
import RegistrationModal from '../../components/admin/RegistrationModal';
import { IconDownload, IconSearch, IconSort, IconEmpty } from '../../components/admin/AdminIcons';

const ITEMS_PER_PAGE = 10;

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReg, setSelectedReg] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getRegistrations();
      if (res.success) {
        setRegistrations(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Filtered and Sorted Registrations
  const filteredRegistrations = useMemo(() => {
    let list = [...registrations];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.whatsapp && r.whatsapp.toLowerCase().includes(q)) ||
          (r.course && r.course.toLowerCase().includes(q)) ||
          (r.status && r.status.toLowerCase().includes(q))
      );
    }

    // Course filter
    if (selectedCourse !== 'all') {
      list = list.filter((r) => r.course === selectedCourse);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      list = list.filter((r) => r.status === selectedStatus);
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [registrations, searchQuery, selectedCourse, selectedStatus, sortField, sortOrder]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE));
  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRegistrations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRegistrations, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = ['ID', 'Full Name', 'Email Address', 'WhatsApp Number', 'Course', 'Current Status', 'Registered At'];
    const rows = filteredRegistrations.map((r) => [
      r.id,
      r.name,
      r.email,
      r.whatsapp,
      r.course,
      r.status,
      new Date(r.created_at).toISOString()
    ]);

    const escapeCSV = (field) => {
      if (field === null || field === undefined) return '""';
      const stringified = String(field).replace(/"/g, '""');
      return `"${stringified}"`;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `webinar-registrations-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSortIcon = (field) => {
    return <IconSort size={13} order={sortField === field ? sortOrder : null} />;
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Registrations</h1>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={handleExportCSV}
          disabled={filteredRegistrations.length === 0}
        >
          <IconDownload size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="admin-controls-bar">
        <div className="admin-search-wrap">
          <IconSearch size={16} />
          <input
            type="text"
            className="admin-input"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="admin-filters-group">
          <select
            className="admin-select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Courses</option>
            <option value="bcom">B.Com / BBA</option>
            <option value="ca">CA</option>
            <option value="cma-india">CMA India</option>
            <option value="cma-usa">CMA USA</option>
            <option value="acca">ACCA</option>
            <option value="mba">MBA</option>
            <option value="other">Other</option>
          </select>

          <select
            className="admin-select"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="student">Student</option>
            <option value="professional">Working Professional</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          {loading ? (
            <div style={{ padding: 36, textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
              Loading registrations...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="admin-empty-state">
              <IconEmpty size={36} />
              <p>No registrations found matching your criteria.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    Name {getSortIcon('name')}
                  </th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th className="sortable" onClick={() => handleSort('course')}>
                    Course {getSortIcon('course')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('status')}>
                    Status {getSortIcon('status')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('created_at')}>
                    Registered Date {getSortIcon('created_at')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRegistrations.map((reg) => (
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
                    <td>
                      {new Date(reg.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="admin-pagination-btns">
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`admin-page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendee Details Modal */}
      {selectedReg && (
        <RegistrationModal registration={selectedReg} onClose={() => setSelectedReg(null)} />
      )}
    </div>
  );
}
