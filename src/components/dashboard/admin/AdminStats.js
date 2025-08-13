import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faHome, 
  faCalendarAlt, 
  faDollarSign,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import './AdminStats.css';

const AdminStats = ({ stats = {} }) => {
  const { users = [], properties = [], bookings = [] } = stats;

  // Calculate statistics
  const totalUsers = users.length || 0;
  const activeUsers = users.filter(user => user.is_active).length || 0;
  const totalProperties = properties.length || 0;
  const activeProperties = properties.filter(p => p.is_available).length || 0;
  const totalBookings = bookings.length || 0;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length || 0;
  const revenue = bookings.reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);

  const statsData = [
    {
      title: 'Total Users',
      value: totalUsers,
      change: '+12.5%',
      icon: faUsers,
      color: '#4e73df',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      change: '+8.2%',
      icon: faUsers,
      color: '#1cc88a',
      trend: 'up'
    },
    {
      title: 'Total Properties',
      value: totalProperties,
      change: '+5.7%',
      icon: faHome,
      color: '#36b9cc',
      trend: 'up'
    },
    {
      title: 'Available Properties',
      value: activeProperties,
      change: '+3.4%',
      icon: faHome,
      color: '#f6c23e',
      trend: 'up'
    },
    {
      title: 'Total Bookings',
      value: totalBookings,
      change: '+15.2%',
      icon: faCalendarAlt,
      color: '#e74a3b',
      trend: 'up'
    },
    {
      title: 'Pending Bookings',
      value: pendingBookings,
      change: pendingBookings > 0 ? `+${pendingBookings} new` : 'No pending',
      icon: faCalendarAlt,
      color: pendingBookings > 0 ? '#e74a3b' : '#858796',
      trend: pendingBookings > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Revenue',
      value: `$${revenue.toLocaleString()}`,
      change: '+10.3%',
      icon: faDollarSign,
      color: '#1cc88a',
      trend: 'up'
    },
    {
      title: 'Avg. Booking Value',
      value: totalBookings > 0 ? `$${(revenue / totalBookings).toFixed(2)}` : '$0',
      change: '+2.1%',
      icon: faChartLine,
      color: '#36b9cc',
      trend: 'up'
    }
  ];

  return (
    <div className="admin-stats">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
              <FontAwesomeIcon icon={stat.icon} style={{ color: stat.color }} />
            </div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.trend}`}>
                {stat.change} 
                {stat.trend === 'up' && '↑'}
                {stat.trend === 'down' && '↓'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;
