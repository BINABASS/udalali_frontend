import React from 'react';
import './SavedSearches.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlay, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const savedSearches = [
  {
    id: 1,
    name: 'Family Home Search',
    criteria: '3-4 bedrooms, $300k-$500k, Suburban area',
    lastRun: '2 days ago',
  },
  {
    id: 2,
    name: 'Investment Property',
    criteria: '2-3 bedrooms, $200k-$300k, City center',
    lastRun: '1 week ago',
  },
];

const SavedSearches = () => {
  return (
    <div className="saved-searches-container glassy-buyer-section">
      <div className="saved-searches-header">
        <FontAwesomeIcon icon={faSearch} className="saved-searches-header-icon" />
        <h2>Saved Searches</h2>
      </div>
      <div className="searches-list">
        {savedSearches.length === 0 ? (
          <div className="empty-saved-searches">
            <FontAwesomeIcon icon={faSearch} size="3x" className="empty-saved-searches-icon" />
            <p>No saved searches yet. Save your favorite search criteria for quick access!</p>
          </div>
        ) : (
          savedSearches.map((search) => (
            <div className="search-item glassy-card" key={search.id}>
              <div className="search-details">
                <h3>{search.name}</h3>
                <p>{search.criteria}</p>
                <p className="last-run">Last run: {search.lastRun}</p>
              </div>
              <div className="search-actions">
                <button className="run-search" title="Run Search">
                  <FontAwesomeIcon icon={faPlay} />
                </button>
                <button className="edit-search" title="Edit Search">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="delete-search" title="Delete Search">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
