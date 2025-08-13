import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faServer, 
  faDatabase, 
  faClock,
  faMicrochip,
  faMemory,
  faHdd,
  faNetworkWired,
  faSync,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './SystemHealth.css';

const SystemHealth = () => {
  const [systemStatus, setSystemStatus] = useState({
    status: 'loading',
    lastChecked: null,
    uptime: '0 days 00:00:00',
    services: [],
    resources: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    },
    logs: []
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - in a real app, this would come from an API
  const fetchSystemStatus = () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setSystemStatus({
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        uptime: '15 days 07:23:45',
        services: [
          { name: 'Web Server', status: 'up', responseTime: '45ms' },
          { name: 'Database', status: 'up', responseTime: '12ms' },
          { name: 'Cache', status: 'up', responseTime: '2ms' },
          { name: 'Email Service', status: 'degraded', responseTime: '320ms' },
          { name: 'File Storage', status: 'up', responseTime: '28ms' },
          { name: 'Authentication', status: 'up', responseTime: '18ms' },
          { name: 'Payment Gateway', status: 'up', responseTime: '65ms' },
          { name: 'Analytics', status: 'down', responseTime: '0ms' }
        ],
        resources: {
          cpu: 24.5,
          memory: 68.2,
          disk: 42.8,
          network: 15.3
        },
        logs: [
          { id: 1, level: 'info', message: 'System check completed', timestamp: new Date(Date.now() - 10000).toISOString() },
          { id: 2, level: 'warning', message: 'High memory usage detected', timestamp: new Date(Date.now() - 300000).toISOString() },
          { id: 3, level: 'error', message: 'Failed to connect to analytics service', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 4, level: 'info', message: 'Backup completed successfully', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { id: 5, level: 'info', message: 'Scheduled maintenance completed', timestamp: new Date(Date.now() - 172800000).toISOString() }
        ]
      });
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchSystemStatus();
    
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(fetchSystemStatus, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'up':
        return <span className="badge success">Operational</span>;
      case 'degraded':
        return <span className="badge warning">Degraded</span>;
      case 'down':
        return <span className="badge danger">Down</span>;
      case 'healthy':
        return <span className="badge success">Healthy</span>;
      case 'loading':
        return <span className="badge info">Checking...</span>;
      default:
        return <span className="badge">Unknown</span>;
    }
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'info':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-info" />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />;
      case 'error':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />;
      default:
        return <FontAwesomeIcon icon={faCheckCircle} className="text-info" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatUptime = (uptime) => {
    if (!uptime) return 'N/A';
    return uptime;
  };

  return (
    <div className="system-health">
      <div className="section-header">
        <h2>System Health</h2>
        <div className="header-actions">
          <span className="last-updated">
            Last checked: {systemStatus.lastChecked ? formatDate(systemStatus.lastChecked) : 'Never'}
          </span>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={fetchSystemStatus}
            disabled={isRefreshing}
          >
            <FontAwesomeIcon icon={faSync} spin={isRefreshing} />
            {isRefreshing ? ' Refreshing...' : ' Refresh'}
          </button>
        </div>
      </div>

      <div className="system-status">
        <div className="status-overview">
          <div className="status-card">
            <div className="status-icon">
              <FontAwesomeIcon icon={faServer} />
            </div>
            <div className="status-details">
              <div className="status-title">System Status</div>
              <div className="status-value">
                {getStatusBadge(systemStatus.status)}
              </div>
            </div>
          </div>
          
          <div className="status-card">
            <div className="status-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="status-details">
              <div className="status-title">Uptime</div>
              <div className="status-value">
                {formatUptime(systemStatus.uptime)}
              </div>
            </div>
          </div>
        </div>

        <div className="resource-usage">
          <h3>Resource Usage</h3>
          <div className="resource-grid">
            <div className="resource-card">
              <div className="resource-header">
                <FontAwesomeIcon icon={faMicrochip} className="resource-icon" />
                <span>CPU</span>
              </div>
              <div className="progress">
                <div 
                  className={`progress-bar ${systemStatus.resources.cpu > 80 ? 'bg-danger' : systemStatus.resources.cpu > 60 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${systemStatus.resources.cpu}%` }}
                  role="progressbar"
                  aria-valuenow={systemStatus.resources.cpu}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="resource-value">{systemStatus.resources.cpu}%</div>
            </div>

            <div className="resource-card">
              <div className="resource-header">
                <FontAwesomeIcon icon={faMemory} className="resource-icon" />
                <span>Memory</span>
              </div>
              <div className="progress">
                <div 
                  className={`progress-bar ${systemStatus.resources.memory > 80 ? 'bg-danger' : systemStatus.resources.memory > 60 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${systemStatus.resources.memory}%` }}
                  role="progressbar"
                  aria-valuenow={systemStatus.resources.memory}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="resource-value">{systemStatus.resources.memory}%</div>
            </div>

            <div className="resource-card">
              <div className="resource-header">
                <FontAwesomeIcon icon={faHdd} className="resource-icon" />
                <span>Disk</span>
              </div>
              <div className="progress">
                <div 
                  className={`progress-bar ${systemStatus.resources.disk > 80 ? 'bg-danger' : systemStatus.resources.disk > 60 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${systemStatus.resources.disk}%` }}
                  role="progressbar"
                  aria-valuenow={systemStatus.resources.disk}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="resource-value">{systemStatus.resources.disk}%</div>
            </div>

            <div className="resource-card">
              <div className="resource-header">
                <FontAwesomeIcon icon={faNetworkWired} className="resource-icon" />
                <span>Network</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar bg-info"
                  style={{ width: '100%' }}
                  role="progressbar"
                ></div>
              </div>
              <div className="resource-value">{systemStatus.resources.network} MB/s</div>
            </div>
          </div>
        </div>

        <div className="services-section">
          <h3>Services</h3>
          <div className="services-grid">
            {systemStatus.services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-name">
                  {service.status === 'up' ? (
                    <span className="status-dot success"></span>
                  ) : service.status === 'degraded' ? (
                    <span className="status-dot warning"></span>
                  ) : (
                    <span className="status-dot danger"></span>
                  )}
                  {service.name}
                </div>
                <div className="service-status">
                  {getStatusBadge(service.status)}
                </div>
                <div className="service-response">
                  {service.responseTime}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="system-logs">
          <h3>System Logs</h3>
          <div className="logs-container">
            {systemStatus.logs.length > 0 ? (
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Message</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {systemStatus.logs.map(log => (
                    <tr key={log.id} className={`log-entry log-${log.level}`}>
                      <td className="log-level">
                        {getLogIcon(log.level)}
                        <span className="level-text">{log.level.toUpperCase()}</span>
                      </td>
                      <td className="log-message">{log.message}</td>
                      <td className="log-timestamp">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-logs">No logs available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
