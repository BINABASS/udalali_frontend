import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './BuyerLayout.css';
import { useUser } from '../../context/UserContext';

const navItems = [
  { path: '/buyer/dashboard', icon: 'fas fa-home', text: 'Dashboard' },
  { path: '/buyer/properties', icon: 'fas fa-building', text: 'Properties' },
  { path: '/buyer/favorites', icon: 'fas fa-heart', text: 'Favorites' },
  { path: '/buyer/saved-searches', icon: 'fas fa-search', text: 'Saved Searches' },
  { path: '/buyer/profile', icon: 'fas fa-user', text: 'Profile' }
];

const BuyerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useUser();
  const navigate = useNavigate();

  // Close sidebar when clicking overlay or a nav link (on mobile)
  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <div className="buyer-layout">
      {/* Hamburger for mobile */}
      <button
        className="buyer-hamburger"
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
      <div className={`buyer-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="buyer-logo">
          <h2>Buyer Dashboard</h2>
          <button
            className="buyer-sidebar-close"
            aria-label="Close sidebar"
            onClick={handleCloseSidebar}
          >
            &times;
          </button>
        </div>
        <nav className="buyer-nav">
          <ul>
            <li>
              <Link to="/buyer/dashboard" onClick={handleCloseSidebar}>
                <i className="fas fa-home"></i>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/buyer/properties" onClick={handleCloseSidebar}>
                <i className="fas fa-building"></i>
                Properties
              </Link>
            </li>
            <li>
              <Link to="/buyer/favorites" onClick={handleCloseSidebar}>
                <i className="fas fa-heart"></i>
                Favorites
              </Link>
            </li>
            <li>
              <Link to="/buyer/saved-searches" onClick={handleCloseSidebar}>
                <i className="fas fa-search"></i>
                Saved Searches
              </Link>
            </li>
            <li>
              <Link to="/buyer/profile" onClick={handleCloseSidebar}>
                <i className="fas fa-user"></i>
                Profile
              </Link>
            </li>
          </ul>
        </nav>
        <div className="buyer-sidebar-footer">
          <button className="buyer-sidebar-logout" onClick={() => { logout(); navigate('/login'); }}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="buyer-sidebar-overlay" onClick={handleCloseSidebar} />}
      <div className="buyer-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default BuyerLayout;
