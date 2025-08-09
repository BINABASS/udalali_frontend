import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SellerLayout.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faHome, faEnvelope, faChartBar, faCog, faSignOutAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import PropertyForm from '../properties/PropertyForm';
import { useUser } from '../../context/UserContext';

const navItems = [
  { path: '/seller/dashboard', icon: faChartLine, text: 'Dashboard' },
  { path: '/seller/properties', icon: faHome, text: 'My Properties' },
  { path: '/seller/inquiries', icon: faEnvelope, text: 'Inquiries' },
  { path: '/seller/analytics', icon: faChartBar, text: 'Analytics' },
  { path: '/seller/settings', icon: faCog, text: 'Settings' }
];

const SellerLayout = ({ children }) => {
  // Modal state for Add/Edit Property
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  // Sidebar responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useUser();
  const navigate = useNavigate();

  // Handler for saving property (can be passed down or handled globally)
  const handleSaveProperty = (property) => {
    setShowForm(false);
    setEditingProperty(null);
  };

  // Close sidebar when clicking overlay or a nav link (on mobile)
  const handleCloseSidebar = () => setSidebarOpen(false);

  // Get current path for active state
  const currentPath = window.location.pathname;

  return (
    <div className="seller-layout-pro">
      {/* Hamburger for mobile */}
      <button
        className="seller-hamburger"
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
            <FontAwesomeIcon icon={item.icon} />
          </Link>
        ))}
      </div>
      {/* Sidebar and overlay */}
      <aside className={`seller-sidebar-pro${sidebarOpen ? ' open' : ''}`}>
        <div className="seller-sidebar-brand-pro">
          <div className="seller-brand-logo-pro">
            <FontAwesomeIcon icon={faChartLine} size="2x" />
          </div>
          <h1>Seller Portal</h1>
          <p className="seller-sidebar-tagline-pro">Manage &amp; Grow</p>
          <button
            className="seller-sidebar-close"
            aria-label="Close sidebar"
            onClick={handleCloseSidebar}
          >
            &times;
          </button>
        </div>
        <nav className="seller-sidebar-nav-pro">
          <ul>
            <li><Link to="/seller/dashboard" className="nav-link-pro" onClick={handleCloseSidebar}><FontAwesomeIcon icon={faChartLine} /><span>Dashboard</span></Link></li>
            <li><Link to="/seller/properties" className="nav-link-pro" onClick={handleCloseSidebar}><FontAwesomeIcon icon={faHome} /><span>My Properties</span><span className="nav-badge-pro">New</span></Link></li>
            <li><Link to="/seller/inquiries" className="nav-link-pro" onClick={handleCloseSidebar}><FontAwesomeIcon icon={faEnvelope} /><span>Inquiries</span></Link></li>
            <li><Link to="/seller/analytics" className="nav-link-pro" onClick={handleCloseSidebar}><FontAwesomeIcon icon={faChartBar} /><span>Analytics</span></Link></li>
            <li><Link to="/seller/settings" className="nav-link-pro" onClick={handleCloseSidebar}><FontAwesomeIcon icon={faCog} /><span>Settings</span></Link></li>
          </ul>
        </nav>
        <div className="seller-sidebar-footer-pro">
          <button className="seller-sidebar-logout-pro" onClick={() => { logout(); navigate('/login'); }}><FontAwesomeIcon icon={faSignOutAlt} /> Logout</button>
        </div>
      </aside>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="seller-sidebar-overlay" onClick={handleCloseSidebar} />}
      <div className="seller-main-content-pro">
        <div className="seller-header-pro">
          <div className="seller-welcome-pro">
            <h2>My Dashboard</h2>
            <p>Manage your properties and track performance</p>
          </div>
          <div className="seller-actions-pro">
            <button className="add-property-btn-pro" onClick={() => { setShowForm(true); setEditingProperty(null); }}>
              <FontAwesomeIcon icon={faPlus} /> Add New Property
            </button>
          </div>
        </div>
        {children}
        {showForm && (
          <PropertyForm
            onClose={() => { setShowForm(false); setEditingProperty(null); }}
            onSubmit={handleSaveProperty}
            property={editingProperty}
          />
        )}
      </div>
    </div>
  );
};

export default SellerLayout;
