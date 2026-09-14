import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getRegistrations, deleteRegistrations } from '../../services/registrationService';
import RegistrationModal from '../../components/admin/RegistrationModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import {
  IconDownload,
  IconSearch,
  IconSort,
  IconEmpty,
  IconTrash,
  IconCheckCircle,
  IconClose
} from '../../components/admin/AdminIcons';

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

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    ids: [],
    count: 0,
    targetName: '',
    targetEmail: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Success / Feedback notification
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

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

  // Selection helpers
  const isSelectionMode = selectedIds.length > 0;
  const visibleIds = useMemo(
    () => paginatedRegistrations.map((r) => r.id),
    [paginatedRegistrations]
  );

  const isAllVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const isIndeterminate =
    visibleIds.some((id) => selectedIds.includes(id)) && !isAllVisibleSelected;

  const handleToggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      // Unselect visible items
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible items
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectRow = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Long press detection for rows
  const longPressTimerRef = useRef(null);
  const isLongPressTriggeredRef = useRef(false);
  const pointerStartPosRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (regId, e) => {
    if (e.button !== undefined && e.button !== 0) return;

    isLongPressTriggeredRef.current = false;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };

    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setSelectedIds((prev) =>
        prev.includes(regId) ? prev : [...prev, regId]
      );
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch {}
      }
    }, 450);
  };

  const handlePointerMove = (e) => {
    if (!longPressTimerRef.current) return;
    const deltaX = Math.abs(e.clientX - pointerStartPosRef.current.x);
    const deltaY = Math.abs(e.clientY - pointerStartPosRef.current.y);
    if (deltaX > 8 || deltaY > 8) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleRowClick = (reg) => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    if (isSelectionMode) {
      handleToggleSelectRow(reg.id);
    } else {
      setSelectedReg(reg);
    }
  };

  // Request single delete
  const handleRequestSingleDelete = (reg, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      ids: [reg.id],
      count: 1,
      targetName: reg.name,
      targetEmail: reg.email
    });
  };

  // Request bulk delete
  const handleRequestBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      ids: [...selectedIds],
      count: selectedIds.length,
      targetName: '',
      targetEmail: ''
    });
  };

  // Perform confirmed deletion
  const handleConfirmDelete = async () => {
    const { ids, count } = deleteModal;
    if (!ids || ids.length === 0) return;

    setIsDeleting(true);
    const res = await deleteRegistrations(ids);
    setIsDeleting(false);

    if (res.success) {
      // Remove deleted records from local state
      setRegistrations((prev) => prev.filter((r) => !ids.includes(r.id)));
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));

      // If the currently inspected attendee was deleted, close detail modal
      if (selectedReg && ids.includes(selectedReg.id)) {
        setSelectedReg(null);
      }

      // Close delete modal
      setDeleteModal({
        isOpen: false,
        ids: [],
        count: 0,
        targetName: '',
        targetEmail: ''
      });

      // Adjust page if needed
      const remainingFilteredCount = filteredRegistrations.length - ids.length;
      const newTotalPages = Math.max(1, Math.ceil(remainingFilteredCount / ITEMS_PER_PAGE));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }

      showToast(
        count > 1
          ? `Successfully deleted ${count} registrations.`
          : 'Registration deleted successfully.'
      );
    } else {
      alert(res.error || 'Failed to delete registrations. Please try again.');
    }
  };

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

    const headers = [
      'ID',
      'Full Name',
      'Email Address',
      'WhatsApp Number',
      'Course',
      'Current Status',
      'Registered At'
    ];
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
          <span>Export</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {toastMessage && (
        <div className="admin-alert admin-alert-success" style={{ animation: 'adminModalIn 200ms ease' }}>
          <IconCheckCircle size={18} />
          <span style={{ flex: 1 }}>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: 0,
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Dismiss alert"
          >
            <IconClose size={16} />
          </button>
        </div>
      )}

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
                  <th className="th-actions" style={{ textAlign: 'center', width: 52 }} aria-label="Actions">
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={isAllVisibleSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={handleToggleSelectAllVisible}
                        aria-label="Select all visible registrations"
                        title="Select all"
                      />
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRegistrations.map((reg) => {
                  const isSelected = selectedIds.includes(reg.id);
                  return (
                    <tr
                      key={reg.id}
                      className={isSelected ? 'selected' : ''}
                      onPointerDown={(e) => handlePointerDown(reg.id, e)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onContextMenu={(e) => {
                        if (isLongPressTriggeredRef.current) e.preventDefault();
                      }}
                      onClick={() => handleRowClick(reg)}
                    >
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
                      <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                        {isSelectionMode ? (
                          <input
                            type="checkbox"
                            className="admin-checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectRow(reg.id, e)}
                            aria-label={`Select ${reg.name}`}
                          />
                        ) : (
                          <button
                            type="button"
                            className="admin-action-btn"
                            title="Delete registration"
                            aria-label={`Delete registration for ${reg.name}`}
                            onClick={(e) => handleRequestSingleDelete(reg, e)}
                          >
                            <IconTrash size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Floating Bottom Selection Bar (WhatsApp Web Style) */}
      {selectedIds.length > 0 && (
        <div className="admin-bulk-bottom-bar" role="toolbar" aria-label="Selected registrations actions">
          <div className="admin-bulk-bottom-left">
            <button
              type="button"
              className="admin-bulk-close-btn"
              onClick={() => setSelectedIds([])}
              title="Cancel selection"
              aria-label="Cancel selection"
            >
              <IconClose size={18} />
            </button>
            <span className="admin-bulk-count">
              {selectedIds.length} selected
            </span>
          </div>

          <div className="admin-bulk-bottom-right">
            <button
              type="button"
              className="admin-bulk-delete-btn"
              onClick={handleRequestBulkDelete}
              title={`Delete ${selectedIds.length} selected registration${selectedIds.length > 1 ? 's' : ''}`}
              aria-label="Delete selected registrations"
            >
              <IconTrash size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Attendee Details Modal */}
      {selectedReg && (
        <RegistrationModal
          registration={selectedReg}
          onClose={() => setSelectedReg(null)}
          onDelete={(reg) => {
            setSelectedReg(null);
            handleRequestSingleDelete(reg);
          }}
        />
      )}

      {/* Delete Confirmation Alert Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        count={deleteModal.count}
        targetName={deleteModal.targetName}
        targetEmail={deleteModal.targetEmail}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModal({
              isOpen: false,
              ids: [],
              count: 0,
              targetName: '',
              targetEmail: ''
            });
          }
        }}
      />
    </div>
  );
}
