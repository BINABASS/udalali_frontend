import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyDetails from '../PropertyDetails';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the BookingForm component
jest.mock('../BookingForm', () => {
  return function MockBookingForm({ property, onBookingSuccess, onCancel }) {
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
});

describe('PropertyDetails', () => {
  const mockProperty = {
    id: 1,
    title: 'Test Property',
    description: 'A beautiful test property',
    price: '100000',
    location: 'Test Location',
    property_type: 'APARTMENT',
    is_available: true,
    bedrooms: 2,
    bathrooms: 1.5,
    area: 100,
    images: [
      { id: 1, image: '/test-image.jpg', is_primary: true }
    ]
  };

  const mockOnClose = jest.fn();
  const mockOnBookingSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Router>
        <PropertyDetails 
          property={mockProperty} 
          onClose={mockOnClose} 
          onBookingSuccess={mockOnBookingSuccess} 
        />
      </Router>
    );
  };

  it('renders property details correctly', () => {
    renderComponent();
    
    expect(screen.getByText(mockProperty.title)).toBeInTheDocument();
    expect(screen.getByText(mockProperty.description)).toBeInTheDocument();
    expect(screen.getByText('TZS 100,000')).toBeInTheDocument();
    expect(screen.getByText(mockProperty.location)).toBeInTheDocument();
    expect(screen.getByText('Apartment')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('shows the booking form when Book Now is clicked', () => {
    renderComponent();
    
    // Click the Book Now button
    const bookButton = screen.getByRole('button', { name: /book now/i });
    fireEvent.click(bookButton);
    
    // Check if the booking form is shown
    expect(screen.getByTestId('mock-booking-form')).toBeInTheDocument();
  });

  it('hides the booking form when cancel is clicked', () => {
    renderComponent();
    
    // Show the booking form
    const bookButton = screen.getByRole('button', { name: /book now/i });
    fireEvent.click(bookButton);
    
    // Click the cancel button in the mock booking form
    const cancelButton = screen.getByTestId('mock-booking-cancel');
    fireEvent.click(cancelButton);
    
    // Check if the booking form is hidden
    expect(screen.queryByTestId('mock-booking-form')).not.toBeInTheDocument();
  });

  it('calls onBookingSuccess when booking is successful', () => {
    renderComponent();
    
    // Show the booking form
    const bookButton = screen.getByRole('button', { name: /book now/i });
    fireEvent.click(bookButton);
    
    // Click the mock success button in the booking form
    const successButton = screen.getByTestId('mock-booking-success');
    fireEvent.click(successButton);
    
    // Check if onBookingSuccess was called
    expect(mockOnBookingSuccess).toHaveBeenCalledWith({ id: 1 });
    
    // Check if the booking form is hidden after success
    expect(screen.queryByTestId('mock-booking-form')).not.toBeInTheDocument();
  });

  it('closes the modal when clicking outside', () => {
    renderComponent();
    
    // Find the modal overlay (the outermost div with onClick handler)
    const modalOverlay = screen.getByTestId('property-details-modal');
    fireEvent.click(modalOverlay);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close the modal when clicking inside the content', () => {
    renderComponent();
    
    // Find the modal content (the inner div that stops event propagation)
    const modalContent = screen.getByTestId('property-details-content');
    fireEvent.click(modalContent);
    
    // Check that onClose was not called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows a default image when no images are available', () => {
    const propertyWithoutImages = { ...mockProperty, images: [] };
    
    render(
      <Router>
        <PropertyDetails 
          property={propertyWithoutImages} 
          onClose={mockOnClose} 
          onBookingSuccess={mockOnBookingSuccess} 
        />
      </Router>
    );
    
    const image = screen.getByAltText(propertyWithoutImages.title);
    expect(image).toHaveAttribute('src', '/default-property.jpg');
  });
});
