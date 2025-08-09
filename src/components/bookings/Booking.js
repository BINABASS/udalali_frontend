import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const mockProperty = {
          id: propertyId,
          title: 'Modern Apartment with View',
          type: 'Apartment',
          beds: 2,
          baths: 2,
          size: '1200 sqft',
          location: 'Suburbs',
          price: 350000,
          image: 'https://via.placeholder.com/400x300',
          maxGuests: 4,
          availableDates: [
            { date: '2025-07-04', available: true },
            { date: '2025-07-05', available: true },
            { date: '2025-07-06', available: false },
            { date: '2025-07-07', available: true }
          ]
        };
        setProperty(mockProperty);
      } catch (err) {
        setError('Failed to load property details');
      }
    };

    const fetchBookings = async () => {
      try {
        const mockBookings = [
          {
            id: 1,
            buyerName: 'John Doe',
            checkIn: '2025-07-04',
            checkOut: '2025-07-06',
            guests: 2,
            status: 'confirmed'
          },
          {
            id: 2,
            buyerName: 'Jane Smith',
            checkIn: '2025-07-10',
            checkOut: '2025-07-15',
            guests: 4,
            status: 'pending'
          }
        ];
        setBookings(mockBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };

    if (propertyId) {
      fetchProperty();
      fetchBookings();
    } else {
      navigate('/properties');
    }
  }, [propertyId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        propertyId,
        checkIn,
        checkOut,
        guests,
      };

      // In a real app, this would be an API call
      console.log('Booking submitted:', bookingData);
      // Show success message
      alert('Booking successful!');
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!property) return <div>Loading...</div>;

  const totalNights = Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
  const totalCost = property.price * totalNights;

  return (
    <div className="booking-container">
      <h2>Book Property: {property.title}</h2>
      <div className="property-summary">
        <img src={property.image} alt={property.title} className="property-image" />
        <div className="property-details">
          <h3>{property.title}</h3>
          <p>Type: {property.type}</p>
          <p>Beds: {property.beds}</p>
          <p>Baths: {property.baths}</p>
          <p>Size: {property.size}</p>
          <p>Location: {property.location}</p>
          <p>Price: ${property.price.toLocaleString()}</p>
          <div className="property-actions">
            <button className="view-details-btn" onClick={() => window.location.href = `/properties/${property.id}`}>View Details</button>
            <button className="edit-btn">Edit</button>
            <button className="delete-btn">Delete</button>
          </div>
        </div>
      </div>

      <div className="existing-bookings">
        <h3>Existing Bookings for this Property</h3>
        {bookings.length > 0 ? (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-info">
                  <p>Booked by: {booking.buyerName}</p>
                  <p>Check-In: {new Date(booking.checkIn).toLocaleDateString()}</p>
                  <p>Check-Out: {new Date(booking.checkOut).toLocaleDateString()}</p>
                  <p>Guests: {booking.guests}</p>
                  <p>Status: {booking.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No existing bookings for this property.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="checkIn">Check-In Date:</label>
          <input
            type="date"
            id="checkIn"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="checkOut">Check-Out Date:</label>
          <input
            type="date"
            id="checkOut"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="guests">Number of Guests:</label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          >
            {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} guest{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <p>Total Nights: {totalNights}</p>
          <p>Total Cost: ${totalCost.toFixed(2)}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Booking...' : 'Book Now'}
        </button>
      </form>
    </div>
  );
};

export default Booking;
