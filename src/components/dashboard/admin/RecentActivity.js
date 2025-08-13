import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faHome, 
  faCalendarAlt,
  faEdit,
  faTrash,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './RecentActivity.css';

const RecentActivity = () => {
  // This would typically come from an API
  const activities = [
    {
      id: 1,
      type: 'user',
      action: 'created',
      user: 'John Doe',
      target: 'johndoe@example.com',
      timestamp: '2025-08-13T10:30:00Z',
      icon: faUserPlus,
      color: '#4e73df'
    },
    {
      id: 2,
      type: 'property',
      action: 'added',
      user: 'Jane Smith',
      target: 'Luxury Villa in Stone Town',
      timestamp: '2025-08-13T09:15:00Z',
      icon: faHome,
      color: '#1cc88a'
    },
    {
      id: 3,
      type: 'booking',
      action: 'created',
      user: 'Mike Johnson',
      target: 'Booking #10025',
      timestamp: '2025-08-13T08:45:00Z',
      icon: faCalendarAlt,
      color: '#36b9cc'
    },
    {
      id: 4,
      type: 'property',
      action: 'updated',
      user: 'Admin',
      target: 'Beachfront Apartment',
      timestamp: '2025-08-12T16:20:00Z',
      icon: faEdit,
      color: '#f6c23e'
    },
    {
      id: 5,
      type: 'user',
      action: 'deactivated',
      user: 'Admin',
      target: 'spam@example.com',
      timestamp: '2025-08-12T14:10:00Z',
      icon: faTimesCircle,
      color: '#e74a3b'
    },
    {
      id: 6,
      type: 'booking',
      action: 'confirmed',
      user: 'System',
      target: 'Booking #10024',
      timestamp: '2025-08-12T11:30:00Z',
      icon: faCheckCircle,
      color: '#1cc88a'
    },
    {
      id: 7,
      type: 'property',
      action: 'deleted',
      user: 'Admin',
      target: 'Old Property',
      timestamp: '2025-08-11T17:45:00Z',
      icon: faTrash,
      color: '#e74a3b'
    }
  ];

  const getActionText = (activity) => {
    switch (activity.type) {
      case 'user':
        return `${activity.user} ${activity.action} user ${activity.target}`;
      case 'property':
        return `${activity.user} ${activity.action} property "${activity.target}"`;
      case 'booking':
        return `${activity.user} ${activity.action} ${activity.target}`;
      default:
        return `${activity.user} performed ${activity.action} on ${activity.target}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / (1000 * 60));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="recent-activity">
      <div className="section-header">
        <h3>Recent Activity</h3>
        <button className="btn btn-sm btn-link">View All</button>
      </div>
      
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon" style={{ backgroundColor: `${activity.color}15` }}>
              <FontAwesomeIcon icon={activity.icon} style={{ color: activity.color }} />
            </div>
            <div className="activity-details">
              <div className="activity-text">{getActionText(activity)}</div>
              <div className="activity-time">{formatDate(activity.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
