import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  MapPin, Star, Share2, Heart, ShieldCheck, Mail, Phone, Globe, X, Check, 
  Loader2, Calendar, Users, Coffee, Wifi, Sparkles, Waves, Car, ChevronLeft, ChevronRight, ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { axiosInstance } from '../api/axiosInstance';
import { mockHotels, mockRoomsByHotel } from '../utils/mockData';
import PageTransition from '../components/PageTransition';

export default function HotelDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuthStore();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Read search criteria from URL query parameters (with fallback)
  const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
  
  // Calculate tomorrow as fallback for end date
  const getTomorrowString = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  const endDate = searchParams.get('endDate') || getTomorrowString();
  const roomsCount = searchParams.get('roomsCount') || '1';

  const fetchHotelDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const payload = {
        startDate,
        endDate,
        roomsCount: parseInt(roomsCount) || 1
      };

      const response = await axiosInstance.post(`/hotels/${id}/info`, payload);

      if (response.data) {
        setHotel(response.data.hotel);
        setRooms(response.data.rooms || []);
      } else {
        fallbackToMock();
      }
    } catch (error) {
      console.warn('API error fetching hotel info, using mock fallback:', error);
      fallbackToMock();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToMock = () => {
    const foundHotel = mockHotels.find(h => h.id === parseInt(id));
    if (foundHotel) {
      setHotel(foundHotel);
      setRooms(mockRoomsByHotel[foundHotel.id] || []);
    } else {
      toast.error('Hotel not found.');
      navigate('/');
    }
  };

  useEffect(() => {
    fetchHotelDetails();
  }, [id, startDate, endDate, roomsCount]);

  const getNights = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  // Dynamic capacity suggestion based on room types
  const getRoomCapacity = (roomType) => {
    const type = roomType.toLowerCase();
    if (type.includes('suite') || type.includes('presidential') || type.includes('family')) {
      return '4 Guests';
    }
    if (type.includes('double') || type.includes('twin') || type.includes('deluxe')) {
      return '2 Guests';
    }
    if (type.includes('single') || type.includes('standard')) {
      return '1 Guest';
    }
    return '2 Guests';
  };

  // Maps amenity names to appropriate styled Lucide icons
  const getAmenityIcon = (name) => {
    const term = name.toLowerCase();
    if (term.includes('wi-fi') || term.includes('wifi') || term.includes('internet')) {
      return <Wifi className="w-4 h-4" />;
    }
    if (term.includes('pool') || term.includes('swim') || term.includes('beach')) {
      return <Waves className="w-4 h-4" />;
    }
    if (term.includes('breakfast') || term.includes('dinner') || term.includes('room service') || term.includes('restaurant')) {
      return <Coffee className="w-4 h-4" />;
    }
    if (term.includes('parking') || term.includes('valet')) {
      return <Car className="w-4 h-4" />;
    }
    return <Sparkles className="w-4 h-4" />;
  };

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleNextPhoto = () => {
    if (!hotel?.photos) return;
    setLightboxIndex((prev) => (prev + 1) % hotel.photos.length);
  };

  const handlePrevPhoto = () => {
    if (!hotel?.photos) return;
    setLightboxIndex((prev) => (prev - 1 + hotel.photos.length) % hotel.photos.length);
  };

  const handleBookClick = (room) => {
    if (!accessToken) {
      toast.error('Please log in to finalize your booking.');
      // Save current search params URL path in location state
      navigate('/login', { state: { from: location } });
      return;
    }

    // Direct booking redirection to /booking/init
    const checkInParam = startDate;
    const checkOutParam = endDate;
    const queryParams = new URLSearchParams({
      hotelId: hotel.id.toString(),
      roomId: room.id.toString(),
      checkIn: checkInParam,
      checkOut: checkOutParam,
      roomsCount: roomsCount
    }).toString();

    navigate(`/booking/init?${queryParams}`);
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-24 bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  if (!hotel) return null;

  const nights = getNights();
  const photos = hotel.photos && hotel.photos.length > 0 
    ? hotel.photos 
    : [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
      ];

  return (
    <PageTransition>
      <div className="flex-grow pb-20 bg-white">
        
        {/* Search Parameter Summary Bar */}
        <div className="bg-[#FAF5F6] border-b border-gray-150 py-3.5 sticky top-16 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-gray-700">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-1.5 text-brand hover:underline font-bold self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Listings
            </button>
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand" /> {hotel.city}</span>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand" /> {startDate} to {endDate} ({nights} Night{nights > 1 ? 's' : ''})</span>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-brand" /> {roomsCount} Room{parseInt(roomsCount) > 1 ? 's' : ''}</span>
            </div>
            <div className="hidden lg:block w-24" /> {/* Spacer */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE: Gallery (Slide-in from Left) */}
            <motion.div 
              initial={{ x: -40, opacity: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-6 space-y-3"
            >
              {/* Main large image */}
              <div 
                onClick={() => handleOpenLightbox(0)}
                className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-subtle border border-gray-100 cursor-pointer relative group"
              >
                <img
                  src={photos[0]}
                  alt={`${hotel.name} Primary`}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3.5 py-1.5 text-[10px] text-white rounded-full font-bold uppercase tracking-wider">
                  View Full Gallery
                </span>
              </div>

              {/* Thumbnails row */}
              <div className="grid grid-cols-3 gap-3">
                {photos.slice(1, 4).map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => handleOpenLightbox(index + 1)}
                    className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-subtle border border-gray-100 cursor-pointer relative group"
                  >
                    <img
                      src={photo}
                      alt={`${hotel.name} Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT SIDE: Details (Fade-in from Right) */}
            <motion.div 
              initial={{ x: 40, opacity: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
              className="lg:col-span-6 space-y-6"
            >
              {/* Hotel Header block */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight leading-none mb-3">
                  {hotel.name}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-gray-950">{hotel.rating || 4.7}</span>
                  <span>·</span>
                  <MapPin className="w-4 h-4 text-brand" />
                  <span className="font-medium text-gray-800">{hotel.city}</span>
                </div>

                {/* Amenities Icon Chips */}
                <div className="flex flex-wrap gap-2.5">
                  {hotel.amenities?.map((am, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-150 rounded-full text-xs font-semibold text-gray-600 bg-gray-50/50 shadow-subtle"
                    >
                      {getAmenityIcon(am)}
                      <span>{am}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-950 uppercase tracking-wider">About this Hotel</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {hotel.description || 'Experience verified premium comfort in our luxury hotel rooms. Featuring high-grade amenities, beautifully formatted interiors, and excellent hospitality, we ensure a memorable and relaxing check-in experience.'}
                </p>
              </div>

              <hr className="border-gray-100" />

              {/* Contact Information grid */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-950 uppercase tracking-wider">Contact & Location</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-subtle">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand flex-shrink-0" />
                    <span>{hotel.contactInfo?.phoneNumber || '+91 22 9876 5432'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand flex-shrink-0" />
                    <span className="truncate">{hotel.contactInfo?.email || 'contact@staynest.com'}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 border-t border-gray-150/40 pt-2.5 mt-1">
                    <Globe className="w-4 h-4 text-brand flex-shrink-0" />
                    <span className="truncate">Located in {hotel.city}, India</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          <hr className="border-gray-100 my-10" />

          {/* Available Rooms Section (Staggered Fade-in on view) */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-950">Available Rooms</h2>
            
            {rooms.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center shadow-subtle max-w-md mx-auto">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 mb-1">No rooms match criteria</h4>
                <p className="text-xs text-gray-500">Try modifying check-in dates or rooms count in the search criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-gray-150 rounded-3xl p-5 shadow-subtle hover:shadow-premium transition-all duration-300 flex flex-col md:flex-row gap-6"
                  >
                    {/* Room Image */}
                    <div className="w-full md:w-56 aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 shadow-subtle border border-gray-100">
                      <img
                        src={room.photos?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80'}
                        alt={room.type}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Room Details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-gray-900">{room.type}</h3>
                          <span className="text-[10px] font-extrabold text-brand bg-brand/10 border border-brand/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {getRoomCapacity(room.type)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {room.amenities?.map((am, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded px-2 py-0.5"
                            >
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing and Action */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none mb-0.5">Price / night</span>
                          <span className="text-xl font-black text-brand">₹{room.price.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-500">/ night</span>
                        </div>
                        <button
                          onClick={() => handleBookClick(room)}
                          className="bg-brand hover:bg-brand-dark text-white text-xs font-bold px-6 py-3 rounded-2xl transition-all shadow-subtle hover:shadow-md cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Lightbox Modal Carousel */}
        <AnimatePresence>
          {isLightboxOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLightboxOpen(false)}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8"
              >
                {/* Lightbox container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
                >
                  {/* Close icon */}
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Left arrow */}
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 sm:-left-12 p-2.5 text-white hover:text-gray-300 bg-black/30 hover:bg-black/55 rounded-full transition-colors cursor-pointer z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Main active photo */}
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl">
                    <motion.img
                      key={lightboxIndex}
                      src={photos[lightboxIndex]}
                      alt={`${hotel.name} Gallery ${lightboxIndex + 1}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="max-w-full max-h-[75vh] object-contain select-none"
                    />
                  </div>

                  {/* Right arrow */}
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 sm:-right-12 p-2.5 text-white hover:text-gray-300 bg-black/30 hover:bg-black/55 rounded-full transition-colors cursor-pointer z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Photo counter footer */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-400">
                    {lightboxIndex + 1} of {photos.length}
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
