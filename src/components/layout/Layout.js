import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: 'fas fa-chart-line', text: 'Dashboard' },
    { path: '/dashboard/properties', icon: 'fas fa-home', text: 'Properties' },
    { path: '/dashboard/booking', icon: 'fas fa-calendar', text: 'Bookings' },
    { path: '/dashboard/clients', icon: 'fas fa-users', text: 'Clients' },
    { path: '/dashboard/messages', icon: 'fas fa-envelope', text: 'Messages' },
    { path: '/dashboard/reports', icon: 'fas fa-chart-bar', text: 'Reports' }
    // Removed Contact page from sidebar
  ];

  // Close sidebar when clicking overlay or a nav link (on mobile)
  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* Hamburger for mobile */}
      <button
        className="admin-hamburger"
        aria-label="Open sidebar"
        onClick={() => setSidebarOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>
      {/* Mini sidebar for mobile/tablet */}
      <div className="mini-sidebar">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mini-sidebar-icon${currentPath === item.path ? ' active' : ''}`}
            aria-label={item.text}
            tabIndex={sidebarOpen ? -1 : 0}
          >
            <i className={item.icon}></i>
          </Link>
        ))}
      </div>
      {/* Sidebar and overlay */}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <h1>Digi Dalali <span className="brand-subtitle">(Udalali wa Kidijitali)</span></h1>
          <button
            className="sidebar-close"
            aria-label="Close sidebar"
            onClick={handleCloseSidebar}
          >
            &times;
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
                  onClick={handleCloseSidebar}
                >
                  <i className={item.icon}></i>
                  <span>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <Link to="/login" className="logout-btn" onClick={handleCloseSidebar}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </Link>
        </div>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={handleCloseSidebar} />}
      <div className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
