import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Users, ArrowLeft, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockHotels, mockRoomsByHotel } from '../utils/mockData';
import PageTransition from '../components/PageTransition';
import BookingWizardLayout from '../components/BookingWizardLayout';

export default function BookingInitPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read URL search params
  const hotelId = searchParams.get('hotelId') || '';
  const roomId = searchParams.get('roomId') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const roomsCount = searchParams.get('roomsCount') || '1';

  // Details states
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);

  // Validate params on load
  useEffect(() => {
    if (!hotelId || !roomId || !checkIn || !checkOut) {
      toast.error('Invalid reservation parameters.');
      navigate('/');
    } else {
      fetchDetails();
    }
  }, [hotelId, roomId, checkIn, checkOut]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // Fetch Hotel and Room details
      const response = await axiosInstance.post(`/hotels/${hotelId}/info`, {
        startDate: checkIn,
        endDate: checkOut,
        roomsCount: parseInt(roomsCount) || 1
      });

      if (response.data) {
        setHotel(response.data.hotel);
        const matchedRoom = response.data.rooms?.find(r => r.id === parseInt(roomId));
        setRoom(matchedRoom || null);
      } else {
        fallbackToMockDetails();
      }
    } catch (error) {
      console.warn('API error during checkout prep, using mocks:', error);
      fallbackToMockDetails();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToMockDetails = () => {
    const foundHotel = mockHotels.find(h => h.id === parseInt(hotelId));
    if (foundHotel) {
      setHotel(foundHotel);
      const roomsList = mockRoomsByHotel[foundHotel.id] || [];
      const matchedRoom = roomsList.find(r => r.id === parseInt(roomId));
      setRoom(matchedRoom || null);
    }
  };

  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const handleConfirmReservation = async () => {
    setIsReserving(true);
    const toastId = toast.loading('Initializing booking reservation...');

    try {
      // Step 1: Initialise booking
      const initResponse = await axiosInstance.post('/bookings/init', {
        hotelId: parseInt(hotelId),
        roomId: parseInt(roomId),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomsCount: parseInt(roomsCount)
      });
      
      const createdBooking = initResponse.data;
      toast.success('Reservation saved! Proceeding to guests list...', { id: toastId });
      
      // Navigate to Step 2: Add Guests with bookingId
      navigate(`/booking/${createdBooking.id}/guests`, { 
        state: { hotelName: hotel.name, roomType: room.type } 
      });
    } catch (error) {
      console.error('Reservation creation failed:', error);
      toast.error('API reservation failed. Simulating offline session redirect...', { id: toastId });

      // Offline simulation fallback: generate a mock booking ID
      setTimeout(() => {
        const mockBookingId = Math.floor(100000 + Math.random() * 900000);
        navigate(`/booking/${mockBookingId}/guests`, { 
          state: { hotelName: hotel.name, roomType: room.type } 
        });
      }, 1500);
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-24 bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 bg-white">
        <p className="text-gray-500 font-medium">Hotel or Room details could not be found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-brand hover:underline font-bold">
          Return Home
        </button>
      </div>
    );
  }

  const nights = getNights();
  const totalPrice = room.price * nights * parseInt(roomsCount);

  return (
    <PageTransition>
      <BookingWizardLayout currentStep={1}>
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-semibold mb-6 focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Details
          </button>

          {/* Stepper Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Review information */}
            <div className="md:col-span-7 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Confirm Reservation</h2>
                <p className="text-xs text-gray-500">Please review your check-in dates and hotel parameters before confirming.</p>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-black block uppercase tracking-wider mb-0.5">Check-in</span>
                  <p className="text-sm font-bold text-gray-900">{checkIn}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black block uppercase tracking-wider mb-0.5">Check-out</span>
                  <p className="text-sm font-bold text-gray-900">{checkOut}</p>
                </div>
                <div className="col-span-2 border-t border-gray-150/55 pt-3 mt-1">
                  <span className="text-[10px] text-gray-400 font-black block uppercase tracking-wider mb-0.5 font-sans">Duration</span>
                  <p className="text-sm font-bold text-gray-900">{nights} Night{nights > 1 ? 's' : ''} · {roomsCount} Room{parseInt(roomsCount) > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider">Cancellation Policy</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Cancel up to 24 hours prior to check-in for a full refund. Cancellations made inside the 24-hour window will incur standard room charge penalties.
                </p>
              </div>
            </div>

            {/* Right side: Summary invoice card */}
            <div className="md:col-span-5 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-premium space-y-6">
              <h3 className="text-lg font-black text-gray-900">Itinerary Summary</h3>

              {/* Room details */}
              <div className="flex gap-4">
                <div className="w-16 aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-subtle flex-shrink-0">
                  <img src={room.photos?.[0]} alt={room.type} className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <h4 className="font-extrabold text-gray-950 text-sm leading-snug truncate">{hotel.name}</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5 truncate">{room.type}</p>
                  <p className="text-[9px] text-gray-400 font-bold block mt-1 uppercase tracking-wider">{hotel.city}</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Price details */}
              <div className="space-y-2 text-xs font-semibold text-gray-650">
                <div className="flex justify-between">
                  <span>₹{room.price.toLocaleString('en-IN')} x {nights} night{nights > 1 ? 's' : ''}</span>
                  <span>₹{(room.price * nights).toLocaleString('en-IN')}</span>
                </div>
                {parseInt(roomsCount) > 1 && (
                  <div className="flex justify-between text-gray-400 font-medium">
                    <span>Rooms Multiplier (x{roomsCount})</span>
                    <span>x {roomsCount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-950 font-black text-base border-t border-gray-100 pt-3.5 mt-2">
                  <span>Total Amount</span>
                  <span className="text-brand">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 leading-normal flex items-start gap-2 bg-brand/5 p-3 rounded-xl border border-brand/10">
                <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                <span>You're protected by <b>AirCover</b>. Standard bookings have cancellation guarantees if issues arise.</span>
              </div>

              {/* Confirm Reservation button */}
              <button
                onClick={handleConfirmReservation}
                disabled={isReserving}
                className="w-full flex justify-center items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-subtle hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isReserving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <span>Confirm Reservation</span>
                )}
              </button>
            </div>

          </div>
        </div>
      </BookingWizardLayout>
    </PageTransition>
  );
}
