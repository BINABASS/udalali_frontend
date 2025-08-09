import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faHome, faCalendar, faUsers, faEnvelope, faChartBar, faCog, faBell, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const AdminLayout = () => {
  const [notifications, setNotifications] = useState(0);
  useEffect(() => { setNotifications(3); }, []);
  return (
    <div className="admin-dashboard-root">
      <aside className="sidebar-pro glassy-admin-sidebar">
        <div className="admin-sidebar-logo">
          <FontAwesomeIcon icon={faChartLine} size="2x" />
          <span className="admin-logo-text">U<span className="accent">Digi</span> Admin</span>
        </div>
        <nav className="sidebar-nav-pro">
          <ul>
            <li><Link to="/dashboard" className="nav-link-pro"><span className="nav-accent-bar"></span><FontAwesomeIcon icon={faChartLine} size="lg" /><span>Dashboard</span></Link></li>
            <li><Link to="/dashboard/properties" className="nav-link-pro"><span className="nav-accent-bar"></span><FontAwesomeIcon icon={faHome} size="lg" /><span>Properties</span></Link></li>
            <li><Link to="/dashboard/booking" className="nav-link-pro"><span className="nav-accent-bar"></span><FontAwesomeIcon icon={faCalendar} size="lg" /><span>Bookings</span></Link></li>
            <li><Link to="/dashboard/clients" className="nav-link-pro"><span className="nav-accent-bar"></span><FontAwesomeIcon icon={faUsers} size="lg" /><span>Clients</span></Link></li>
            <li><Link to="/dashboard/messages" className="nav-link-pro"><span className="nav-accent-bar"></span><FontAwesomeIcon icon={faEnvelope} size="lg" /><span>Messages</span>{notifications > 0 && <span className="nav-badge-pro">{notifications}</span>}</Link></li>
            <li><Link to="/dashboard/reports" className="nav-link-pro"><span className="nav-accent-bar"></span><FontAwesomeIcon icon={faChartBar} size="lg" /><span>Reports</span></Link></li>
          </ul>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <FontAwesomeIcon icon={faUserCircle} size="2x" />
            <div>
              <span className="user-name-pro">Admin</span>
              <span className="user-role-pro">Administrator</span>
            </div>
          </div>
          <div className="admin-sidebar-actions">
            <button className="sidebar-action-btn"><FontAwesomeIcon icon={faCog} /> Settings</button>
            <Link to="/login" className="sidebar-action-btn logout"><FontAwesomeIcon icon={faSignOutAlt} /> Logout</Link>
          </div>
        </div>
      </aside>
      <main className="main-content-pro">
        <header className="header-pro">
          <div className="welcome-pro">
            <h2>Welcome, Admin</h2>
            <p>Today's Summary - {new Date().toLocaleDateString()}</p>
          </div>
          <div className="user-actions-pro">
            <div className="notification-badge-pro">
              <FontAwesomeIcon icon={faBell} />
              {notifications > 0 && <span className="nav-badge-pro">{notifications}</span>}
            </div>
            <Link to="/login" className="logout-btn-pro">
              <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </Link>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
