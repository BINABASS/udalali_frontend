import React, { useState, useEffect, useMemo } from 'react';
import PropertyForm from './PropertyForm';
import PropertyDetails from './PropertyDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { propertyService } from '../../services/api';
import './Properties.css';
import { toast } from '../ui/Toaster';
import { useUser } from '../../context/UserContext';

const Properties = () => {
  // Helper function to get the full image URL with detailed logging
  const getImageUrl = (imagePath) => {
    try {
      if (!imagePath) {
        console.log('No image path provided, using default image');
        return '/default-property.jpg';
      }
      
      // If it's already a full URL (http/https) or data URL, add cache buster
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        // Add a timestamp to prevent caching
        const separator = imagePath.includes('?') ? '&' : '?';
        const urlWithCacheBuster = `${imagePath}${separator}t=${Date.now()}`;
        console.log('Returning full URL with cache buster:', urlWithCacheBuster);
        return urlWithCacheBuster;
      }
      
      // Handle relative paths
      const baseUrl = 'http://localhost:8000';
      let cleanPath = imagePath;
      
      // Remove any leading /media/ or media/ if present
      cleanPath = cleanPath.replace(/^\/?(media\/)?/, '');
      
      // Remove any leading slashes that might remain
      cleanPath = cleanPath.replace(/^\/+/, '');
      
      // Remove any URL parameters if present
      cleanPath = cleanPath.split('?')[0];
      
      const fullUrl = `${baseUrl}/media/${cleanPath}`;
      console.log('Constructed image URL:', { 
        original: imagePath, 
        cleanPath, 
        fullUrl,
        'isValid': !!cleanPath
      });
      
      if (!cleanPath) {
        console.warn('Empty clean path after processing, using default image');
        return '/default-property.jpg';
      }
      
      return fullUrl;
    } catch (error) {
      console.error('Error in getImageUrl:', error);
      return '/default-property.jpg';
    }
  };
  const { user, role } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = React.useCallback(async () => {
    try {
      console.log('Fetching properties...');
      const res = await propertyService.getAllProperties();
      console.log('Raw API response:', res);
      
      // Handle both paginated and non-paginated responses
      let propertiesList = res.data.results || res.data || [];
      
      // Add debug logging and ensure uploadError is set
      propertiesList = propertiesList.map(property => {
        console.group(`Property ${property.id}: ${property.title || 'Untitled'}`);
        console.log('Property data keys:', Object.keys(property));
        
        // Check for upload errors in the response
        const uploadError = property.upload_error || property.error || null;
        if (uploadError) {
          console.log('Found upload error:', uploadError);
          property.uploadError = uploadError;
        }
        
        // Check for images in different possible locations
        let images = [];
        
        // Check for images array
        if (Array.isArray(property.images) && property.images.length > 0) {
          console.log('Found images array with', property.images.length, 'images');
          images = property.images;
        } 
        // Check for single image field (common in some APIs)
        else if (property.image) {
          console.log('Found single image field');
          images = [{ image: property.image, is_primary: true }];
        }
        
        // Process images if any found
        if (images.length > 0) {
          console.log('Processing', images.length, 'images');
          property.images = images.map((img, idx) => {
            const imageData = {
              id: img.id || `img-${property.id}-${idx}`,
              image: img.image || img,
              is_primary: img.is_primary || idx === 0,
              uploadError: img.error || null
            };
            
            console.log(`Image ${idx}:`, {
              ...imageData,
              fullUrl: getImageUrl(imageData.image)
            });
            
            return imageData;
          });
          
          // Set first image as primary if none is marked as primary
          if (!property.images.some(img => img.is_primary) && property.images.length > 0) {
            property.images[0].is_primary = true;
          }
        } else {
          console.log('No images found in any expected location');
          property.images = [];
        }
        
        console.log('Final property data:', {
          id: property.id,
          title: property.title,
          imageCount: property.images?.length || 0,
          uploadError: property.uploadError || 'No errors'
        });
        
        console.groupEnd();
        return property;
      });
      
      setProperties(propertiesList);
      return propertiesList;
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
      setProperties([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const visibleProperties = useMemo(() => {
    if (!Array.isArray(properties)) {
      console.log('Properties is not an array:', properties);
      return [];
    }
    
    if (role === 'admin') {
      console.log('Admin: showing all properties');
      return properties;
    } else if (role === 'seller' && user) {
      console.log('Filtering properties for seller:', user.id);
      // Handle both cases where seller might be an object or just an ID
      const filtered = properties.filter(p => {
        if (!p) return false;
        const sellerId = typeof p.seller === 'object' ? p.seller?.id : p.seller;
        const matches = sellerId && user.id && String(sellerId) === String(user.id);
        console.log(`Property ${p.id} - Seller:`, p.seller, 'Matches:', matches);
        return matches;
      });
      console.log('Filtered properties:', filtered);
      return filtered;
    } else {
      console.log('Buyer or no user: showing all properties');
      return properties; // For buyers, show all properties
    }
  }, [properties, role, user]);

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm('Are you sure you want to delete this property?');
    if (confirmed) {
      try {
        await propertyService.deleteProperty(propertyId);
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        toast.success('Property deleted successfully!');
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  // Handle adding a new property - this is now handled by the PropertyForm's onSubmit

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (!Array.isArray(visibleProperties)) {
    return (
      <div className="error-container">
        <p>Error loading properties. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="properties-container-pro">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        {(role === 'admin' || role === 'seller') && (
          <button 
            className="add-button-pro" 
            onClick={() => {
              setEditingProperty(null);
              setShowForm(true);
            }}
          >
            Add New Property
          </button>
        )}
      </div>
      
      <div className="properties-grid-pro">
        {visibleProperties.length === 0 ? (
          <div className="no-properties">
            {role === 'seller' ? 
              'You have no properties listed yet. Click "Add New Property" to get started.' : 
              'No properties found.'}
          </div>
        ) : (
          visibleProperties.map((property) => (
            <div key={property.id} className="property-card-pro">
              <div className="property-image-pro" style={{ position: 'relative', minHeight: '200px', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                {(() => {
                  // Try to get the first valid image from different possible locations
                  let imageUrl = null;
                  
                  // Check for property.images array (handle both object with image property and direct URL)
                  if (Array.isArray(property.images) && property.images.length > 0) {
                    const firstImage = property.images[0];
                    console.log('First image data:', firstImage);
                    
                    // Handle different image object structures
                    if (typeof firstImage === 'string') {
                      imageUrl = firstImage;
                    } else if (firstImage && typeof firstImage === 'object') {
                      // Try different possible property names for the image URL
                      imageUrl = firstImage.image || firstImage.url || firstImage.original || firstImage.medium || firstImage.thumbnail || firstImage.small;
                    }
                    
                    console.log('Extracted image URL from images array:', imageUrl);
                  } 
                  // Check for direct image property (string URL)
                  else if (property.image) {
                    console.log('Using direct image property:', property.image);
                    imageUrl = property.image;
                  }
                  
                  // If we found an image URL, render it
                  if (imageUrl) {
                    const fullImageUrl = getImageUrl(imageUrl);
                    console.log(`Rendering image for property ${property.id}:`, fullImageUrl);
                    
                    return (
                      <div style={{ 
                        width: '100%', 
                        height: '200px', 
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img 
                          src={fullImageUrl}
                          alt={property.title || 'Property image'}
                          crossOrigin="anonymous"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                          onLoad={(e) => {
                            console.log('Image loaded successfully:', {
                              src: e.target.src,
                              naturalWidth: e.target.naturalWidth,
                              naturalHeight: e.target.naturalHeight
                            });
                          }}
                          onError={(e) => {
                            console.error('Error loading image:', {
                              src: e.target.src,
                              currentSrc: e.target.currentSrc,
                              complete: e.target.complete,
                              naturalWidth: e.target.naturalWidth,
                              naturalHeight: e.target.naturalHeight,
                              width: e.target.width,
                              height: e.target.height,
                              error: e.nativeEvent ? e.nativeEvent.type : 'No native event'
                            });
                            // Set a default image when error occurs
                            e.target.onerror = null;
                            e.target.src = '/default-property.jpg';
                            e.target.style.objectFit = 'cover';
                          }}
                          onLoad={(e) => {
                            console.log('Image loaded successfully:', {
                              src: e.target.src,
                              currentSrc: e.target.currentSrc,
                              complete: e.target.complete,
                              naturalWidth: e.target.naturalWidth,
                              naturalHeight: e.target.naturalHeight,
                              width: e.target.width,
                              height: e.target.height
                            });
                          }}
                          style={{ 
                            width: '100%', 
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#f5f5f5'
                          }}
                        />
                        <span className={`status-badge-pro ${property.is_available ? 'available' : 'unavailable'}`}>
                          {property.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    );
                  }
                  
                  // If no image was found, render the placeholder
                  return (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#e0e0e0',
                      color: '#666',
                      fontSize: '0.9rem'
                    }}>
                      No Image Available
                    </div>
                  );
                })()}
              </div>
              <div className="property-content-pro">
                <h3>{property.title}</h3>
                <div style={{ 
                  padding: '1rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  background: '#ffffff',
                  borderRadius: '0 0 8px 8px'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    margin: '0.5rem 0',
                    color: '#1a237e', // Darker blue for better contrast
                    fontWeight: '600',
                    lineHeight: '1.3'
                  }}>
                    {property.title || 'Property Title'}
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#636e72',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#636e72"/>
                      </svg>
                      {property.location || 'Location not specified'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    {property.property_type && (
                      <span style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {property.property_type}
                      </span>
                    )}
                    
                    <span style={{
                      background: property.is_available ? '#e8f5e9' : '#ffebee',
                      color: property.is_available ? '#1b5e20' : '#b71c1c', // Darker colors for better contrast
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600', // Bolder text
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      border: '1px solid ' + (property.is_available ? '#a5d6a7' : '#ef9a9a') // Subtle border
                    }}>
                      {property.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#7f8c8d',
                        marginBottom: '0.25rem'
                      }}>
                        Price
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '0.25rem',
                        lineHeight: '1'
                      }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#2c3e50'
                        }}>
                          TZS {property.price ? property.price.toLocaleString('en-US') : 'N/A'}
                        </span>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#7f8c8d',
                          marginBottom: '0.1rem'
                        }}>
                          /month
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="property-actions-pro" style={{ 
                  display: 'flex', 
                  gap: '8px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #eee'
                }}>
                  <button 
                    onClick={() => { 
                      setSelectedProperty(property); 
                      setShowDetails(true); 
                    }}
                    title="View Details"
                    style={{
                      background: '#4a6cf7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease',
                      ':hover': {
                        background: '#3a5ce4',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} style={{ fontSize: '0.9rem' }} />
                    <span>View</span>
                  </button>
                  
                  {(role === 'admin' || (role === 'seller' && property.seller === user?.id)) && (
                    <>
                      <button 
                        onClick={() => {
                          setEditingProperty(property);
                          setShowForm(true);
                        }}
                        title="Edit Property"
                        style={{
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease',
                          ':hover': {
                            background: '#5a6268',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.9rem' }} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(property.id)}
                        title="Delete Property"
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease',
                          ':hover': {
                            background: '#c82333',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} style={{ fontSize: '0.9rem' }} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <PropertyForm 
          onClose={() => setShowForm(false)} 
          property={editingProperty} 
          onSave={(savedProperty) => {
            if (editingProperty) {
              setProperties(prev => 
                prev.map(p => p.id === savedProperty.id ? savedProperty : p)
              );
            } else {
              setProperties(prev => [savedProperty, ...prev]);
            }
            setShowForm(false);
          }} 
        />
      )}

      {showDetails && selectedProperty && (
        <PropertyDetails 
          property={selectedProperty} 
          onClose={() => setShowDetails(false)} 
        />
      )}
    </div>
  );
};

export default Properties;