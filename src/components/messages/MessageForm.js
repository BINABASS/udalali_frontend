import React, { useState, useEffect } from 'react';
import './Messages.css';
import { users as staticUsers } from '../../data/users';
import { properties as staticProperties } from '../../data/properties';

const MessageForm = ({ message, onClose, onSubmit, currentUser }) => {
  const [formData, setFormData] = useState({
    subject: message?.subject || '',
    type: message?.type || 'inbox',
    content: message?.content || '',
    attachments: message?.attachments || [],
    receiver: message?.receiver || '',
    propertyId: message?.propertyId || ''
  });
  const [allUsers, setAllUsers] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [sellerProperties, setSellerProperties] = useState([]);

  useEffect(() => {
    // Load all users (static + registered)
    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    } catch (e) { registeredUsers = []; }
    const staticUserList = Object.values(staticUsers);
    const all = [...staticUserList, ...registeredUsers];
    setAllUsers(all.filter(u => u.email !== currentUser.email));
    // Load all properties (static + localStorage)
    let localProps = [];
    try {
      localProps = JSON.parse(localStorage.getItem('properties')) || [];
    } catch (e) { localProps = []; }
    setAllProperties([...staticProperties, ...localProps]);
  }, [currentUser]);

  useEffect(() => {
    // If receiver is a seller, show their properties
    const receiverUser = allUsers.find(u => u.email === formData.receiver);
    if (receiverUser && receiverUser.role === 'seller') {
      setSellerProperties(allProperties.filter(p => p.seller && p.seller.email === receiverUser.email));
    } else {
      setSellerProperties([]);
    }
  }, [formData.receiver, allUsers, allProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      sender: currentUser.email,
      propertyId: formData.propertyId || undefined
    }, message ? 'edit' : 'send');
    onClose();
  };

  return (
    <div className="message-form-modal">
      <div className="message-form">
        <h2>{message ? 'Edit Message' : 'New Message'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="receiver">To:</label>
            <select
              id="receiver"
              name="receiver"
              value={formData.receiver}
              onChange={handleChange}
              required
            >
              <option value="">Select receiver</option>
              {allUsers.map(u => (
                <option key={u.email} value={u.email}>{u.name} ({u.role}) - {u.email}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
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
              <option value="inbox">Inbox</option>
              <option value="sent">Sent</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          {/* Property reference for Seller-to-Seller or if receiver is seller */}
          {((currentUser.role === 'seller' && allUsers.find(u => u.email === formData.receiver && u.role === 'seller')) || (formData.propertyId && sellerProperties.length > 0)) && (
            <div className="form-group">
              <label htmlFor="propertyId">Property Reference (optional):</label>
              <select
                id="propertyId"
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
              >
                <option value="">Select property</option>
                {sellerProperties.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="content">Message:</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Type your message here..."
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="attachments">Attachments:</label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setFormData(prev => ({
                  ...prev,
                  attachments: [...prev.attachments, ...files.map(file => file.name)]
                }));
              }}
            />
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
              {message ? 'Update' : 'Send'} Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageForm;
