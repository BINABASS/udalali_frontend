import React from 'react';
import './Favorites.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faTimes } from '@fortawesome/free-solid-svg-icons';

const favorites = [
  {
    id: 1,
    title: 'Luxury Apartment',
    location: 'Downtown Area',
    price: 450000,
    image: '/placeholder.jpg',
  },
  {
    id: 2,
    title: 'Family Home',
    location: 'Suburban Area',
    price: 320000,
    image: '/placeholder.jpg',
  },
];

const Favorites = () => {
  return (
    <div className="favorites-container glassy-buyer-section">
      <div className="favorites-header">
        <FontAwesomeIcon icon={faHeart} className="favorites-header-icon" />
        <h2>My Favorites</h2>
      </div>
      <div className="favorites-grid">
        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <FontAwesomeIcon icon={faHeart} size="3x" className="empty-favorites-icon" />
            <p>No favorites yet. Start adding properties you love!</p>
          </div>
        ) : (
          favorites.map((fav) => (
            <div className="favorite-item glassy-card" key={fav.id}>
              <div className="favorite-image">
                <img src={fav.image} alt={fav.title} />
                <button className="remove-favorite" title="Remove from favorites">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="favorite-details">
                <h3>{fav.title}</h3>
                <p className="location">{fav.location}</p>
                <p className="price">${fav.price.toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Favorites;
