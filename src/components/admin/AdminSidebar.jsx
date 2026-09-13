import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '../../services/authService';
import { IconOverview, IconUsers, IconSettings, IconLogout, IconClose } from './AdminIcons';

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <>
      {isOpen && <div className="admin-sidebar-backdrop" onClick={onClose} />}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div>
            <h3>Skill Arcadia</h3>
            <span>ADMIN CONSOLE</span>
          </div>
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Navigation Menu"
          >
            <IconClose size={18} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <IconOverview size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/admin/registrations"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <IconUsers size={18} />
            <span>Registrations</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <IconSettings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <IconLogout size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
