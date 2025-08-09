import React, { useState, useEffect, useMemo } from 'react';
import MessageForm from './MessageForm';
import MessageDetails from './MessageDetails';
import './Messages.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faInbox, faPaperPlane, faFileAlt, faSearch, faEye, faReply, faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../context/UserContext';

const MESSAGE_TYPES = {
  ALL: 'all',
  INBOX: 'inbox',
  SENT: 'sent',
  DRAFT: 'draft'
};

const Messages = () => {
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(MESSAGE_TYPES.INBOX);

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = JSON.parse(localStorage.getItem('messages')) || [
      {
        id: 1,
        type: 'inbox',
        subject: 'Property Inquiry - Modern Villa',
        sender: 'john@example.com',
        receiver: 'admin@example.com',
        content: 'Hi, I am interested in the Modern Villa property. Could you provide more details about its availability and pricing?',
        date: '2025-07-03',
        isRead: false,
        attachments: ['house.jpg', 'location-map.pdf']
      },
      {
        id: 2,
        type: 'sent',
        subject: 'Property Details - Modern Villa',
        sender: 'admin@example.com',
        receiver: 'john@example.com',
        content: 'Dear John, thank you for your interest. The Modern Villa is currently available and priced at $500,000. Please find attached the property details and location map.',
        date: '2025-07-03',
        isRead: true,
        attachments: ['property-details.pdf', 'price-list.pdf']
      }
    ];

    setMessages(savedMessages);
    setIsLoading(false);
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      total: messages.length,
      unread: messages.filter(m => !m.isRead).length,
      inbox: messages.filter(m => m.type === 'inbox').length,
      sent: messages.filter(m => m.type === 'sent').length,
      draft: messages.filter(m => m.type === 'draft').length
    };
  }, [messages]);

  // Filter messages based on selected type and search, and user context
  const filteredMessages = useMemo(() => {
    let filtered = [...messages];
    if (selectedType === MESSAGE_TYPES.INBOX) {
      filtered = filtered.filter(message => message.receiver === user.email);
    } else if (selectedType === MESSAGE_TYPES.SENT) {
      filtered = filtered.filter(message => message.sender === user.email);
    } else if (selectedType === MESSAGE_TYPES.DRAFT) {
      filtered = filtered.filter(message => message.type === 'draft' && message.sender === user.email);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(message => 
        message.subject.toLowerCase().includes(query) ||
        message.sender.toLowerCase().includes(query) ||
        message.receiver.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [messages, selectedType, searchQuery, user]);

  // Handlers
  const handleMessageAction = (formData, action) => {
    if (action === 'send') {
      const newMessage = {
        ...formData,
        id: Date.now(),
        isRead: false,
        date: new Date().toISOString().split('T')[0]
      };
      setMessages([...messages, newMessage]);
      localStorage.setItem('messages', JSON.stringify([...messages, newMessage]));
    } else if (action === 'edit') {
      const updatedMessages = messages.map(message => 
        message.id === editingMessage.id ? { ...message, ...formData } : message
      );
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const updatedMessages = messages.filter(message => message.id !== messageId);
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
    }
  };

  const handleViewDetails = (message) => {
    setSelectedMessage(message);
    setShowDetails(true);
  };

  const handleEditMessage = (message) => {
    // For reply: pre-fill receiver as original sender, subject as 'Re: ...', and propertyId if present
    setEditingMessage({
      ...message,
      receiver: message.sender,
      subject: message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`,
      propertyId: message.propertyId || ''
    });
    setShowForm(true);
  };

  const markAsRead = (messageId) => {
    const updatedMessages = messages.map(message => 
      message.id === messageId ? { ...message, isRead: true } : message
    );
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  return (
    <div className="messages-page-pro">
      <div className="messages-header-pro">
        <div className="messages-header-title-pro">
          <FontAwesomeIcon icon={faEnvelope} className="messages-header-icon-pro" />
          <h1>Messages</h1>
        </div>
        <div className="messages-header-actions-pro">
          <div className="messages-type-filters-pro">
            {Object.entries(MESSAGE_TYPES).map(([key, value]) => (
              <button
                key={key}
                className={`messages-type-pill-pro ${selectedType === value ? 'active' : ''}`}
                onClick={() => setSelectedType(value)}
                data-status={key}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="messages-search-bar-pro">
            <FontAwesomeIcon icon={faSearch} className="messages-search-icon-pro" />
            <input
              type="text"
              className="messages-search-input-pro"
              placeholder="Search by subject, sender, or receiver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="messages-statistics-pro">
          <div className="messages-stat-card-pro">
            <FontAwesomeIcon icon={faEnvelope} className="messages-stat-icon-pro" />
            <div className="messages-stat-value-pro">{statistics.total}</div>
            <div className="messages-stat-label-pro">Total</div>
          </div>
          <div className="messages-stat-card-pro">
            <FontAwesomeIcon icon={faCheckCircle} className="messages-stat-icon-pro" />
            <div className="messages-stat-value-pro">{statistics.unread}</div>
            <div className="messages-stat-label-pro">Unread</div>
          </div>
          <div className="messages-stat-card-pro">
            <FontAwesomeIcon icon={faInbox} className="messages-stat-icon-pro" />
            <div className="messages-stat-value-pro">{statistics.inbox}</div>
            <div className="messages-stat-label-pro">Inbox</div>
          </div>
          <div className="messages-stat-card-pro">
            <FontAwesomeIcon icon={faPaperPlane} className="messages-stat-icon-pro" />
            <div className="messages-stat-value-pro">{statistics.sent}</div>
            <div className="messages-stat-label-pro">Sent</div>
          </div>
          <div className="messages-stat-card-pro">
            <FontAwesomeIcon icon={faFileAlt} className="messages-stat-icon-pro" />
            <div className="messages-stat-value-pro">{statistics.draft}</div>
            <div className="messages-stat-label-pro">Draft</div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="messages-loading-state-pro">
          <div className="messages-spinner-pro"></div>
          <p>Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="messages-empty-state-pro">
          <FontAwesomeIcon icon={faEnvelope} size="3x" className="messages-empty-icon-pro" />
          <h2>No messages found</h2>
          <p>Try adjusting your filters or send a new message.</p>
        </div>
      ) : (
        <div className="messages-cards-grid-pro">
          {filteredMessages.map((message) => (
            <div key={message.id} className={`message-card-pro message-type-${message.type} ${!message.isRead ? 'unread' : ''}`}>
              <div className="message-card-content-pro">
                <div className="message-card-header-pro">
                  <h3 className="message-card-subject-pro">{message.subject}</h3>
                  <span className={`message-type-badge-pro ${message.type}`}>{message.type.charAt(0).toUpperCase() + message.type.slice(1)}</span>
                  {!message.isRead && <span className="message-status-badge-pro unread">Unread</span>}
                </div>
                <div className="message-card-details-pro">
                  <span><FontAwesomeIcon icon={faInbox} /> {message.type === 'inbox' ? message.sender : message.receiver}</span>
                  <span><FontAwesomeIcon icon={faFileAlt} /> {message.date}</span>
                </div>
                <div className="message-card-actions-pro">
                  <button className="message-action-btn-pro view" onClick={() => handleViewDetails(message)}><FontAwesomeIcon icon={faEye} /> View</button>
                  <button className="message-action-btn-pro reply" onClick={() => handleEditMessage(message)}><FontAwesomeIcon icon={faReply} /> Reply</button>
                  <button className="message-action-btn-pro delete" onClick={() => handleDeleteMessage(message.id)}><FontAwesomeIcon icon={faTrash} /> Delete</button>
                  {!message.isRead && <button className="message-action-btn-pro mark-read" onClick={() => markAsRead(message.id)}><FontAwesomeIcon icon={faCheckCircle} /> Mark as Read</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <MessageForm
          message={editingMessage}
          onClose={() => {
            setShowForm(false);
            setEditingMessage(null);
          }}
          onSubmit={handleMessageAction}
          currentUser={user}
        />
      )}
      {showDetails && selectedMessage && (
        <MessageDetails
          message={selectedMessage}
          onClose={() => {
            setShowDetails(false);
            setSelectedMessage(null);
          }}
        />
      )}
    </div>
  );
};

export default Messages;
