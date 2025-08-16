import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './SellerLayout.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faHome, 
  faEnvelope, 
  faChartBar, 
  faCog, 
  faSignOutAlt, 
  faPlus,
  faCalendarAlt,
  faUser,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import PropertyForm from '../properties/PropertyForm';
import { useUser } from '../../context/UserContext';

const navItems = [
  { path: '/seller/dashboard', icon: faChartLine, text: 'Dashboard' },
  { path: '/seller/properties', icon: faHome, text: 'My Properties' },
  { path: '/seller/bookings', icon: faCalendarAlt, text: 'Bookings' },
  { path: '/seller/inquiries', icon: faEnvelope, text: 'Inquiries' },
  { path: '/seller/analytics', icon: faChartBar, text: 'Analytics' },
  { path: '/seller/settings', icon: faCog, text: 'Settings' },
  { path: '/seller/profile', icon: faUser, text: 'Profile' }
];

const SellerLayout = ({ children }) => {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // Close sidebar when location changes (on mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSaveProperty = (property) => {
    setShowForm(false);
    setEditingProperty(null);
    // Refresh the properties list if on properties page
    if (location.pathname === '/seller/properties') {
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCloseSidebar = () => setSidebarOpen(false);
  
  const currentPath = location.pathname;

  // Sample data for the dashboard
  const stats = [
    { title: 'Total Properties', value: '12', change: '+2', isPositive: true },
    { title: 'Active Bookings', value: '8', change: '+3', isPositive: true },
    { title: 'Pending Inquiries', value: '5', change: '-1', isPositive: false },
    { title: 'Total Revenue', value: '$4,280', change: '+12%', isPositive: true }
  ];

  const recentActivities = [
    { id: 1, type: 'booking', title: 'New booking for Beach Villa', time: '2 hours ago', icon: faCalendarAlt },
    { id: 2, type: 'inquiry', title: 'Inquiry about Mountain View', time: '5 hours ago', icon: faEnvelope },
    { id: 3, type: 'payment', title: 'Payment received for #12345', time: '1 day ago', icon: faChartLine }
  ];

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
          <FontAwesomeIcon icon={faBuilding} size="2x" />
        </div>
        <h1>Seller Portal</h1>
        <p className="seller-sidebar-tagline-pro">Manage &amp; Grow</p>
        <button
          className="seller-sidebar-close"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          &times;
        </button>
      </div>
      <div className="seller-profile-info">
        <div className="seller-avatar">
          {user?.first_name?.[0] || 'U'}
        </div>
        <div className="seller-details">
          <h4>{user?.first_name || 'User'} {user?.last_name || ''}</h4>
          <p>{user?.email || ''}</p>
        </div>
      </div>
      <nav className="seller-sidebar-nav-pro">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={`nav-link-pro ${currentPath === item.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <FontAwesomeIcon icon={item.icon} />
                <span>{item.text}</span>
                {item.text === 'Inquiries' && <span className="nav-badge-pro">3</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="seller-sidebar-footer-pro">
        <button 
          className="seller-sidebar-logout-pro" 
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>
      </aside>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="seller-sidebar-overlay" 
          onClick={handleCloseSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCloseSidebar()}
          aria-label="Close sidebar"
        />
      )}
      <div className="seller-main-content-pro">
        <div className="seller-header-pro">
          <div className="seller-welcome-pro">
            <h2>
              {location.pathname === '/seller/dashboard' && 'Dashboard'}
              {location.pathname === '/seller/properties' && 'My Properties'}
              {location.pathname === '/seller/bookings' && 'Property Bookings'}
              {location.pathname === '/seller/inquiries' && 'Inquiries'}
              {location.pathname === '/seller/analytics' && 'Analytics'}
              {location.pathname === '/seller/settings' && 'Account Settings'}
              {location.pathname === '/seller/profile' && 'My Profile'}
            </h2>
            <p>
              {location.pathname === '/seller/dashboard' && 'Overview of your properties and activities'}
              {location.pathname === '/seller/properties' && 'Manage your property listings'}
              {location.pathname === '/seller/bookings' && 'View and manage property bookings'}
              {location.pathname === '/seller/inquiries' && 'Manage property inquiries'}
              {location.pathname === '/seller/analytics' && 'View property performance and statistics'}
              {location.pathname === '/seller/settings' && 'Update your account settings'}
              {location.pathname === '/seller/profile' && 'View and edit your profile'}
            </p>
          </div>
          
          {(location.pathname === '/seller/properties' || location.pathname === '/seller/dashboard') && (
            <div className="seller-actions-pro">
              <button 
                className="add-property-btn-pro" 
                onClick={() => { 
                  setShowForm(true); 
                  setEditingProperty(null); 
                }}
              >
                <FontAwesomeIcon icon={faPlus} /> Add New Property
              </button>
            </div>
          )}
        </div>
        
        <div className="seller-content-wrapper">
          {location.pathname === '/seller/dashboard' ? (
            <>
              <div className="dashboard-stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-title">{stat.title}</div>
                    <div className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                      {stat.change} {stat.isPositive ? '↑' : '↓'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="dashboard-content-grid">
                <div className="dashboard-card recent-activities">
                  <h3>Recent Activities</h3>
                  <div className="activities-list">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          <FontAwesomeIcon icon={activity.icon} />
                        </div>
                        <div className="activity-details">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-time">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-card quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                    <button className="action-btn" onClick={() => navigate('/seller/properties')}>
                      <FontAwesomeIcon icon={faHome} />
                      <span>Manage Properties</span>
                    </button>
                    <button className="action-btn" onClick={() => navigate('/seller/bookings')}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>View Bookings</span>
                    </button>
                    <button className="action-btn" onClick={() => setShowForm(true)}>
                      <FontAwesomeIcon icon={faPlus} />
                      <span>Add New Property</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            children
          )}
        </div>

        {showForm && (
          <PropertyForm
            onClose={() => { 
              setShowForm(false); 
              setEditingProperty(null); 
            }}
            onSubmit={handleSaveProperty}
            property={editingProperty}
          />
        )}
      </div>
    </div>
  );
};

export default SellerLayout;
