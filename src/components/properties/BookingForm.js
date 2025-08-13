import React, { useState, useEffect } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB';
import { bookingService } from '../../services/api';

const BookingForm = ({ property, onBookingSuccess, onCancel }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingDates, setBookingDates] = useState([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // Register the locale for date-fns
  registerLocale('en-GB', enGB);

  // Fetch already booked dates for this property
  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!property?.id) return;
      
      setIsLoadingDates(true);
      try {
        const response = await bookingService.getBookings({
          property: property.id,
          status: 'CONFIRMED'
        });
        
        // Ensure response.data is an array before processing
        const bookings = Array.isArray(response.data) ? response.data : [];
        
        // Collect all booked date ranges
        const dates = [];
        bookings.forEach(booking => {
          if (booking && booking.start_date && booking.end_date) {
            let currentDate = new Date(booking.start_date);
            const endDate = new Date(booking.end_date);
            
            // Ensure dates are valid
            if (!isNaN(currentDate.getTime()) && !isNaN(endDate.getTime())) {
              while (currentDate <= endDate) {
                dates.push(format(currentDate, 'yyyy-MM-dd'));
                currentDate = addDays(currentDate, 1);
              }
            }
          }
        });
        
        setBookingDates(dates);
      } catch (error) {
        console.error('Error fetching booked dates:', error);
        toast.error('Failed to load booking availability');
      } finally {
        setIsLoadingDates(false);
      }
    };
    
    fetchBookedDates();
  }, [property?.id]);

  // Calculate total price when dates change
  useEffect(() => {
    if (startDate && endDate && property?.price) {
      const days = differenceInDays(endDate, startDate) + 1;
      setTotalPrice(days * parseFloat(property.price));
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, property?.price]);

  const isDateDisabled = (date) => {
    if (!date) return true;
    
    // Create today's date at midnight in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a copy of the input date at midnight for accurate comparison
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    // Format the date for comparison with booked dates
    const dateStr = format(dateToCheck, 'yyyy-MM-dd');
    
    // Check if date is in the past or already booked
    const isPastDate = dateToCheck < today;
    const isBooked = bookingDates.includes(dateStr);
    
    return isPastDate || isBooked;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      toast.error('Please log in to book a property');
      return;
    }
    
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    // Check if the selected dates are available
    const selectedStart = format(startDate, 'yyyy-MM-dd');
    const selectedEnd = format(endDate, 'yyyy-MM-dd');
    
    // Check if any of the selected dates are already booked
    const isDateRangeAvailable = !Array.from(
      { length: differenceInDays(endDate, startDate) + 1 },
      (_, i) => format(addDays(startDate, i), 'yyyy-MM-dd')
    ).some(date => bookingDates.includes(date));
    
    if (!isDateRangeAvailable) {
      toast.error('Selected dates are not available. Please choose different dates.');
      return;
    }
    
    // Prevent users from booking their own property
    if (currentUser.id === property.owner?.id) {
      toast.error('You cannot book your own property');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await bookingService.createBooking({
        property: property.id,
        user: currentUser.id, // Associate the booking with the current user
        start_date: selectedStart,
        end_date: selectedEnd,
          total_price: totalPrice,
          notes: notes.trim() || undefined
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access')}`
          }
        }
      );
      
      toast.success('Booking request sent successfully!');
      onBookingSuccess(response.data);
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create booking';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-form-container" style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '1.5rem',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        marginTop: 0,
        marginBottom: '1.5rem',
        color: '#1a202c',
        fontSize: '1.375rem',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        Book This Property
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#4a5568',
            fontWeight: '500',
            fontSize: '0.9375rem'
          }}>
            Check-in Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              // Reset end date if it's before the new start date
              if (endDate && date > endDate) {
                setEndDate(null);
              }
            }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            filterDate={isDateDisabled}
            placeholderText="Select start date"
            className="date-picker-input"
            dateFormat="yyyy-MM-dd"
            disabled={isLoadingDates}
            style={{
              width: '100%',
              padding: '0.625rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              fontSize: '0.9375rem',
              color: '#1a202c',
              backgroundColor: isLoadingDates ? '#f7fafc' : '#fff',
              cursor: isLoadingDates ? 'not-allowed' : 'pointer'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#4a5568',
            fontWeight: '500',
            fontSize: '0.9375rem'
          }}>
            Check-out Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            excludeDates={bookingDates}
            className="form-control"
            placeholderText="Select check-out date"
            dateFormat="yyyy-MM-dd"
            locale="en-GB"
            disabled={!startDate || isLoadingDates}
            style={{
              width: '100%',
              padding: '0.625rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              fontSize: '0.9375rem',
              color: !startDate ? '#a0aec0' : '#1a202c',
              backgroundColor: !startDate || isLoadingDates ? '#f7fafc' : '#fff',
              cursor: !startDate || isLoadingDates ? 'not-allowed' : 'pointer'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#4a5568',
            fontWeight: '500',
            fontSize: '0.9375rem'
          }}>
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests or additional information..."
            rows="3"
            style={{
              width: '100%',
              padding: '0.625rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              fontSize: '0.9375rem',
              color: '#1a202c',
              resize: 'vertical',
              minHeight: '80px'
            }}
          />
        </div>
        
        {totalPrice > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '1rem',
              color: '#4a5568'
            }}>
              <span>Price per day:</span>
              <span>TZS {parseFloat(property.price).toLocaleString()}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '1rem',
              color: '#4a5568'
            }}>
              <span>Number of days:</span>
              <span>{differenceInDays(endDate, startDate) + 1}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1a202c',
              paddingTop: '0.5rem',
              borderTop: '1px solid #e2e8f0',
              marginTop: '0.75rem'
            }}>
              <span>Total Price:</span>
              <span>TZS {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '1.5rem'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#fff',
              color: '#4a5568',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: '#f7fafc',
                borderColor: '#cbd5e0'
              },
              ':disabled': {
                opacity: '0.6',
                cursor: 'not-allowed'
              }
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !startDate || !endDate}
            style={{
              padding: '0.625rem 1.5rem',
              backgroundColor: '#3182ce',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: '#2c5282'
              },
              ':disabled': {
                backgroundColor: '#a0aec0',
                cursor: 'not-allowed'
              }
            }}
          >
            {isLoading ? 'Processing...' : 'Book Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
