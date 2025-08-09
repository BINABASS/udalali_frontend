import React from 'react';
import './BuyerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHeart, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';

const stats = [
  {
    icon: faHome,
    label: 'Properties Viewed',
    value: 25,
    color: 'bg-blue',
  },
  {
    icon: faHeart,
    label: 'Favorites',
    value: 5,
    color: 'bg-pink',
  },
  {
    icon: faSearch,
    label: 'Saved Searches',
    value: 3,
    color: 'bg-purple',
  },
  {
    icon: faUser,
    label: 'Profile Complete',
    value: '80%',
    color: 'bg-indigo',
  },
];

const activity = [
  {
    icon: faHome,
    text: 'Viewed property in Downtown',
    time: '30 minutes ago',
  },
  {
    icon: faHeart,
    text: 'Saved luxury apartment',
    time: '1 hour ago',
  },
  {
    icon: faSearch,
    text: 'Updated search preferences',
    time: '2 hours ago',
  },
];

const BuyerDashboard = () => {
  return (
    <div className="buyer-dashboard-pro glassy-buyer-dashboard">
      <div className="buyer-dashboard-header-pro">
        <h2>Welcome, Buyer</h2>
        <p>Find your dream property and manage your favorites</p>
      </div>
      <div className="buyer-stats-grid-pro">
        {stats.map((stat, idx) => (
          <div className={`buyer-stat-card-pro glassy-pro ${stat.color}`} key={stat.label}>
            <div className="buyer-stat-icon-pro">
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div>
              <h3>{stat.label}</h3>
              <p className="buyer-stat-number-pro">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="buyer-activity-section-pro glassy-pro">
        <h3>Recent Activity</h3>
        <div className="buyer-activity-list-pro">
          {activity.map((item, idx) => (
            <div className="buyer-activity-item-pro" key={idx}>
              <span className="buyer-activity-icon-pro">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <div className="buyer-activity-content-pro">
                <p>{item.text}</p>
                <span className="buyer-activity-time-pro">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
