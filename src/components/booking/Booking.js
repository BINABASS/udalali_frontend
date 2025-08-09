import React, { useState, useMemo, useEffect } from 'react';
import PropertyForm from '../properties/PropertyForm';
import PropertyDetails from '../properties/PropertyDetails';
import './Booking.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faSearch, faMapMarkerAlt, faUser, faClock, faEdit, faTrash, faEye, faCheck, faHome } from '@fortawesome/free-solid-svg-icons';

const BOOKING_STATUSES = {
  ALL: 'all',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  OVERDUE: 'overdue'
};

const Booking = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProperties = JSON.parse(localStorage.getItem('properties')) || [
      {
        id: 1,
        title: 'Luxury Villa Booking',
        type: 'Villa',
        status: 'Booked',
        bookingDate: '2025-08-01',
        clientName: 'John Smith',
        duration: 12,
        price: 750000,
        location: 'Downtown',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Modern Apartment Booking',
        type: 'Apartment',
        status: 'Upcoming',
        bookingDate: '2025-09-15',
        clientName: 'Tech Solutions Inc.',
        duration: 6,
        price: 350000,
        location: 'Suburbs',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    ];
    setProperties(savedProperties);
    setIsLoading(false);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(BOOKING_STATUSES.ALL);

  // Calculate statistics
  const statistics = useMemo(() => {
    const today = new Date();
    return {
      total: properties.length,
      upcoming: properties.filter(p => new Date(p.bookingDate) > today).length,
      completed: properties.filter(p => {
        const endDate = new Date(p.bookingDate);
        endDate.setMonth(endDate.getMonth() + p.duration);
        return endDate < today;
      }).length,
      overdue: properties.filter(p => {
        const bookingDate = new Date(p.bookingDate);
        const endDate = new Date(bookingDate);
        endDate.setMonth(endDate.getMonth() + p.duration);
        return bookingDate < today && endDate > today;
      }).length,
      villas: properties.filter(p => p.type === 'Villa').length,
      apartments: properties.filter(p => p.type === 'Apartment').length
    };
  }, [properties]);

  // Filter properties based on selected status and date range
  const filteredProperties = useMemo(() => {
    let filtered = [...properties];
    
    // Apply status filter
    if (selectedStatus !== BOOKING_STATUSES.ALL) {
      const today = new Date();
      filtered = filtered.filter(property => {
        const bookingDate = new Date(property.bookingDate);
        const endDate = new Date(bookingDate);
        endDate.setMonth(endDate.getMonth() + property.duration);
        
        switch (selectedStatus) {
          case BOOKING_STATUSES.UPCOMING:
            return bookingDate > today;
          case BOOKING_STATUSES.COMPLETED:
            return endDate < today;
          case BOOKING_STATUSES.OVERDUE:
            return bookingDate < today && endDate > today;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.clientName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [properties, selectedStatus, searchQuery]);

  // Handle booking actions
  const handleExtendBooking = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      // Update property duration
      property.duration += 1; // Extend by 1 month
      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, duration: property.duration } : p
      ));
    }
  };

  const handleMarkComplete = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      // Update property status
      property.status = 'Completed';
      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, status: 'Completed' } : p
      ));
    }
  };

  // Sort properties by booking date (newest first)
  const sortedProperties = useMemo(() => {
    return [...filteredProperties].sort((a, b) => {
      const dateA = new Date(a.bookingDate || '2023-01-01');
      const dateB = new Date(b.bookingDate || '2023-01-01');
      return dateB - dateA;
    });
  }, [filteredProperties]);

  const handlePropertyAction = (property, action) => {
    switch (action) {
      case 'edit':
        setEditingProperty(property);
        setShowForm(true);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${property.title}?`)) {
          const updatedProperties = properties.filter(p => p.id !== property.id);
          setProperties(updatedProperties);
        }
        break;
      case 'mark-complete':
        handleMarkComplete(property.id);
        break;
      case 'extend':
        handleExtendBooking(property.id);
        break;
      default:
        break;
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setShowDetails(true);
  };

  return (
    <>
      <div className="booking-page-pro">
        <div className="booking-header-pro">
          <div className="booking-header-title-pro">
            <FontAwesomeIcon icon={faCalendarAlt} className="booking-header-icon-pro" />
            <h1>Bookings</h1>
          </div>
          <div className="booking-header-actions-pro">
            <div className="booking-status-filters-pro">
              {Object.entries(BOOKING_STATUSES).map(([key, value]) => (
                <button
                  key={key}
                  className={`booking-status-pill-pro ${selectedStatus === value ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(value)}
                  data-status={key}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
            <div className="booking-search-bar-pro">
              <FontAwesomeIcon icon={faSearch} className="booking-search-icon-pro" />
              <input
                type="text"
                className="booking-search-input-pro"
                placeholder="Search by title, location, or client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="booking-statistics-pro">
            {Object.entries(statistics).map(([key, value]) => (
              <div key={key} className="booking-stat-card-pro">
                <div className="booking-stat-icon-pro">
                  {key === 'total' && <FontAwesomeIcon icon={faCalendarAlt} />}
                  {key === 'upcoming' && <FontAwesomeIcon icon={faClock} />}
                  {key === 'completed' && <FontAwesomeIcon icon={faCheck} />}
                  {key === 'overdue' && <FontAwesomeIcon icon={faClock} />}
                  {key === 'villas' && <FontAwesomeIcon icon={faHome} />}
                  {key === 'apartments' && <FontAwesomeIcon icon={faHome} />}
                </div>
                <div className="booking-stat-value-pro">{value}</div>
                <div className="booking-stat-label-pro">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              </div>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="booking-loading-state-pro">
            <div className="booking-spinner-pro"></div>
            <p>Loading bookings...</p>
          </div>
        ) : sortedProperties.length === 0 ? (
          <div className="booking-empty-state-pro">
            <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="booking-empty-icon-pro" />
            <h2>No bookings found</h2>
            <p>Try adjusting your filters or add a new booking.</p>
          </div>
        ) : (
          <div className="booking-cards-grid-pro">
            {sortedProperties.map((property) => (
              <div key={property.id} className={`booking-card-pro booking-status-${property.status.toLowerCase()}`}>
                <div className="booking-card-image-pro">
                  <img src={property.image || 'https://via.placeholder.com/200x140?text=No+Image'} alt={property.title} />
                  <span className={`booking-status-badge-pro booking-status-${property.status.toLowerCase()}`}>{property.status}</span>
                </div>
                <div className="booking-card-content-pro">
                  <h2 className="booking-card-title-pro">{property.title}</h2>
                  <div className="booking-card-info-pro">
                    <span><FontAwesomeIcon icon={faMapMarkerAlt} /> {property.location}</span>
                    <span><FontAwesomeIcon icon={faUser} /> {property.clientName}</span>
                    <span><FontAwesomeIcon icon={faClock} /> {property.bookingDate}</span>
                    <span><FontAwesomeIcon icon={faClock} /> {property.duration} months</span>
                  </div>
                  <div className="booking-card-actions-pro">
                    <button className="booking-action-btn-pro view" onClick={() => handleViewDetails(property)}><FontAwesomeIcon icon={faEye} /> View</button>
                    <button className="booking-action-btn-pro edit" onClick={() => handlePropertyAction(property, 'edit')}><FontAwesomeIcon icon={faEdit} /> Edit</button>
                    <button className="booking-action-btn-pro delete" onClick={() => handlePropertyAction(property, 'delete')}><FontAwesomeIcon icon={faTrash} /> Delete</button>
                    <button className="booking-action-btn-pro extend" onClick={() => handlePropertyAction(property, 'extend')}><FontAwesomeIcon icon={faClock} /> Extend</button>
                    <button className="booking-action-btn-pro complete" onClick={() => handlePropertyAction(property, 'mark-complete')}><FontAwesomeIcon icon={faCheck} /> Mark Complete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showForm && (
        <PropertyForm
          property={editingProperty}
          onClose={() => {
            setShowForm(false);
            setEditingProperty(null);
          }}
          onSubmit={handlePropertyAction}
        />
      )}
      {showDetails && selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => {
            setShowDetails(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </>
  );
};

export default Booking;
