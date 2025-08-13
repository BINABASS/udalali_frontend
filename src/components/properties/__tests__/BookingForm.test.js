import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingForm from '../BookingForm';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

// Mock the toast notification
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('BookingForm', () => {
  const mockProperty = {
    id: 1,
    title: 'Test Property',
    price: '100000',
    is_available: true
  };

  const mockOnBookingSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the Date object to always return a specific date
    const mockDate = new Date('2025-08-15T00:00:00Z');
    global.Date = jest.fn(() => mockDate);
    global.Date.now = jest.fn(() => mockDate.valueOf());
  });

  it('renders the booking form with property details', () => {
    render(
      <BookingForm 
        property={mockProperty} 
        onBookingSuccess={mockOnBookingSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Book This Property')).toBeInTheDocument();
    expect(screen.getByLabelText('Check-in Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Check-out Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Additional Notes (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('disables the Book Now button when dates are not selected', () => {
    render(
      <BookingForm 
        property={mockProperty} 
        onBookingSuccess={mockOnBookingSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    const bookButton = screen.getByRole('button', { name: 'Book Now' });
    expect(bookButton).toBeDisabled();
  });

  it('enables the Book Now button when dates are selected', () => {
    render(
      <BookingForm 
        property={mockProperty} 
        onBookingSuccess={mockOnBookingSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    // Select dates
    const startDateInput = screen.getByLabelText('Check-in Date');
    const endDateInput = screen.getByLabelText('Check-out Date');
    
    fireEvent.change(startDateInput, { target: { value: '2025-09-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-09-03' } });

    const bookButton = screen.getByRole('button', { name: 'Book Now' });
    expect(bookButton).not.toBeDisabled();
  });

  it('calculates the total price correctly', () => {
    render(
      <BookingForm 
        property={mockProperty} 
        onBookingSuccess={mockOnBookingSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    // Select dates (2 nights)
    const startDateInput = screen.getByLabelText('Check-in Date');
    const endDateInput = screen.getByLabelText('Check-out Date');
    
    fireEvent.change(startDateInput, { target: { value: '2025-09-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-09-03' } });

    // 2 nights * 100,000 TZS = 200,000 TZS
    expect(screen.getByText('TZS 200,000')).toBeInTheDocument();
  });

  it('submits the booking form successfully', async () => {
    // Mock successful API response
    axios.post.mockResolvedValueOnce({
      data: {
        id: 1,
        property: mockProperty.id,
        start_date: '2025-09-01',
        end_date: '2025-09-03',
        status: 'PENDING',
        total_price: '200000.00',
        notes: 'Test booking'
      }
    });

    render(
      <BookingForm 
        property={mockProperty} 
        onBookingSuccess={mockOnBookingSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill out the form
    const startDateInput = screen.getByLabelText('Check-in Date');
    const endDateInput = screen.getByLabelText('Check-out Date');
    const notesInput = screen.getByLabelText('Additional Notes (Optional)');
    
    fireEvent.change(startDateInput, { target: { value: '2025-09-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-09-03' } });
    fireEvent.change(notesInput, { target: { value: 'Test booking' } });

    // Submit the form
    const bookButton = screen.getByRole('button', { name: 'Book Now' });
    fireEvent.click(bookButton);

    // Check if loading state is shown
    expect(bookButton).toHaveTextContent('Processing...');

    // Wait for the API call to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/bookings/'),
        {
          property: mockProperty.id,
          start_date: '2025-09-01',
          end_date: '2025-09-03',
          total_price: 200000,
          notes: 'Test booking'
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer ')
          })
        })
      );

      // Verify success callback was called
      expect(mockOnBookingSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock failed API response
    const errorMessage = 'Booking failed';
    axios.post.mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    });

    render(
      <BookingForm 
        property={mockProperty} 
        onBookingSuccess={mockOnBookingSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill out and submit the form
    const startDateInput = screen.getByLabelText('Check-in Date');
    const endDateInput = screen.getByLabelText('Check-out Date');
    
    fireEvent.change(startDateInput, { target: { value: '2025-09-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-09-03' } });

    const bookButton = screen.getByRole('button', { name: 'Book Now' });
    fireEvent.click(bookButton);

    // Wait for the error handling
    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(bookButton).not.toBeDisabled();
    });
  });

  it('disables dates that are already booked', async () => {
    // Mock the API to return some booked dates
    const mockBookedDates = [
      { start_date: '2025-09-10', end_date: '2025-09-12' },
      { start_date: '2025-09-15', end_date: '2025-09-18' }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockBookedDates });

    render(
      <BookingForm 
        property={mockProperty} 
        onBookingSuccess={mockOnBookingSuccess} 
        onCancel={mockOnCancel} 
      />
    );

    // Wait for the API call to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/bookings/'),
        expect.objectContaining({
          params: {
            property: mockProperty.id,
            status: 'CONFIRMED'
          },
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer ')
          })
        })
      );
    });

    // The actual date picker interaction testing would require more complex setup
    // This is a simplified check to verify the API was called correctly
  });
});
