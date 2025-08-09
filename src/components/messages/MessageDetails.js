import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './Messages.css';

const MessageDetails = ({ message, onClose, onRead }) => {
  return (
    <div className="message-details-modal">
      <div className="message-details">
        <button
          className="close-btn"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="message-details-header">
          <h2>{message.subject}</h2>
          <div className="message-actions">
            {message.type === 'inbox' && !message.isRead && (
              <button
                className="action-btn read-btn"
                onClick={onRead}
              >
                <i className="fas fa-envelope-open"></i> Mark as Read
              </button>
            )}
            <button
              className="action-btn reply-btn"
              onClick={() => {
                // Implement reply functionality
              }}
            >
              <i className="fas fa-reply"></i> Reply
            </button>
          </div>
        </div>

        <div className="message-details-content">
          <div className="field">
            <label>Type:</label>
            <span>{message.type}</span>
          </div>
          <div className="field">
            <label>Date:</label>
            <span>{message.date}</span>
          </div>
          <div className="field">
            <label>From:</label>
            <span>{message.type === 'inbox' ? message.sender : message.receiver}</span>
          </div>
          <div className="field">
            <label>To:</label>
            <span>{message.type === 'inbox' ? message.receiver : message.sender}</span>
          </div>
        </div>

        <div className="message-details-content">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Message:</label>
            <div className="message-content">
              <p>{message.content}</p>
            </div>
          </div>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="message-details-attachments">
            <h3>Attachments</h3>
            <div className="attachments-grid">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <div className="attachment-icon">
                    <i className="fas fa-paperclip"></i>
                  </div>
                  <div className="attachment-info">
                    <span className="attachment-name">{attachment}</span>
                    <span className="attachment-size">{Math.floor(Math.random() * 5) + 1} MB</span>
                  </div>
                  <button className="action-btn download-btn">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDetails;
