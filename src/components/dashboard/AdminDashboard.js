import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { userService, propertyService, bookingService } from '../../services/api';
import AdminStats from './admin/AdminStats';
import RecentActivity from './admin/RecentActivity';
import UserManagement from './admin/UserManagement';
import SystemHealth from './admin/SystemHealth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch admin data
  const { data: stats, isLoading } = useQuery('adminStats', async () => {
    const [users, properties, bookings] = await Promise.all([
      userService.getUsers(),
      propertyService.getProperties(),
      bookingService.getBookings()
    ]);
    return { users, properties, bookings };
  });

  if (isLoading) return <div className="admin-loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={activeTab === 'overview' ? 'active' : ''}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={activeTab === 'users' ? 'active' : ''}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('system')} 
          className={activeTab === 'system' ? 'active' : ''}
        >
          System
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <>
            <AdminStats stats={stats} />
            <RecentActivity />
          </>
        )}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'system' && <SystemHealth />}
      </div>
    </div>
  );
};

export default AdminDashboard;
