import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { bookingService, propertyService } from '../../services/api';

const BookingsList = ({ isAdmin = false, propertyId = null }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
          toast.error('Please log in to view bookings');
          setIsLoading(false);
          return;
        }

        let response;
        if (propertyId) {
          // Verify the current user is the owner of this property
          const propertyResponse = await propertyService.getProperty(propertyId);
          const property = propertyResponse.data;
          
          if (property.owner?.id !== currentUser.id && !currentUser.is_staff) {
            toast.error('You do not have permission to view these bookings');
            setIsLoading(false);
            return;
          }
          
          // Get bookings for a specific property (for property owners)
          response = await bookingService.getPropertyBookings(propertyId);
        } else if (isAdmin || currentUser.is_staff) {
          // Get all bookings (for admin)
          response = await bookingService.getBookings();
        } else {
          // Get current user's bookings
          response = await bookingService.getUserBookings(currentUser.id);
          
          // If user is a seller, also get bookings for their properties
          if (currentUser.role === 'seller') {
            const sellerProperties = await propertyService.getAllProperties({
              owner: currentUser.id
            });
            
            if (sellerProperties.data?.length > 0) {
              const propertyBookings = await Promise.all(
                sellerProperties.data.map(prop => 
                  bookingService.getPropertyBookings(prop.id)
                )
              );
              
              // Combine user's bookings with their properties' bookings
              const allBookings = [
                ...(response?.data || []),
                ...propertyBookings.flatMap(res => res?.data || [])
              ];
              
              // Remove duplicates by booking ID
              const uniqueBookings = Array.from(
                new Map(allBookings.map(booking => [booking.id, booking])).values()
              );
              
              response = { data: uniqueBookings };
            }
          }
        }
        
        if (response?.data) {
          // Sort bookings by start date (newest first)
          const sortedBookings = [...response.data].sort((a, b) => 
            new Date(b.start_date) - new Date(a.start_date)
          );
          setBookings(sortedBookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [isAdmin, propertyId]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        toast.error('Please log in to update booking status');
        return;
      }
      
      // Get the booking to verify ownership
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        toast.error('Booking not found');
        return;
      }
      
      // Verify the current user has permission to update this booking
      const isPropertyOwner = booking.property?.owner?.id === currentUser.id;
      const isBookingOwner = booking.user?.id === currentUser.id;
      
      if (!isPropertyOwner && !isBookingOwner && !currentUser.is_staff) {
        toast.error('You do not have permission to update this booking');
        return;
      }
      
      // Only allow certain status transitions based on user role
      if (isPropertyOwner || currentUser.is_staff) {
        // Property owner or admin can confirm, reject, or mark as completed
        if (!['CONFIRMED', 'REJECTED', 'COMPLETED'].includes(newStatus)) {
          toast.error('Invalid status update');
          return;
        }
      } else if (isBookingOwner) {
        // Booking owner can only cancel their own booking
        if (newStatus !== 'CANCELLED') {
          toast.error('You can only cancel your own booking');
          return;
        }
      }
      
      await bookingService.updateBooking(bookingId, { status: newStatus });
      
      // Update the local state to reflect the change
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {propertyId ? 'Property Bookings' : isAdmin ? 'All Bookings' : 'My Bookings'}
        </h2>
        
        <div className="flex items-center space-x-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <li key={booking.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-blue-600">
                        {booking.property?.title || 'Property'}
                      </div>
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {booking.property ? `TZS ${parseInt(booking.property.price).toLocaleString()}/month` : 'N/A'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {format(parseISO(booking.start_date), 'MMM d, yyyy')} - {format(parseISO(booking.end_date), 'MMM d, yyyy')}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Total: TZS {parseInt(booking.total_price).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                      
                      {isAdmin && booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {!isAdmin && booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {booking.notes && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Notes:</span> {booking.notes}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
