import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { bookingService, propertyService } from '../../services/api';
import { FaSort, FaFilter, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Status options for filtering
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'start_date_desc', label: 'Check-in (Newest First)' },
  { value: 'start_date_asc', label: 'Check-in (Oldest First)' },
  { value: 'created_at_desc', label: 'Recently Booked' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
];

const BookingsList = ({ isAdmin = false, propertyId = null }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortOption, setSortOption] = useState('start_date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setDateRange({ start: null, end: null });
    setSortOption('start_date_desc');
  };

  const handleDateRangeSelect = (dates) => {
    const [start, end] = dates;
    setDateRange({ start, end });
  };

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

  // Apply filters, search, and sorting
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        (booking.property_title?.toLowerCase().includes(query) ||
        booking.user_name?.toLowerCase().includes(query) ||
        booking.notes?.toLowerCase().includes(query) ||
        `#${booking.id}`.includes(query))
      );
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      result = result.filter(booking => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        const filterStart = new Date(dateRange.start);
        const filterEnd = new Date(dateRange.end);
        
        return (
          (startDate >= filterStart && startDate <= filterEnd) ||
          (endDate >= filterStart && endDate <= filterEnd) ||
          (startDate <= filterStart && endDate >= filterEnd)
        );
      });
    }

    // Apply sorting
    const [field, order] = sortOption.split('_');
    const isDesc = order === 'desc';
    result.sort((a, b) => {
      let comparison = 0;
      
      if (field === 'start_date' || field === 'created_at') {
        comparison = new Date(a[field]) - new Date(b[field]);
      } else if (field === 'price') {
        comparison = parseFloat(a.total_price) - parseFloat(b.total_price);
      }
      
      return isDesc ? -comparison : comparison;
    });

    return result;
  }, [bookings, searchQuery, dateRange, sortOption, statusFilter]);
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, dateRange, sortOption]);

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
      setBookings(prevBookings => prevBookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };



  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Bookings</h2>
        <div className="d-flex gap-2">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
              type="button"
              id="statusFilterDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaFilter className="me-1" />
              {STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label || 'Filter'}
            </button>
            <ul className="dropdown-menu" aria-labelledby="statusFilterDropdown">
              {STATUS_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    className={`dropdown-item ${statusFilter === option.value ? 'active' : ''}`}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
              type="button"
              id="sortDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaSort className="me-1" />
              {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Sort'}
            </button>
            <ul className="dropdown-menu" aria-labelledby="sortDropdown">
              {SORT_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    className={`dropdown-item ${sortOption === option.value ? 'active' : ''}`}
                    onClick={() => setSortOption(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {(statusFilter !== 'all' || searchQuery || dateRange.start || sortOption !== 'start_date_desc') && (
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-1"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Date Range</label>
          <DatePicker
            selectsRange={true}
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={handleDateRangeSelect}
            isClearable={true}
            placeholderText="Filter by date range"
            className="form-control"
            wrapperClassName="w-100"
          />
        </div>
      </div>

      {/* Active Filters */}
      <div className="mb-3">
        <div className="d-flex flex-wrap gap-2">
          {statusFilter !== 'all' && (
            <span className="badge bg-primary d-flex align-items-center">
              Status: {statusFilter}
              <button
                className="btn-close btn-close-white btn-sm ms-2"
                onClick={() => setStatusFilter('all')}
                aria-label="Remove filter"
              />
            </span>
          )}

          {dateRange.start && dateRange.end && (
            <span className="badge bg-info text-dark d-flex align-items-center">
              <FaCalendarAlt className="me-1" />
              {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
              <button
                className="btn-close btn-close-white btn-sm ms-2"
                onClick={() => setDateRange({ start: null, end: null })}
                aria-label="Remove date filter"
              />
            </span>
          )}
        </div>
      </div>

      {/* Bookings Count and Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted">
            Showing {Math.min(indexOfFirstItem + 1, filteredBookings.length)}-{
              Math.min(indexOfLastItem, filteredBookings.length)
            } of {filteredBookings.length} bookings
          </span>
        </div>
        <div className="text-muted">
          {filteredBookings.length > 0 && (
            <span>
              Total: ${filteredBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-center py-5 bg-light rounded">
            <h4>No bookings found</h4>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Property</th>
                <th>Dates</th>
                <th>Guest</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((booking) => (
                <tr key={booking.id} className={booking.status.toLowerCase()}>
                  <td>
                    <div className="d-flex align-items-center">
                      {booking.property_image && (
                        <img
                          src={booking.property_image}
                          alt={booking.property_title}
                          className="rounded me-2"
                          style={{ width: '50px', height: '40px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div className="fw-medium">{booking.property_title}</div>
                        <small className="text-muted">#{booking.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span>{format(parseISO(booking.start_date), 'MMM d, yyyy')}</span>
                      <span className="text-muted small">to {format(parseISO(booking.end_date), 'MMM d, yyyy')}</span>
                      <span className="badge bg-light text-dark">
                        {Math.ceil(
                          (new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24)
                        )}{' '}
                        nights
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{ width: '30px', height: '30px' }}>
                        <span className="text-primary fw-medium">
                          {booking.user_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span>{booking.user_name || 'Guest'}</span>
                    </div>
                  </td>
                  <td className="fw-medium">
                    ${parseFloat(booking.total_price).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge bg-${
                        {
                          PENDING: 'warning',
                          CONFIRMED: 'success',
                          CANCELLED: 'danger',
                          COMPLETED: 'info',
                        }[booking.status] || 'secondary'
                      } bg-opacity-10 text-${
                        {
                          PENDING: 'warning',
                          CONFIRMED: 'success',
                          CANCELLED: 'danger',
                          COMPLETED: 'info',
                        }[booking.status] || 'secondary'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {/* View details */}}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>

                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                            title="Confirm Booking"
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                            title="Reject Booking"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                          title="Cancel Booking"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details Modal */}
      <div className="modal fade" id="bookingDetailsModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Booking Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {/* Booking details will be loaded here via JavaScript */}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Print</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Update Confirmation Modal */}
      <div className="modal fade" id="statusUpdateModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Status Update</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Are you sure you want to update the status of this booking?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary" id="confirmStatusUpdate">
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsList;
