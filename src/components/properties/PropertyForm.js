import React, { useState } from 'react';
import { propertyService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDollarSign, faMapMarkerAlt, faImage, faTimes } from '@fortawesome/free-solid-svg-icons';
import './PropertyForm.css';
import { propertyTypes as sharedPropertyTypes } from '../../data/properties';
import { toast } from '../ui/Toaster';
import { users } from '../../data/users';

const propertyTypes = sharedPropertyTypes.includes('commercial') ? sharedPropertyTypes : [...sharedPropertyTypes, 'commercial'];
const propertyStatuses = ['available', 'booked', 'maintenance', 'sold'];

const PropertyForm = ({ onClose, onSubmit, property = null, isAdmin = false }) => {
  const [formData, setFormData] = useState(property || {
    title: '',
    description: '',
    price: '',
    location: '',
    property_type: 'HOUSE',
    is_available: true,
    image: null,
    previewImage: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // For admin: get all sellers
  const sellerOptions = isAdmin ? Object.values(users).filter(u => u.role === 'seller') : [];

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
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPEG, PNG, or WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }
    setImageError('');
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
    setFormData(prev => ({ ...prev, image: null, previewImage: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    console.log('Submitting property', formData); // <--- Add this line
    try {
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        property_type: formData.property_type,
        is_available: formData.is_available,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      const createdProperty = await propertyService.createProperty(propertyData);
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        await propertyService.uploadPropertyImage(createdProperty.id, imageFormData);
      }
      await onSubmit({
        ...createdProperty,
        image: formData.previewImage
      });
      setSuccessMessage('Property saved successfully!');
      toast.success('Property saved successfully!');
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to save property. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to save property. Please try again.');
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
            <button type="button" className="close-btn-pro" onClick={onClose}>
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
            {successMessage && (
              <div className="success-message-pro">
                <p>{successMessage}</p>
              </div>
            )}
            {/* Admin: Seller select dropdown */}
            {isAdmin && (
              <div className="form-row-pro">
                <div className="form-group-pro">
                  <label>Assign Seller *</label>
                  <select
                    name="sellerId"
                    value={formData.sellerId || ''}
                    onChange={e => setFormData(prev => ({ ...prev, sellerId: parseInt(e.target.value) }))}
                    required
                  >
                    <option value="">Select Seller</option>
                    {sellerOptions.map(seller => (
                      <option key={seller.id} value={seller.id}>{seller.name} ({seller.email})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="form-row-pro">
              <div className="form-group-pro">
                <label>Title *</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faHome} />
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                {errors.title && <span className="error-text-pro">{errors.title}</span>}
              </div>
              <div className="form-group-pro">
                <label>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} />
                {errors.description && <span className="error-text-pro">{errors.description}</span>}
              </div>
              <div className="form-group-pro">
                <label>Price ($) *</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faDollarSign} />
                  <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" required />
                </div>
                {errors.price && <span className="error-text-pro">{errors.price}</span>}
              </div>
            </div>
            <div className="form-row-pro">
              <div className="form-group-pro">
                <label>Location *</label>
                <div className="input-icon-pro">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required />
                </div>
                {errors.location && <span className="error-text-pro">{errors.location}</span>}
              </div>
              <div className="form-group-pro">
                <label>Property Type *</label>
                <select name="property_type" value={formData.property_type} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
                {errors.property_type && <span className="error-text-pro">{errors.property_type}</span>}
              </div>
              <div className="form-group-pro">
                <label>Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  {propertyStatuses.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
                {errors.status && <span className="error-text-pro">{errors.status}</span>}
              </div>
            </div>
            <div className="form-row-pro">
              <div className="form-group-pro">
                <label>Property Image *</label>
                <div className="image-upload-container-pro">
                  {!formData.previewImage ? (
                    <label className="upload-placeholder-pro">
                      <FontAwesomeIcon icon={faImage} size="2x" />
                      <span>Click to upload</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  ) : (
                    <div className="image-preview-pro">
                      <img src={formData.previewImage} alt="Preview" />
                      <button type="button" className="remove-image-btn-pro" onClick={handleRemoveImage}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}
                  {imageError && <span className="error-text-pro">{imageError}</span>}
                  {errors.image && <span className="error-text-pro">{errors.image}</span>}
                </div>
              </div>
            </div>
            <div className="form-actions-pro">
              <button type="submit" className="submit-btn-pro" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : property ? 'Save Changes' : 'Add Property'}</button>
              <button type="button" className="cancel-btn-pro" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
