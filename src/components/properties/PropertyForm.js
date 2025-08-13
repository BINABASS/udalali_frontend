import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faDollarSign, 
  faMapMarkerAlt, 
  faImage, 
  faTimes,
  faBed,
  faBath,
  faRulerCombined
} from '@fortawesome/free-solid-svg-icons';
import { toast } from '../ui/Toaster';
import './PropertyForm.css';

// Property types that match the backend's choices
const PROPERTY_TYPES = [
  'HOUSE',
  'APARTMENT',
  'CONDO',
  'LAND',
  'COMMERCIAL'
];

const PROPERTY_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'sold', label: 'Sold' }
];

const PropertyForm = ({ onClose, onSubmit, property = null, isAdmin = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    property_type: 'HOUSE',
    status: 'available',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
    image: null,
    previewImage: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Initialize form with property data if editing
  useEffect(() => {
    if (property) {
      setFormData(prev => ({
        ...prev,
        ...property,
        status: property.is_available ? 'available' : 'booked',
        previewImage: property.images?.[0]?.image || null,
        // Ensure numeric fields are strings to prevent controlled input warnings
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        area: property.area?.toString() || ''
      }));
    }
  }, [property]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Valid price is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.property_type) newErrors.property_type = 'Property type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === null ? '' : value // Ensure we never set null values
    }));
    setSubmitError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, or WebP images are allowed' }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    // Clear any previous errors
    setErrors(prev => ({ ...prev, image: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image: file,
        previewImage: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      image: null, 
      previewImage: null 
    }));
  };

  const uploadImageToProperty = async (propertyId, imageFile) => {
    if (!propertyId || !imageFile) return null;
    
    try {
      const formDataImg = new FormData();
      formDataImg.append('image', imageFile);
      formDataImg.append('is_primary', 'true');
      
      console.log('Uploading image for property:', propertyId);
      await propertyService.uploadPropertyImage(propertyId, formDataImg);
      
      // Refresh the property to get the updated image
      const { data: updatedProperty } = await propertyService.getProperty(propertyId);
      console.log('Image upload successful, updated property:', updatedProperty);
      return updatedProperty;
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      throw new Error('Failed to upload property image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser || !currentUser.id) {
        throw new Error('User not authenticated');
      }

      // Format the data to match backend expectations
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        property_type: formData.property_type,
        is_available: formData.status === 'available',
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        amenities: formData.amenities || [],
        seller_id: currentUser.id,
      };

      console.log('Sending property data:', propertyData);
      
      let result;
      if (property) {
        // Update existing property
        result = await propertyService.updateProperty(property.id, propertyData);
        
        // If there's a new image, upload it
        if (formData.image) {
          try {
            const updatedProperty = await uploadImageToProperty(property.id, formData.image);
            if (updatedProperty) {
              result = updatedProperty;
            }
          } catch (error) {
            // Log the error but don't fail the entire update
            console.error('Error updating property image:', error);
          }
        }
      } else {
        // Create new property
        result = await propertyService.createProperty(propertyData);
        
        // Upload image for new property if one was selected
        if (result?.id && formData.image) {
          try {
            const updatedProperty = await uploadImageToProperty(result.id, formData.image);
            if (updatedProperty) {
              result = updatedProperty;
            }
          } catch (error) {
            console.error('Error uploading property image:', error);
            // Continue with property creation even if image upload fails
          }
        }
      }

      // Only call onSubmit if it's a function
      if (typeof onSubmit === 'function') {
        await onSubmit({
          ...result,
          image: formData.previewImage || property?.images?.[0]?.image
        });
      }

      toast.success(property ? 'Property updated successfully!' : 'Property created successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error saving property:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          JSON.stringify(error.response?.data) ||
                          'Failed to save property. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="property-form-modal-pro">
      <div className="property-form-content-pro">
        <form onSubmit={handleSubmit} className="property-form-pro">
          <div className="form-header-pro">
            <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
            <button 
              type="button" 
              className="close-btn-pro" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="form-body-pro">
            {isSubmitting && (
              <div className="loading-overlay-pro">
                <div className="spinner-pro"></div>
                <p>Saving property...</p>
              </div>
            )}
            
            {submitError && (
              <div className="error-message-pro">
                <p>{submitError}</p>
              </div>
            )}

            <div className="form-row-pro">
              <div className="form-group-pro">
                <label>Title *</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faHome} />
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="Modern Apartment in Downtown" 
                    required 
                  />
                </div>
                {errors.title && <span className="error-text-pro">{errors.title}</span>}
              </div>
              
              <div className="form-group-pro">
                <label>Price ($) *</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faDollarSign} />
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    min="0" 
                    step="0.01" 
                    placeholder="250000" 
                    required 
                  />
                </div>
                {errors.price && <span className="error-text-pro">{errors.price}</span>}
              </div>
            </div>

            <div className="form-row-pro">
              <div className="form-group-pro">
                <label>Location *</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <input 
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder="123 Main St, City, Country" 
                    required 
                  />
                </div>
                {errors.location && <span className="error-text-pro">{errors.location}</span>}
              </div>
              
              <div className="form-group-pro">
                <label>Property Type *</label>
                <select 
                  name="property_type" 
                  value={formData.property_type} 
                  onChange={handleChange} 
                  required
                  className="select-input"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                {errors.property_type && <span className="error-text-pro">{errors.property_type}</span>}
              </div>
            </div>

            <div className="form-row-pro">
              <div className="form-group-pro">
                <label>Bedrooms</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faBed} />
                  <input 
                    type="number" 
                    name="bedrooms" 
                    value={formData.bedrooms} 
                    onChange={handleChange} 
                    min="0" 
                    placeholder="3" 
                  />
                </div>
              </div>
              
              <div className="form-group-pro">
                <label>Bathrooms</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faBath} />
                  <input 
                    type="number" 
                    name="bathrooms" 
                    value={formData.bathrooms} 
                    onChange={handleChange} 
                    min="0" 
                    step="0.5" 
                    placeholder="2.5" 
                  />
                </div>
              </div>
              
              <div className="form-group-pro">
                <label>Area (sq ft)</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faRulerCombined} />
                  <input 
                    type="number" 
                    name="area" 
                    value={formData.area} 
                    onChange={handleChange} 
                    min="0" 
                    placeholder="1500" 
                  />
                </div>
              </div>
            </div>

            <div className="form-group-pro">
              <label>Description *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Describe the property in detail..." 
                rows="4" 
                required 
              />
              {errors.description && <span className="error-text-pro">{errors.description}</span>}
            </div>

            <div className="form-row-pro">
              <div className="form-group-pro">
                <label>Status *</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  required
                  className="select-input"
                >
                  {PROPERTY_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group-pro">
                <label>Property Image {!property && '*'}</label>
                <div className="image-upload-container-pro">
                  {formData.previewImage ? (
                    <div className="image-preview-pro">
                      <img src={formData.previewImage} alt="Property preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn-pro" 
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder-pro">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        style={{ display: 'none' }} 
                        required={!property}
                        disabled={isSubmitting}
                      />
                      <FontAwesomeIcon icon={faImage} size="2x" />
                      <span>Click to upload image</span>
                      <small>Max 5MB (JPEG, PNG, WebP)</small>
                    </label>
                  )}
                  {errors.image && <span className="error-text-pro">{errors.image}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions-pro">
              <button 
                type="button" 
                className="cancel-btn-pro" 
                onClick={onClose} 
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn-pro" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (property ? 'Update Property' : 'Add Property')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;