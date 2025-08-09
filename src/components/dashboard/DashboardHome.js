import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faHome, faCalendar, faUsers, faEnvelope, faChartBar, faChartLine } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    newClients: 0,
    messages: 0,
    messagesTrend: 0,
    propertiesTrend: 0,
    bookingsTrend: 0,
    clientsTrend: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [propertyDistribution, setPropertyDistribution] = useState([]);

  useEffect(() => {
    // Mock data for development
    const mockStats = {
      totalProperties: 125,
      activeBookings: 42,
      newClients: 35,
      messages: 15,
      messagesTrend: 8,
      propertiesTrend: 15,
      bookingsTrend: 8,
      clientsTrend: 12
    };
    const mockRecentActivity = [
      {
        id: 1,
        type: 'success',
        icon: faHome,
        title: 'New Property Listed',
        description: 'Luxury apartment in downtown area has been listed',
        timeAgo: '5 minutes ago'
      },
      {
        id: 2,
        type: 'info',
        icon: faCalendar,
        title: 'Booking Confirmed',
        description: 'Client booked property #123 for viewing',
        timeAgo: '1 hour ago'
      },
      {
        id: 3,
        type: 'success',
        icon: faUsers,
        title: 'New Client Registered',
        description: 'John Doe joined our platform',
        timeAgo: '3 hours ago'
      }
    ];
    const mockPropertyDistribution = [
      {
        id: 1,
        type: 'Apartments',
        icon: faHome,
        properties: 75,
        percentage: 60,
        color: '#4F8EF7'
      },
      {
        id: 2,
        type: 'Houses',
        icon: faChartBar,
        properties: 35,
        percentage: 28,
        color: '#6C5CE7'
      },
      {
        id: 3,
        type: 'Land',
        icon: faChartLine,
        properties: 15,
        percentage: 12,
        color: '#00B894'
      }
    ];
    setStats(mockStats);
    setRecentActivity(mockRecentActivity);
    setPropertyDistribution(mockPropertyDistribution);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="stats-grid-pro">
        <div className="stat-card-pro">
          <div className="stat-icon-pro bg-blue"><FontAwesomeIcon icon={faHome} /></div>
          <div className="stat-content-pro">
            <h3>Total Properties</h3>
            <p className="stat-number-pro">{stats.totalProperties}</p>
            <span className="trend-pro up">+15% from last month</span>
          </div>
        </div>
        <div className="stat-card-pro">
          <div className="stat-icon-pro bg-indigo"><FontAwesomeIcon icon={faCalendar} /></div>
          <div className="stat-content-pro">
            <h3>Active Bookings</h3>
            <p className="stat-number-pro">{stats.activeBookings}</p>
            <span className="trend-pro up">+8% increase</span>
          </div>
        </div>
        <div className="stat-card-pro">
          <div className="stat-icon-pro bg-green"><FontAwesomeIcon icon={faUsers} /></div>
          <div className="stat-content-pro">
            <h3>New Clients</h3>
            <p className="stat-number-pro">{stats.newClients}</p>
            <span className="trend-pro up">+12% growth</span>
          </div>
        </div>
        <div className="stat-card-pro">
          <div className="stat-icon-pro bg-orange"><FontAwesomeIcon icon={faEnvelope} /></div>
          <div className="stat-content-pro">
            <h3>Messages</h3>
            <p className="stat-number-pro">{stats.messages}</p>
            <span className="trend-pro down">{stats.messagesTrend}% change</span>
          </div>
        </div>
      </section>
      <section className="charts-section-pro">
        <div className="chart-container-pro">
          <h3>Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="activity-feed-pro">
              {recentActivity.map((activity) => (
                <div key={activity.id} className={`activity-item-pro ${activity.type}`}>
                  <div className="activity-icon-pro">
                    <FontAwesomeIcon icon={activity.icon} />
                  </div>
                  <div className="activity-content-pro">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span className="activity-time-pro">{activity.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-placeholder-pro">
              <p>No recent activity</p>
            </div>
          )}
        </div>
        <div className="chart-container-pro">
          <h3>Property Distribution</h3>
          {propertyDistribution.length > 0 ? (
            <div className="property-distribution-pro">
              {propertyDistribution.map((item) => (
                <div key={item.id} className="distribution-item-pro" style={{ backgroundColor: item.color }}>
                  <div className="distribution-icon-pro">
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  <div className="distribution-content-pro">
                    <h4>{item.type}</h4>
                    <p>{item.properties} Properties</p>
                    <div className="distribution-bar-pro">
                      <div className="distribution-bar-fill-pro" style={{ width: `${item.percentage}%` }}></div>
                      <span>{item.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-placeholder-pro">
              <p>No property distribution data available</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DashboardHome; 