import React, { useState } from 'react';
import './Clients.css';

const ClientForm = ({ client, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    type: client?.type || 'individual',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    company: client?.company || '',
    status: client?.status || 'active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, client ? 'edit' : 'add');
    onClose();
  };

  return (
    <div className="client-form-modal">
      <div className="client-form">
        <h2>{client ? 'Edit Client' : 'Add New Client'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {formData.type === 'company' && (
            <div className="form-group">
              <label htmlFor="company">Company Name:</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="action-btn cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="action-btn submit-btn"
            >
              {client ? 'Update' : 'Add'} Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
