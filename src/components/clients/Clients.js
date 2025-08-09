import React, { useState, useMemo, useEffect } from 'react';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';
import './Clients.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUser, faBuilding, faCheckCircle, faTimesCircle, faEnvelope, faPhone, faMapMarkerAlt, faEye, faEdit, faTrash, faToggleOn } from '@fortawesome/free-solid-svg-icons';

const Clients = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showClientForm, setShowClientForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    // Load clients from localStorage
    const savedClients = JSON.parse(localStorage.getItem('clients')) || [
      {
        id: 1,
        name: 'John Smith',
        type: 'individual',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St, City, Country',
        company: null,
        totalBookings: 3,
        totalSpent: 15000,
        status: 'active',
        avatar: 'https://via.placeholder.com/150'
      },
      {
        id: 2,
        name: 'Tech Solutions Inc.',
        type: 'company',
        email: 'info@techsolutions.com',
        phone: '+0987654321',
        address: '456 Business Ave, City, Country',
        company: 'Tech Solutions Inc.',
        totalBookings: 8,
        totalSpent: 45000,
        status: 'active',
        avatar: 'https://via.placeholder.com/150'
      }
    ];

    setClients(savedClients);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Load accounts from localStorage
    setIsLoading(false);
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const filteredClients = clients;
    return {
      total: filteredClients.length,
      active: filteredClients.filter(c => c.status === 'active').length,
      inactive: filteredClients.filter(c => c.status === 'inactive').length,
      individual: filteredClients.filter(c => c.type === 'individual').length,
      company: filteredClients.filter(c => c.type === 'company').length
    };
  }, [clients]);

  // Filter clients based on selected type and search
  const filteredClients = useMemo(() => {
    let filtered = clients;
    if (selectedType !== 'all') {
      filtered = filtered.filter(client => client.type === selectedType);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        (client.name && client.name.toLowerCase().includes(query)) ||
        (client.email && client.email.toLowerCase().includes(query)) ||
        (client.company && client.company.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [clients, selectedType, searchQuery]);

  // Handler for editing a client
  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  // Handler for viewing client details
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  // Handler for deleting a client
  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
    }
  };

  // Handler for toggling client status
  const handleToggleClientStatus = (clientId) => {
    const updatedClients = clients.map(client =>
      client.id === clientId
        ? { ...client, status: client.status === 'active' ? 'inactive' : 'active' }
        : client
    );
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  // Update handleAddClient to support edit
  const handleAddClient = (formData, action) => {
    if (action === 'edit' && editingClient) {
      const updatedClients = clients.map(client =>
        client.id === editingClient.id ? { ...client, ...formData } : client
      );
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      setEditingClient(null);
    } else {
      const newClient = {
        ...formData,
        id: Date.now(),
        totalBookings: 0,
        totalSpent: 0,
        avatar: 'https://via.placeholder.com/150',
      };
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
    }
  };

  return (
    <div className="clients-page-pro">
      <div className="clients-header-pro">
        <div className="clients-header-title-pro">
          <FontAwesomeIcon icon={faUsers} className="clients-header-icon-pro" />
          <h1>Clients</h1>
        </div>
        <button className="add-btn" onClick={() => setShowClientForm(true)}>
          + Add Client
        </button>
        <div className="clients-header-actions-pro">
          <div className="clients-type-filters-pro">
            <button className={`clients-type-pill-pro ${selectedType === 'all' ? 'active' : ''}`} onClick={() => setSelectedType('all')}>All</button>
            <button className={`clients-type-pill-pro ${selectedType === 'individual' ? 'active' : ''}`} onClick={() => setSelectedType('individual')}>Individual</button>
            <button className={`clients-type-pill-pro ${selectedType === 'company' ? 'active' : ''}`} onClick={() => setSelectedType('company')}>Company</button>
          </div>
          <div className="clients-search-bar-pro">
            <FontAwesomeIcon icon={faUser} className="clients-search-icon-pro" />
            <input
              type="text"
              className="clients-search-input-pro"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="clients-statistics-pro">
          {/* Stat cards with icons and gradients */}
          <div className="clients-stat-card-pro">
            <FontAwesomeIcon icon={faUsers} className="clients-stat-icon-pro" />
            <div className="clients-stat-value-pro">{statistics.total}</div>
            <div className="clients-stat-label-pro">Total</div>
          </div>
          <div className="clients-stat-card-pro">
            <FontAwesomeIcon icon={faCheckCircle} className="clients-stat-icon-pro" />
            <div className="clients-stat-value-pro">{statistics.active}</div>
            <div className="clients-stat-label-pro">Active</div>
          </div>
          <div className="clients-stat-card-pro">
            <FontAwesomeIcon icon={faTimesCircle} className="clients-stat-icon-pro" />
            <div className="clients-stat-value-pro">{statistics.inactive}</div>
            <div className="clients-stat-label-pro">Inactive</div>
          </div>
          <div className="clients-stat-card-pro">
            <FontAwesomeIcon icon={faUser} className="clients-stat-icon-pro" />
            <div className="clients-stat-value-pro">{statistics.individual}</div>
            <div className="clients-stat-label-pro">Individual</div>
          </div>
          <div className="clients-stat-card-pro">
            <FontAwesomeIcon icon={faBuilding} className="clients-stat-icon-pro" />
            <div className="clients-stat-value-pro">{statistics.company}</div>
            <div className="clients-stat-label-pro">Company</div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="clients-loading-state-pro">
          <div className="clients-spinner-pro"></div>
          <p>Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="clients-empty-state-pro">
          <FontAwesomeIcon icon={faUsers} size="3x" className="clients-empty-icon-pro" />
          <h2>No clients found</h2>
          <p>Try adjusting your filters or add a new client.</p>
        </div>
      ) : (
        <div className="clients-cards-grid-pro">
          {filteredClients.map((client) => (
            <div key={client.id} className={`client-card-pro client-status-${client.status}`}>
              <div className="client-card-avatar-pro">
                <img src={client.avatar || 'https://via.placeholder.com/120?text=Avatar'} alt={client.name} />
              </div>
              <div className="client-card-content-pro">
                <div className="client-card-header-pro">
                  <h3 className="client-card-name-pro">{client.name}</h3>
                  <span className={`client-type-badge-pro ${client.type}`}>{client.type === 'individual' ? 'Individual' : 'Company'}</span>
                  <span className={`client-status-badge-pro ${client.status}`}>{client.status.charAt(0).toUpperCase() + client.status.slice(1)}</span>
                </div>
                <div className="client-card-details-pro">
                  <span><FontAwesomeIcon icon={faEnvelope} /> {client.email}</span>
                  <span><FontAwesomeIcon icon={faPhone} /> {client.phone}</span>
                  <span><FontAwesomeIcon icon={faMapMarkerAlt} /> {client.address}</span>
                </div>
                <div className="client-card-actions-pro">
                  <button className="client-action-btn-pro view" onClick={() => handleViewClient(client)}><FontAwesomeIcon icon={faEye} /> View</button>
                  <button className="client-action-btn-pro edit" onClick={() => handleEditClient(client)}><FontAwesomeIcon icon={faEdit} /> Edit</button>
                  <button className="client-action-btn-pro delete" onClick={() => handleDeleteClient(client.id)}><FontAwesomeIcon icon={faTrash} /> Delete</button>
                  <button className="client-action-btn-pro status" onClick={() => handleToggleClientStatus(client.id)}><FontAwesomeIcon icon={faToggleOn} /> {client.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showClientForm && (
        <ClientForm
          client={editingClient}
          onClose={() => {
            setShowClientForm(false);
            setEditingClient(null);
          }}
          onSubmit={handleAddClient}
        />
      )}
      {showClientDetails && selectedClient && (
        <ClientDetails
          client={selectedClient}
          onClose={() => {
            setShowClientDetails(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};

export default Clients;
