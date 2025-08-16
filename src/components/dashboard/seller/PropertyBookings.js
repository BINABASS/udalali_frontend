import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCalendarAlt, FaUser, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCheck, FaTimes, FaEye, FaClock, FaDollarSign, FaHome } from 'react-icons/fa';
import { toast } from '../../ui/Toaster';
import { bookingService } from '../../../services/api';
import { useUser } from '../../../context/UserContext';

const PropertyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled, completed
  const [selectedProperty, setSelectedProperty] = useState('all');

  useEffect(() => {
    if (user?.user_type === 'SELLER') {
      loadBookings();
    }
  }, [user, filter, selectedProperty]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (selectedProperty !== 'all') params.property = selectedProperty;
      
      const data = await bookingService.getSellerBookings(params);
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingService.confirmBooking(bookingId);
      toast.success('Booking confirmed successfully!');
      loadBookings(); // Reload to get updated status
    } catch (error) {
      toast.error(error.message || 'Failed to confirm booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) {
      return;
    }
    
    try {
      await bookingService.rejectBooking(bookingId);
      toast.success('Booking rejected successfully!');
      loadBookings(); // Reload to get updated status
    } catch (error) {
      toast.error(error.message || 'Failed to reject booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: FaClock },
      'CONFIRMED': { color: 'bg-green-100 text-green-800 border-green-200', icon: FaCheck },
      'CANCELLED': { color: 'bg-red-100 text-red-800 border-red-200', icon: FaTimes },
      'COMPLETED': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FaCheck }
    };
    
    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getUniqueProperties = () => {
    const properties = [...new Set(bookings.map(booking => booking.property.id))];
    return properties.map(id => {
      const booking = bookings.find(b => b.property.id === id);
      return {
        id,
        title: booking.property.title,
        location: booking.property.location
      };
    });
  };

  if (user?.user_type !== 'SELLER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only sellers can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Bookings</h1>
          <p className="text-gray-600">Manage and respond to booking requests for your properties</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Filter</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Properties</option>
                {getUniqueProperties().map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title} - {property.location}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={loadBookings}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaCalendarAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any bookings yet." 
                : `No ${filter} bookings found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Booking Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Booking #{booking.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Created on {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* Property Details */}
                <div className="px-6 py-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {booking.property.images && booking.property.images.length > 0 ? (
                        <img 
                          src={booking.property.images[0].image} 
                          alt={booking.property.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaHome className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {booking.property.title}
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-blue-500" />
                          {booking.property.location}
                        </div>
                        {booking.property.bedrooms && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaBed className="w-4 h-4 mr-2 text-blue-500" />
                            {booking.property.bedrooms} beds
                          </div>
                        )}
                        {booking.property.bathrooms && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaBath className="w-4 h-4 mr-2 text-blue-500" />
                            {booking.property.bathrooms} baths
                          </div>
                        )}
                        {booking.property.area && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaRulerCombined className="w-4 h-4 mr-2 text-blue-500" />
                            {booking.property.area} sqm
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaUser className="w-4 h-4 mr-2 text-blue-500" />
                        Customer Details
                      </h5>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {booking.user.username}</p>
                        <p><span className="font-medium">Email:</span> {booking.user.email}</p>
                        {booking.user.phone && (
                          <p><span className="font-medium">Phone:</span> {booking.user.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-blue-500" />
                        Stay Dates
                      </h5>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Check-in:</span> {format(new Date(booking.start_date), 'MMM dd, yyyy')}</p>
                        <p><span className="font-medium">Check-out:</span> {format(new Date(booking.end_date), 'MMM dd, yyyy')}</p>
                        <p><span className="font-medium">Duration:</span> {Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} nights</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaDollarSign className="w-4 h-4 mr-2 text-blue-500" />
                        Pricing
                      </h5>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Total Price:</span> {formatPrice(booking.total_price)}</p>
                        <p><span className="font-medium">Price per Night:</span> {formatPrice(booking.total_price / Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24)))}</p>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-2">Special Requests</h5>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                        {booking.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {booking.status === 'PENDING' && (
                  <div className="px-6 py-4 bg-white border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        This booking is waiting for your response
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRejectBooking(booking.id)}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <FaTimes className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleConfirmBooking(booking.id)}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <FaCheck className="w-4 h-4 mr-2" />
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status-specific messages */}
                {booking.status === 'CONFIRMED' && (
                  <div className="px-6 py-4 bg-green-50 border-t border-green-200">
                    <div className="flex items-center text-green-800">
                      <FaCheck className="w-5 h-5 mr-2" />
                      <span className="font-medium">This booking has been confirmed. The customer will receive a confirmation email.</span>
                    </div>
                  </div>
                )}

                {booking.status === 'CANCELLED' && (
                  <div className="px-6 py-4 bg-red-50 border-t border-red-200">
                    <div className="flex items-center text-red-800">
                      <FaTimes className="w-5 h-5 mr-2" />
                      <span className="font-medium">This booking has been cancelled/rejected.</span>
                    </div>
                  </div>
                )}

                {booking.status === 'COMPLETED' && (
                  <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
                    <div className="flex items-center text-blue-800">
                      <FaCheck className="w-5 h-5 mr-2" />
                      <span className="font-medium">This booking has been completed successfully.</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyBookings; 