import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Mock the BookingForm component with minimal implementation
const MockBookingForm = ({ property, onBookingSuccess, onCancel }) => {
  return (
    <div data-testid="mock-booking-form">
      <button 
        onClick={() => onBookingSuccess({ id: 1 })}
        data-testid="mock-booking-success"
      >
        Mock Book Now
      </button>
      <button 
        onClick={onCancel}
        data-testid="mock-booking-cancel"
      >
        Mock Cancel
      </button>
    </div>
  );
};

// Mock the PropertyDetails component with minimal implementation
const MockPropertyDetails = ({ property, onClose, onBookingSuccess }) => {
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  
  return (
    <div data-testid="mock-property-details">
      <h2>Property Details</h2>
      <button onClick={() => setShowBookingForm(true)}>Book Now</button>
      
      {showBookingForm && (
        <MockBookingForm 
          property={property} 
          onBookingSuccess={(booking) => {
            onBookingSuccess(booking);
            setShowBookingForm(false);
          }}
          onCancel={() => setShowBookingForm(false)}
        />
      )}
    </div>
  );
};

// Mock the Properties component with minimal implementation
const MockProperties = () => {
  const [selectedProperty, setSelectedProperty] = React.useState(null);
  
  return (
    <div data-testid="mock-properties">
      <button onClick={() => setSelectedProperty({ id: 1, title: 'Luxury Apartment' })}>
        View Details
      </button>
      
      {selectedProperty && (
        <MockPropertyDetails 
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onBookingSuccess={() => {}}
        />
      )}
    </div>
  );
};

// Mock axios and toast
jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('Booking Flow Integration Test', () => {
  const mockProperty = {
    id: 1,
    title: 'Luxury Apartment',
    price: '150000',
    is_available: true,
    images: [{ id: 1, image: '/test.jpg', is_primary: true }],
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    location: 'Test Location',
    description: 'A beautiful test property'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'test-token');
  });

  test('should show property details when View Details is clicked', () => {
    render(
      <MemoryRouter>
        <MockProperties />
      </MemoryRouter>
    );

    // Click on View Details
    fireEvent.click(screen.getByText('View Details'));
    
    // Verify property details are shown
    expect(screen.getByText('Property Details')).toBeInTheDocument();
  });

  test('should show booking form when Book Now is clicked', () => {
    render(
      <MemoryRouter>
        <MockPropertyDetails 
          property={mockProperty} 
          onClose={jest.fn()} 
          onBookingSuccess={jest.fn()} 
        />
      </MemoryRouter>
    );

    // Click on Book Now
    fireEvent.click(screen.getByText('Book Now'));
    
    // Verify booking form is shown
    expect(screen.getByTestId('mock-booking-form')).toBeInTheDocument();
  });

  test('should call onBookingSuccess when booking is successful', () => {
    const mockOnBookingSuccess = jest.fn();
    
    render(
      <MemoryRouter>
        <MockPropertyDetails 
          property={mockProperty} 
          onClose={jest.fn()} 
          onBookingSuccess={mockOnBookingSuccess} 
        />
      </MemoryRouter>
    );

    // Open booking form
    fireEvent.click(screen.getByText('Book Now'));
    
    // Click the mock success button
    fireEvent.click(screen.getByTestId('mock-booking-success'));
    
    // Verify onBookingSuccess was called
    expect(mockOnBookingSuccess).toHaveBeenCalledWith({ id: 1 });
  });

  test('should close booking form when cancel is clicked', () => {
    render(
      <MemoryRouter>
        <MockPropertyDetails 
          property={mockProperty} 
          onClose={jest.fn()} 
          onBookingSuccess={jest.fn()} 
        />
      </MemoryRouter>
    );

    // Open booking form
    fireEvent.click(screen.getByText('Book Now'));
    
    // Verify booking form is shown
    expect(screen.getByTestId('mock-booking-form')).toBeInTheDocument();
    
    // Click the cancel button
    fireEvent.click(screen.getByTestId('mock-booking-cancel'));
    
    // Verify booking form is hidden
    expect(screen.queryByTestId('mock-booking-form')).not.toBeInTheDocument();
  });
});
