import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { IconMenu } from './AdminIcons';
import '../../styles/admin.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-root">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        {/* Mobile Topbar */}
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle Navigation Menu"
          >
            <IconMenu size={20} />
          </button>
          <div className="admin-topbar-title">Skill Arcadia Admin</div>
          <div style={{ width: 24 }}></div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
