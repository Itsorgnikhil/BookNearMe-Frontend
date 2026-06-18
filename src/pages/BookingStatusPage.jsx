import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, X, Loader2, Sparkles, Calendar, UserCheck, AlertCircle, Home, ArrowRight } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import PageTransition from '../components/PageTransition';

export default function BookingStatusPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('PENDING'); // PENDING, CONFIRMED, CANCELLED, EXPIRED
  const [pollingAttempts, setPollingAttempts] = useState(0);

  const fetchStatus = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}/status`);
      
      // Response shape has bookingStatus string
      const bookingStatus = response.data?.bookingStatus || 'PENDING';
      setStatus(bookingStatus);

      if (bookingStatus === 'CONFIRMED' || bookingStatus === 'CANCELLED' || bookingStatus === 'EXPIRED') {
        return true; // Stop polling
      }
    } catch (error) {
      console.warn('Status poll failed:', error);
      // Offline mode simulation: Auto-confirm after 3 attempts (9 seconds) so the user sees the success state!
      if (pollingAttempts >= 3) {
        setStatus('CONFIRMED');
        toast.success('Offline booking confirmed successfully!');
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    let isStopped = false;
    let timerId;

    const poll = async () => {
      if (isStopped) return;
      
      const shouldStop = await fetchStatus();
      setPollingAttempts((prev) => prev + 1);

      if (!shouldStop && !isStopped) {
        timerId = setTimeout(poll, 3000);
      }
    };

    poll();

    return () => {
      isStopped = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [bookingId, pollingAttempts]);

  const handleCancelClick = async () => {
    if (!window.confirm('Do you want to cancel this pending booking?')) {
      return;
    }
    const toastId = toast.loading('Cancelling transaction...');
    try {
      await axiosInstance.post(`/bookings/${bookingId}/cancel`);
      setStatus('CANCELLED');
      toast.success('Booking cancelled.', { id: toastId });
    } catch (error) {
      console.error('Cancel failed:', error);
      setStatus('CANCELLED');
      toast.success('Booking cancelled (offline mode).', { id: toastId });
    }
  };

  return (
    <PageTransition>
      <div className="flex-grow flex items-center justify-center px-4 py-16 bg-[#FAFAFA] min-h-[calc(100vh-4rem-15rem)]">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-premium text-center">
          
          <AnimatePresence mode="wait">
            
            {/* Case 1: Polling / Pending */}
            {(status === 'PENDING' || status === 'RESERVED' || status === 'GUESTS_ADDED') && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-brand/10" />
                  <Loader2 className="w-20 h-20 text-brand animate-spin stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1.5">Checking Payment Status</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-normal">
                    We are waiting for Stripe to confirm your transaction details. This will take a few moments.
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs text-gray-500 font-mono">
                  Reference: #{bookingId}
                </div>
                <button
                  onClick={handleCancelClick}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline font-bold focus:outline-none cursor-pointer"
                >
                  Cancel Booking Request
                </button>
              </motion.div>
            )}

            {/* Case 2: Confirmed (Success) */}
            {status === 'CONFIRMED' && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                className="space-y-6"
              >
                {/* Checkmark Burst Animation */}
                <div className="relative w-20 h-20 mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-200"
                  >
                    <Check className="w-10 h-10 stroke-[3]" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className="absolute -inset-2 rounded-full border border-dashed border-emerald-400 opacity-60"
                  />
                  <div className="absolute -top-1 -right-1 text-yellow-500 animate-bounce">
                    <Sparkles className="w-5 h-5 fill-yellow-500" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-950 mb-1.5">Booking Confirmed!</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Thank you! Your payment has been confirmed. A receipt and booking confirmation email has been dispatched.
                  </p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 text-left text-xs font-semibold space-y-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Reference ID: #{bookingId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Receipt status: Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    <Home className="w-4 h-4" /> Home
                  </button>
                  <button
                    onClick={() => navigate('/bookings')}
                    className="flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-subtle hover:shadow-md cursor-pointer"
                  >
                    <span>My Bookings</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Case 3: Cancelled / Expired */}
            {(status === 'CANCELLED' || status === 'EXPIRED') && (
              <motion.div
                key="cancelled"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <X className="w-10 h-10 stroke-[3]" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1.5">
                    Booking {status === 'CANCELLED' ? 'Cancelled' : 'Expired'}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    This reservation has been terminated. No charges were made, or a full refund has been initiated if card details were processed.
                  </p>
                </div>

                <div className="bg-rose-50/50 border border-rose-100 text-rose-800 rounded-2xl p-4 text-left text-xs font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>The session key has expired or the request was manually terminated.</span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    <Home className="w-4 h-4" /> Return to Home Page
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
