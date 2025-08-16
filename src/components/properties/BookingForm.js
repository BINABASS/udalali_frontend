import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  format, 
  parseISO,
  isBefore,
  isAfter,
  addDays,
  differenceInDays,
  startOfDay,
  isValid,
  isSameDay,
  startOfToday
} from 'date-fns';
import { enGB } from 'date-fns/locale';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { FaInfoCircle, FaDollarSign, FaCalendarAlt, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCar, FaSwimmingPool, FaTimes, FaCheck, FaExclamationTriangle, FaStar, FaShieldAlt, FaCreditCard, FaClock, FaUserCheck } from 'react-icons/fa';
import { bookingService } from '../../services/api';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

/**
 * BookingForm - A premium form for booking a property with date selection and availability checking
 * @param {Object} props - Component props
 * @param {Object} props.property - The property being booked
 * @param {Function} props.onBookingSuccess - Callback when booking is successful
 * @param {Function} props.onCancel - Callback when booking is cancelled
 */
const BookingForm = ({ property, onBookingSuccess, onCancel }) => {
  // State for form inputs and loading states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [bookingDates, setBookingDates] = useState([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingNotes, setShowBookingNotes] = useState(false);

  // Derived state
  const today = useMemo(() => startOfToday(), []);
  const navigate = useNavigate();

  // Constants
  const MIN_STAY_DAYS = 1;
  const MAX_BOOKING_WINDOW = 365; // 1 year
  const DEBOUNCE_DELAY = 300; // ms

  // Note: In newer versions of date-fns, locale registration is handled automatically
  // The enGB locale is available by default

  // Calculate number of nights
  const numberOfNights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  }, [startDate, endDate]);

  // Get property price per night (handle different price fields)
  const pricePerNight = parseFloat(property?.price) || 0;
  
  // Calculate total price based on selected dates
  const calculatedTotal = useMemo(() => {
    if (!startDate || !endDate || !pricePerNight) {
      return 0;
    }
    const total = numberOfNights * pricePerNight;
    return total;
  }, [startDate, endDate, numberOfNights, pricePerNight]);

  // Update total price when calculation changes
  useEffect(() => {
    setTotalPrice(calculatedTotal);
  }, [calculatedTotal]);

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    const hasValidDates = startDate && endDate && !isSameDay(startDate, endDate);
    const hasValidPrice = totalPrice > 0;
    const isNotLoading = !isLoading && !isCheckingAvailability && !isLoadingDates;
    const hasNoErrors = !validationError || validationError.includes('suggested:') || validationError.includes('Perfect!');
    const meetsMinimumStay = numberOfNights >= MIN_STAY_DAYS;
    
    console.log('Form validation:', {
      hasValidDates,
      hasValidPrice,
      isNotLoading,
      hasNoErrors,
      meetsMinimumStay,
      startDate,
      endDate,
      totalPrice,
      validationError
    });
    
    return hasValidDates && hasValidPrice && isNotLoading && hasNoErrors && meetsMinimumStay;
  }, [startDate, endDate, totalPrice, isLoading, isCheckingAvailability, isLoadingDates, validationError, numberOfNights]);

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
        const bookings = Array.isArray(response?.data) ? response.data : [];

        // Collect all booked date ranges
        const dates = [];
        bookings.forEach(booking => {
          if (booking?.start_date && booking?.end_date) {
            try {
              const start = parseISO(booking.start_date);
              const end = parseISO(booking.end_date);

              if (isValid(start) && isValid(end)) {
                let currentDate = startOfDay(start);
                const bookingEnd = startOfDay(end);

                while (currentDate <= bookingEnd) {
                  dates.push(format(currentDate, 'yyyy-MM-dd'));
                  currentDate = addDays(currentDate, 1);
                }
              }
            } catch (error) {
              console.error('Error parsing booking dates:', error);
            }
          }
        });

        setBookingDates(dates);
      } catch (error) {
        console.error('Error fetching booked dates:', error);
        toast.error('Failed to load availability. Please try again.');
      } finally {
        setIsLoadingDates(false);
      }
    };

    fetchBookedDates();
  }, [property?.id]);

  // Debounced availability check
  const debouncedAvailabilityCheck = useMemo(
    () => debounce(async (start, end) => {
      if (!start || !end || !property?.id) return;

      setIsCheckingAvailability(true);
      try {
        const response = await bookingService.checkAvailability({
          property_id: property.id,
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd')
        });

        if (!response.available) {
          setValidationError(response.message || 'Selected dates are not available. Please choose different dates.');
        } else {
          setValidationError('');
        }
      } catch (error) {
        console.error('Availability check error:', error);
        setValidationError('Unable to verify availability. Please try again.');
      } finally {
        setIsCheckingAvailability(false);
      }
    }, DEBOUNCE_DELAY),
    [property?.id]
  );

  // Check availability when dates change
  useEffect(() => {
    if (startDate && endDate) {
      debouncedAvailabilityCheck(startDate, endDate);
    }
  }, [startDate, endDate, debouncedAvailabilityCheck]);

  const handleStartDateChange = (selectedDate) => {
    setStartDate(selectedDate);
    setEndDate(null); // Reset end date when start date changes
    setTotalPrice(0); // Reset total price
    setValidationError(''); // Clear previous validation errors
    
    // Show helpful message to user
    if (selectedDate) {
      const nextDay = addDays(selectedDate, 1);
      const suggestedEndDate = format(nextDay, 'dd/MM/yyyy');
      setValidationError(`Please select an end date (suggested: ${suggestedEndDate} for 1 night stay)`);
    }
  };

  const handleEndDateChange = (selectedDate) => {
    // Prevent selecting the same date as start date
    if (startDate && selectedDate && isSameDay(startDate, selectedDate)) {
      // Automatically set end date to next day if same date is selected
      const nextDay = addDays(startDate, 1);
      setEndDate(nextDay);
      setValidationError(''); // Clear validation error
      
      // Calculate price and check availability for the adjusted dates
      if (pricePerNight > 0) {
        const days = differenceInDays(nextDay, startDate) + 1;
        const newTotal = days * pricePerNight;
        setTotalPrice(newTotal);
        debouncedAvailabilityCheck(startDate, nextDay);
      }
      return;
    }
    
    // Ensure minimum stay of 1 day
    if (startDate && selectedDate) {
      const days = differenceInDays(selectedDate, startDate);
      if (days < 0) {
        setValidationError('End date must be after start date');
        return;
      }
    }
    
    setEndDate(selectedDate);
    setValidationError(''); // Clear previous validation errors
    
    // Calculate price and check availability
    if (startDate && selectedDate && pricePerNight > 0) {
      const days = differenceInDays(selectedDate, startDate) + 1;
      const newTotal = days * pricePerNight;
      setTotalPrice(newTotal);
      debouncedAvailabilityCheck(startDate, selectedDate);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous validation errors
    setValidationError('');
    
    // Basic validation
    if (!startDate || !endDate) {
      setValidationError('Please select both check-in and check-out dates');
      toast.error('Please select both check-in and check-out dates');
      return;
    }
    
    // Check if end date is after start date
    if (startDate >= endDate) {
      setValidationError('End date must be after start date');
      toast.error('End date must be after start date');
      return;
    }
    
    // Check minimum stay
    const days = differenceInDays(endDate, startDate) + 1;
    if (days < MIN_STAY_DAYS) {
      const errorMsg = `Minimum stay is ${MIN_STAY_DAYS} day${MIN_STAY_DAYS > 1 ? 's' : ''}`;
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Check if total price is valid
    if (totalPrice <= 0) {
      setValidationError('Invalid price calculation. Please try selecting different dates.');
      toast.error('Invalid price calculation. Please try selecting different dates.');
      return;
    }
    
    // Check if still checking availability
    if (isCheckingAvailability) {
      toast.info('Please wait while we verify availability...');
      return;
    }
    
    // Get the current user
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to book a property');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    // Check if user has the correct role
    if (user.role !== 'buyer') {
      toast.error('Only buyers can book properties');
      return;
    }
    
    // Check if user is trying to book their own property
    if (user.id === (property.owner?.id || property.owner)) {
      toast.error('You cannot book your own property');
      return;
    }
    
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format dates for API
      const selectedStart = format(startDate, 'yyyy-MM-dd');
      const selectedEnd = format(endDate, 'yyyy-MM-dd');
      
      // Double-check availability with the server
      const availabilityCheck = await bookingService.checkAvailability({
        property_id: property.id,
        start_date: selectedStart,
        end_date: selectedEnd
      });
      
      if (!availabilityCheck.available) {
        toast.error(availabilityCheck.message || 'Selected dates are no longer available. Please choose different dates.');
        // Refresh available dates by resetting the form
        setStartDate(null);
        setEndDate(null);
        return;
      }
      
      // Prepare booking data
      const bookingData = {
        property: property.id,
        user: user.id,
        start_date: selectedStart,
        end_date: selectedEnd,
        total_price: totalPrice,
        status: 'PENDING', // Explicitly set status
        notes: bookingNotes.trim() || undefined
      };
      
      console.log('Submitting booking:', bookingData);
      
      // Create the booking
      const response = await bookingService.createBooking(bookingData);
      
      toast.success('Booking request sent successfully!');
      if (onBookingSuccess) {
        onBookingSuccess(response);
      }
    } catch (error) {
      console.error('Booking error:', error);
      let errorMessage = 'Failed to create booking. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        errorMessage = error.response.data.message || error.response.data.detail || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'TZS 0';
    return `TZS ${Number(price).toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Premium Header with Glass Effect */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-8 rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <FaShieldAlt className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Secure Your Stay</h2>
                  <p className="text-blue-100 text-lg">Premium booking experience with instant confirmation</p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 text-blue-100">
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <FaCheck className="w-5 h-5 text-green-400" />
                <span className="font-medium">Instant Confirmation</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <FaShieldAlt className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <FaStar className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">Premium Service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Showcase */}
        <div className="px-8 py-8 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-xl">
              {property?.title?.charAt(0) || 'P'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-2xl mb-3">{property?.title}</h3>
              <div className="flex items-center text-gray-600 text-base mb-4">
                <FaMapMarkerAlt className="w-5 h-5 mr-3 text-blue-500" />
                <span className="font-semibold text-lg">{property?.location}</span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm">
                  <FaBed className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 font-medium">{property?.bedrooms || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm">
                  <FaBath className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 font-medium">{property?.bathrooms || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm">
                  <FaRulerCombined className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 font-medium">{property?.area ? `${property.area} sqm` : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          {/* Date Selection Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaCalendarAlt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Select Your Dates</h3>
                <p className="text-gray-600 text-base">Choose your preferred check-in and check-out dates</p>
                <p className="text-blue-600 text-sm mt-1 font-medium">💡 Tip: Select different dates for check-in and check-out (minimum 1 night stay)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Check-in Date
                </label>
                <div className="relative group">
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={today}
                    excludeDates={bookingDates}
                    className="w-full p-5 pl-14 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium text-lg group-hover:border-blue-300 group-hover:shadow-lg"
                    placeholderText="Select check-in date"
                    dateFormat="dd/MM/yyyy"
                    locale={enGB}
                    required
                    disabled={isLoadingDates}
                  />
                  <FaCalendarAlt className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-500 w-6 h-6" />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Check-out Date
                </label>
                <div className="relative group">
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || today}
                    excludeDates={bookingDates}
                    className="w-full p-5 pl-14 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium text-lg group-hover:border-blue-300 group-hover:shadow-lg"
                    placeholderText="Select check-out date"
                    dateFormat="dd/MM/yyyy"
                    locale={enGB}
                    required
                    disabled={isLoadingDates || !startDate}
                  />
                  <FaCalendarAlt className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-500 w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="flex items-center p-5 bg-red-50 border border-red-200 rounded-2xl">
                <FaExclamationTriangle className="w-6 h-6 text-red-500 mr-3" />
                <span className="text-red-700 font-medium">{validationError}</span>
              </div>
            )}
            
            {/* Success Message */}
            {!validationError && startDate && endDate && totalPrice > 0 && (
              <div className="flex items-center p-5 bg-green-50 border border-green-200 rounded-2xl">
                <FaCheck className="w-6 h-6 text-green-500 mr-3" />
                <span className="text-green-700 font-medium">Perfect! Your dates are available and ready for booking.</span>
              </div>
            )}
          </div>
          
          {/* Special Requests Section */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowBookingNotes(!showBookingNotes)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-semibold text-lg"
            >
              <FaInfoCircle className="mr-3 w-5 h-5" />
              {showBookingNotes ? 'Hide' : 'Add'} special requests (optional)
            </button>
            
            {showBookingNotes && (
              <div className="space-y-4 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full p-5 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none font-medium text-lg"
                  rows="4"
                  placeholder="Any special requirements or questions?"
                  maxLength="500"
                />
                <div className="flex justify-between items-center text-sm text-blue-700">
                  <span className="font-medium">Special requests help us serve you better</span>
                  <span className="font-bold text-lg">{bookingNotes.length}/500 characters</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Premium Price Summary */}
          {(startDate && endDate) && (
            <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8 rounded-3xl border-2 border-blue-200 shadow-xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaCreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Booking Summary</h3>
                  <p className="text-gray-600 text-base">Complete cost breakdown for your stay</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center py-4 border-b-2 border-blue-200">
                  <span className="text-gray-700 font-semibold text-lg">
                    {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                  </span>
                  <span className="font-bold text-gray-900 text-xl">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex justify-between items-center py-4">
                  <span className="text-gray-600 text-lg">
                    {formatPrice(pricePerNight)} x {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}
                  </span>
                  <span className="font-bold text-gray-900 text-xl">{formatPrice(pricePerNight * numberOfNights)}</span>
                </div>
                
                {property?.cleaning_fee > 0 && (
                  <div className="flex justify-between items-center py-4">
                    <span className="text-gray-600 text-lg">Cleaning fee</span>
                    <span className="font-bold text-gray-900 text-xl">{formatPrice(property.cleaning_fee)}</span>
                  </div>
                )}
                
                {property?.service_fee > 0 && (
                  <div className="flex justify-between items-center py-4">
                    <span className="text-gray-600 text-lg">Service fee</span>
                    <span className="font-bold text-gray-900 text-xl">{formatPrice(property.service_fee)}</span>
                  </div>
                )}
                
                <div className="border-t-2 border-blue-300 my-6"></div>
                
                <div className="flex justify-between items-center py-4">
                  <span className="text-2xl font-bold text-gray-900">Total Amount</span>
                  <span className="text-4xl font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Premium Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={`flex-1 px-10 py-5 text-xl font-bold rounded-2xl border-2 border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-500 hover:shadow-xl ${
                isLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-2xl hover:scale-105'
              }`}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!isFormValid}
              className={`flex-1 px-10 py-5 text-xl font-bold text-white rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 ${
                !isFormValid
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-4 h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : isCheckingAvailability ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-4 h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking Availability...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Book Now for {totalPrice > 0 ? formatPrice(totalPrice) : ''}
                </div>
              )}
            </button>
          </div>
        </form>
        
        {/* Premium Footer */}
        <div className="px-8 py-8 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 rounded-b-3xl">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 text-blue-500 mt-2">
              <FaCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base text-gray-700 font-semibold mb-4">
                Your booking is not confirmed until you receive a confirmation email. 
                A small deposit may be required to secure your reservation.
              </p>
              <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2 bg-white rounded-xl p-3 shadow-sm">
                  <FaShieldAlt className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Secure Booking</span>
                </div>
                <div className="flex items-center space-x-2 bg-white rounded-xl p-3 shadow-sm">
                  <FaStar className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Premium Support</span>
                </div>
                <div className="flex items-center space-x-2 bg-white rounded-xl p-3 shadow-sm">
                  <FaCreditCard className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Safe Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
