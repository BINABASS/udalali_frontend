import React, { useState } from 'react';
import './Reports.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const ReportForm = ({ reportTypes, onGenerate, onClose }) => {
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    properties: [],
    clients: []
  });

  // Get report type name from ID
  const getReportTypeName = (typeId) => {
    const type = reportTypes.find(t => t.id === typeId);
    return type ? type.name : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.type) {
      alert('Please select a report type');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    // Prepare data for submission
    const reportData = {
      name: getReportTypeName(formData.type),
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      properties: formData.properties,
      clients: formData.clients
    };

    onGenerate(reportData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="report-form-modal-pro">
      <div className="report-form-content-pro">
        <button className="report-form-close-btn-pro" onClick={onClose} type="button" title="Close">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="report-form-header-pro">
          <FontAwesomeIcon icon={faFileAlt} className="report-form-header-icon-pro" />
          <div>
            <h2 className="report-form-title-pro">Generate Report</h2>
            <p className="report-form-subtitle-pro">Fill in the details below to generate a new report.</p>
          </div>
        </div>
        <hr className="report-form-divider-pro" />
        <form onSubmit={handleSubmit} className="report-form-pro">
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-select report-form-input-pro"
              required
            >
              <option value="">Select report type</option>
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date Range</label>
            <div className="date-range">
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="form-input report-form-input-pro"
                required
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="form-input report-form-input-pro"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Properties</label>
            <select
              name="properties"
              multiple
              className="form-select report-form-input-pro"
            >
              {/* Add property options here */}
              <option value="1">Modern Villa</option>
              <option value="2">Beach House</option>
              <option value="3">Mountain Cottage</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Clients</label>
            <select
              name="clients"
              multiple
              className="form-select report-form-input-pro"
            >
              {/* Add client options here */}
              <option value="1">John Smith</option>
              <option value="2">Jane Doe</option>
              <option value="3">Robert Johnson</option>
            </select>
          </div>

          <div className="report-form-actions-pro">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn report-form-submit-btn-pro">
              <FontAwesomeIcon icon={faFileAlt} /> Generate Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
