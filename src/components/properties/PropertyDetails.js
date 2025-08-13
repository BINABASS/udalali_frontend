import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import BookingForm from './BookingForm';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './PropertyDetails.css';
import '../ui/uiComponents.css';

const PropertyDetails = ({ property, onClose, onBookingSuccess }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { user } = useUser();
  // Format price with TZS and monthly rate
  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a365d' }}>
          TZS {new Intl.NumberFormat('en-US').format(price)}
        </span>
        <span style={{ 
          fontSize: '1rem', 
          color: '#718096',
          fontWeight: '500'
        }}>
          /month
        </span>
      </div>
    );
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  // Handle click on the modal content to prevent closing when clicking inside
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="property-details-modal" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '2rem',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={handleClose}
    >
      <div 
        className="property-details-content" 
        style={{
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 #f7fafc'
        }}
        onClick={handleContentClick}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
          aria-label="Close"
        >
          <FontAwesomeIcon 
            icon={faTimes} 
            style={{ 
              color: '#4a5568',
              fontSize: '1.25rem'
            }} 
          />
        </button>

        {/* Header */}
        <div style={{
          padding: '2rem 2rem 1.5rem',
          borderBottom: '1px solid #edf2f7',
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 5
        }}>
          <h1 style={{
            fontSize: '1.75rem',
            margin: 0,
            color: '#1a202c',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '0.5rem'
          }}>
            {property.title || 'Property Details'}
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: property.is_available ? '#e6fffa' : '#fff5f5',
              color: property.is_available ? '#2c7a7b' : '#c53030',
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: property.is_available ? '#38b2ac' : '#f56565'
              }}></div>
              {property.is_available ? 'Available' : 'Unavailable'}
            </div>
            
            {property.property_type && (
              <div style={{
                background: '#ebf8ff',
                color: '#2b6cb0',
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {property.property_type}
              </div>
            )}
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#4a5568',
              fontSize: '0.95rem',
              fontWeight: '500',
              marginLeft: 'auto'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#718096"/>
              </svg>
              {property.location || 'Location not specified'}
            </div>
          </div>
        </div>
        {/* Property Image Section */}
        <div style={{ padding: '0 2rem 1.5rem' }}>
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            aspectRatio: '16/9',
            maxHeight: '500px'
          }}>
            <img 
              src={property.images?.[0]?.image || property.image || '/default-property.jpg'} 
              alt={property.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '2rem',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h2 style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {property.title}
                  </h2>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#e2e8f0"/>
                    </svg>
                    <span style={{ 
                      fontSize: '1rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      {property.location || 'Location not specified'}
                    </span>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {formatPrice(property.price)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Description */}
        <div style={{ padding: '0 2rem 2rem' }}>
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            lineHeight: '1.7',
            color: '#4a5568',
            border: '1px solid #edf2f7'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#1a202c',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              About This Property
            </h3>
            <p style={{ margin: 0 }}>
              {property.description || 'No description available for this property.'}
            </p>
          </div>
        </div>

        {/* Property Features */}
        <div style={{ padding: '0 2rem 2rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            color: '#1a202c',
            margin: '0 0 1rem 0',
            fontWeight: '600'
          }}>
            Property Features
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {[
              { icon: '🛏️', label: 'Bedrooms', value: property.bedrooms || 'N/A' },
              { icon: '🚿', label: 'Bathrooms', value: property.bathrooms || 'N/A' },
              { icon: '📏', label: 'Area', value: property.area ? `${property.area} sqm` : 'N/A' },
              { icon: '🏢', label: 'Floors', value: property.floors || 'N/A' },
              { icon: '🚗', label: 'Parking', value: property.parking || 'N/A' },
              { icon: '🏊', label: 'Pool', value: property.has_pool ? 'Yes' : 'No' }
            ].map((feature, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '1.25rem',
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#ebf8ff',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3182ce'
                  }}>
                    {feature.icon}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#4a5568',
                    fontWeight: '500'
                  }}>
                    {feature.label}
                  </span>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a202c',
                  paddingLeft: 'calc(32px + 0.75rem)'
                }}>
                  {feature.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #edf2f7',
          background: '#fff',
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          zIndex: 5
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: 'white',
              color: '#4a5568',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                background: '#f7fafc',
                borderColor: '#cbd5e0'
              }
            }}
          >
            Close
          </button>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: '#3182ce',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                background: '#2c5282'
              }
            }}
          >
            Contact Agent
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBookingForm(!showBookingForm);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: '#38a169',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                background: '#2f855a'
              }
            }}
          >
            {showBookingForm ? 'Hide Booking Form' : 'Book Now'}
          </button>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              padding: '1.5rem'
            }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Book {property.title}
                </h2>
                <div className="flex gap-2">
                  {user?.id === property?.owner?.id && (
                    <Link
                      to={`/seller/properties/${property?.id}/bookings`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FontAwesomeIcon icon={faCalendarDays} className="mr-1.5 h-3.5 w-3.5" />
                      View Bookings
                    </Link>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBookingForm(false);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <BookingForm 
                property={property} 
                onBookingSuccess={(booking) => {
                  setShowBookingForm(false);
                  if (onBookingSuccess) {
                    onBookingSuccess(booking);
                  }
                  // Show success message
                  if (window.toast) {
                    window.toast.success('Booking request submitted successfully!');
                  }
                }}
                onCancel={() => setShowBookingForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add keyframes for the fadeIn animation
const fadeIn = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Create a style element for our keyframes
const styleElement = document.createElement('style');
styleElement.textContent = fadeIn;
document.head.appendChild(styleElement);

export default PropertyDetails;
