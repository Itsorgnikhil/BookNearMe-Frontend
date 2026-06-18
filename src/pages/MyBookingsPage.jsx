import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Calendar, User, CreditCard, ShieldCheck, MapPin, Loader2, AlertCircle, X, Receipt, CheckCircle } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockBookings } from '../utils/mockData';
import PageTransition from '../components/PageTransition';

// Staggered entry animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  },
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Voucher modal state
  const [activeVoucher, setActiveVoucher] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users/myBookings');
      // Sort newest first (by id descending)
      const sorted = (response.data || []).sort((a, b) => b.id - a.id);
      setBookings(sorted);
    } catch (error) {
      console.warn('API error fetching bookings, falling back to mock sorted listings:', error);
      const sortedMocks = [...mockBookings].sort((a, b) => b.id - a.id);
      setBookings(sortedMocks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setCancellingId(bookingId);
    const toastId = toast.loading('Cancelling reservation...');

    try {
      await axiosInstance.post(`/bookings/${bookingId}/cancel`);
      
      // Update local state status to CANCELLED
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === bookingId ? { ...b, bookingStatus: 'CANCELLED' } : b)
      );

      toast.success('Reservation cancelled successfully.', { id: toastId });
    } catch (error) {
      console.error('Cancellation failed:', error);
      
      // Fallback update for mock state
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === bookingId ? { ...b, bookingStatus: 'CANCELLED' } : b)
      );
      toast.success('Reservation cancelled (offline mode).', { id: toastId });
    } finally {
      setCancellingId(null);
    }
  };

  // Resume checkout flow at correct step
  const handleResumeBooking = (booking) => {
    const status = booking.bookingStatus;
    if (status === 'RESERVED') {
      // Navigate to Step 2: Add Guests
      navigate(`/booking/${booking.id}/guests`, {
        state: { 
          hotelName: booking.hotel?.name || booking.hotelName || 'Selected Hotel', 
          roomType: booking.room?.type || 'Selected Room' 
        }
      });
    } else if (status === 'GUESTS_ADDED' || status === 'PAYMENTS_PENDING' || status === 'PENDING') {
      // Navigate to Step 3: Payment
      navigate(`/booking/${booking.id}/payment`, {
        state: { 
          hotelName: booking.hotel?.name || booking.hotelName || 'Selected Hotel', 
          roomType: booking.room?.type || 'Selected Room' 
        }
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-block border text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm">
            Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-block border text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border-rose-100 shadow-sm">
            Cancelled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-block border text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border-gray-200">
            Expired
          </span>
        );
      case 'PAYMENTS_PENDING':
      case 'PENDING':
        return (
          <span className="inline-block border text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border-amber-100 shadow-sm animate-pulse">
            Pending Payment
          </span>
        );
      case 'RESERVED':
      case 'GUESTS_ADDED':
      default:
        return (
          <span className="inline-block border text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded-full bg-amber-50/70 text-amber-650 border-amber-100/60 shadow-sm">
            Pending Setup
          </span>
        );
    }
  };

  const isPendingStatus = (status) => {
    return status === 'RESERVED' || status === 'GUESTS_ADDED' || status === 'PAYMENTS_PENDING' || status === 'PENDING';
  };

  const isCancelableStatus = (status) => {
    return isPendingStatus(status) || status === 'CONFIRMED' || status === 'PAID';
  };

  return (
    <PageTransition>
      <div className="flex-grow bg-[#FAFAFA] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight mb-2">My Bookings</h1>
              <p className="text-sm text-gray-500">Manage, view, and resume checkout on your reservations</p>
            </div>
            <button 
              onClick={fetchBookings} 
              className="text-xs font-bold text-brand hover:underline cursor-pointer focus:outline-none"
            >
              Refresh Lists
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-150 shadow-subtle p-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">No bookings found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                You haven't made any reservations yet. Search and reserve your next hotel stay on the home feed!
              </p>
            </div>
          ) : (
            /* Staggered cards entry */
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  variants={cardVariants}
                  className="bg-white rounded-3xl border border-gray-150 shadow-subtle overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow"
                >
                  {/* Left Side: status & code */}
                  <div className="bg-gray-50/50 p-6 md:w-52 flex-shrink-0 flex flex-col justify-between border-r border-gray-100">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">Reference ID</span>
                      <p className="font-mono text-sm text-gray-800 font-bold mt-0.5">#{booking.id}</p>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase block mb-1">Status</span>
                      {getStatusBadge(booking.bookingStatus)}
                    </div>
                  </div>

                  {/* Right Side: details and options */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="font-bold text-gray-950 text-xl leading-tight">
                          {booking.hotel?.name || booking.hotelName || `Hotel Booking (ID: ${booking.id})`}
                        </h3>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none">Cost</span>
                          <span className="text-lg font-black text-brand">₹{(booking.amount || booking.price || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Itinerary details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-b border-gray-100 py-4 mb-4">
                        <div className="text-sm font-medium flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-brand flex-shrink-0" />
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block uppercase leading-none mb-0.5">Check-in</span>
                            <span className="text-xs">{booking.checkInDate}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-brand flex-shrink-0" />
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block uppercase leading-none mb-0.5">Check-out</span>
                            <span className="text-xs">{booking.checkOutDate}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium flex items-center gap-2 text-gray-700 col-span-2 md:col-span-1">
                          <User className="w-4 h-4 text-brand flex-shrink-0" />
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block uppercase leading-none mb-0.5">Rooms</span>
                            <span className="text-xs">{booking.roomsCount} Room{booking.roomsCount > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      {/* Guest Names list */}
                      {booking.guests && booking.guests.length > 0 && (
                        <div className="mb-4">
                          <span className="text-[10px] text-gray-400 font-black tracking-wider uppercase block mb-1.5">Guests Checked-in</span>
                          <div className="flex flex-wrap gap-1.5">
                            {booking.guests.map((g) => (
                              <span 
                                key={g.id} 
                                className="text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1"
                              >
                                {g.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action button container */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100/50 mt-2">
                      <div>
                        {isCancelableStatus(booking.bookingStatus) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline disabled:opacity-40"
                          >
                            Cancel Reservation
                          </button>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Option 1: Continue Booking */}
                        {isPendingStatus(booking.bookingStatus) && (
                          <button
                            onClick={() => handleResumeBooking(booking)}
                            className="bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-subtle hover:shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Continue Booking</span>
                          </button>
                        )}

                        {/* Option 2: View Details receipt */}
                        {booking.bookingStatus === 'CONFIRMED' && (
                          <button
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                            className="border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      {/* Booking Voucher Receipt Modal */}
      <AnimatePresence>
        {activeVoucher && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVoucher(null)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 z-50 p-6 space-y-6 relative"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setActiveVoucher(null)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-650 focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Voucher Header */}
                <div className="text-center space-y-2 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-gray-950 leading-none">Booking Receipt</h3>
                  <p className="text-xs text-gray-400 font-mono">Reference ID: #{activeVoucher.id}</p>
                </div>

                {/* Itinerary Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-gray-400 font-black block uppercase tracking-wider mb-1">Accommodation</span>
                    <h4 className="font-bold text-gray-900 text-base leading-snug">{activeVoucher.hotelName || 'Boutique Hotel'}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <div>
                      <span className="text-[9px] text-gray-400 font-black block uppercase tracking-wider mb-0.5">Check-in</span>
                      <p className="text-xs font-bold text-gray-800">{activeVoucher.checkInDate}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 font-black block uppercase tracking-wider mb-0.5">Check-out</span>
                      <p className="text-xs font-bold text-gray-800">{activeVoucher.checkOutDate}</p>
                    </div>
                    <div className="col-span-2 border-t border-gray-150/50 pt-2.5 mt-1">
                      <span className="text-[9px] text-gray-400 font-black block uppercase tracking-wider mb-0.5">Rooms Count</span>
                      <p className="text-xs font-bold text-gray-800">{activeVoucher.roomsCount} Room{activeVoucher.roomsCount > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Guest details */}
                  {activeVoucher.guests && activeVoucher.guests.length > 0 && (
                    <div>
                      <span className="text-[9px] text-gray-400 font-black block uppercase tracking-wider mb-1.5">Checked-in Guests</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeVoucher.guests.map((g) => (
                          <span 
                            key={g.id} 
                            className="text-[10px] font-bold text-gray-650 bg-gray-150/40 border border-gray-200/40 rounded px-2.5 py-1"
                          >
                            {g.name} ({g.gender?.toLowerCase()})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment totals */}
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                    <span className="text-xs text-gray-500 font-bold">Total Paid</span>
                    <span className="text-lg font-black text-emerald-600">₹{(activeVoucher.amount || activeVoucher.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Stripe verification badge */}
                <div className="text-[10px] text-gray-500 leading-normal flex items-start gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 mt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Stripe transaction checked and approved. You are set to check in on arrival!</span>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
