import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, MapPin, Calendar, Users, Star, Heart, AlertCircle, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockHotels } from '../utils/mockData';
import PageTransition from '../components/PageTransition';

// Animations variants for staggered search results
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05, // 50ms delay per card
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: 'easeOut' } 
  },
};

export default function HotelSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read URL query params
  const modeQuery = searchParams.get('mode') || 'normal';
  const queryQuery = searchParams.get('query') || '';
  const cityQuery = searchParams.get('city') || '';
  
  // Calculate today and tomorrow default dates
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const startDateQuery = searchParams.get('startDate') || getTodayString();
  const endDateQuery = searchParams.get('endDate') || getTomorrowString();
  const roomsCountQuery = searchParams.get('roomsCount') || '1';

  // Sticky search bar input states
  const [inputCity, setInputCity] = useState(cityQuery);
  const [inputStartDate, setInputStartDate] = useState(startDateQuery);
  const [inputEndDate, setInputEndDate] = useState(endDateQuery);
  const [inputRoomsCount, setInputRoomsCount] = useState(parseInt(roomsCountQuery) || 1);
  const [inputQuery, setInputQuery] = useState(queryQuery);

  // Listing data states
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  // Sync inputs with URL params if they change
  useEffect(() => {
    setInputCity(cityQuery);
    setInputStartDate(startDateQuery);
    setInputEndDate(endDateQuery);
    setInputRoomsCount(parseInt(roomsCountQuery) || 1);
    setInputQuery(queryQuery);
  }, [cityQuery, startDateQuery, endDateQuery, roomsCountQuery, queryQuery]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      if (modeQuery === 'ai') {
        const payload = {
          query: queryQuery.trim(),
          page: currentPage,
          size: pageSize,
        };

        const response = await axiosInstance.post('/hotels/semantic-search', payload);

        if (response.data && response.data.content) {
          setHotels(response.data.content);
          setTotalPages(response.data.totalPages || 0);
          setTotalElements(response.data.totalElements || 0);
        } else {
          fallbackToMockListings();
        }
      } else {
        const payload = {
          city: cityQuery.trim() || null,
          startDate: startDateQuery || null,
          endDate: endDateQuery || null,
          roomsCount: parseInt(roomsCountQuery) || 1,
          page: currentPage,
          size: pageSize,
        };

        const response = await axiosInstance.post('/hotels/search', payload);

        if (response.data && response.data.content) {
          setHotels(response.data.content);
          setTotalPages(response.data.totalPages || 0);
          setTotalElements(response.data.totalElements || 0);
        } else {
          fallbackToMockListings();
        }
      }
    } catch (error) {
      console.warn('API listings query failed, falling back to mock search:', error);
      fallbackToMockListings();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToMockListings = () => {
    let filtered = [...mockHotels];
    if (modeQuery === 'ai') {
      if (queryQuery.trim()) {
        const cleanQuery = queryQuery.toLowerCase().trim();
        filtered = mockHotels.filter((h) => {
          const matchesCity = h.city.toLowerCase().includes(cleanQuery);
          const matchesName = h.name.toLowerCase().includes(cleanQuery);
          const matchesAmenities = h.amenities?.some((a) => a.toLowerCase().includes(cleanQuery));
          const matchesDesc = h.description?.toLowerCase().includes(cleanQuery);
          return matchesCity || matchesName || matchesAmenities || matchesDesc;
        });
      }
    } else {
      if (cityQuery.trim()) {
        filtered = mockHotels.filter((h) =>
          h.city.toLowerCase().includes(cityQuery.toLowerCase().trim())
        );
      }
    }

    // Paginate manually
    const totalCount = filtered.length;
    const startIdx = currentPage * pageSize;
    const paginatedItems = filtered.slice(startIdx, startIdx + pageSize);

    setHotels(paginatedItems);
    setTotalPages(Math.ceil(totalCount / pageSize));
    setTotalElements(totalCount);
  };

  // Fetch when query criteria or pages change
  useEffect(() => {
    fetchListings();
  }, [cityQuery, startDateQuery, endDateQuery, roomsCountQuery, queryQuery, modeQuery, currentPage]);

  const handleUpdateSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0); // Reset page on new search criteria
    if (modeQuery === 'ai') {
      if (!inputQuery.trim()) {
        toast.error('Please enter a description for AI search.');
        return;
      }
      setSearchParams({
        mode: 'ai',
        query: inputQuery.trim(),
      });
    } else {
      if (!inputCity.trim()) {
        toast.error('Please specify a destination city.');
        return;
      }
      setSearchParams({
        city: inputCity.trim(),
        startDate: inputStartDate,
        endDate: inputEndDate,
        roomsCount: inputRoomsCount.toString(),
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCardClick = (hotelId) => {
    navigate(`/hotels/${hotelId}?startDate=${startDateQuery}&endDate=${endDateQuery}&roomsCount=${roomsCountQuery}`);
  };

  return (
    <PageTransition>
      <div className="flex-grow pb-16 bg-[#FAFAFA]">
        {/* Slow Spin Animation CSS */}
        <style>{`
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spinSlow 12s linear infinite;
          }
          @keyframes bounceDot {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .animate-bounce-dot {
            animation: bounceDot 1.2s infinite ease-in-out;
          }
        `}</style>
        
        {/* Sticky Search Sub-header bar */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Toggle Search Mode */}
            <div className="flex space-x-2 mb-3 bg-gray-100 p-1 rounded-xl w-fit relative z-10">
              <button
                type="button"
                onClick={() => {
                  setSearchParams({
                    city: cityQuery || 'Mumbai',
                    startDate: startDateQuery,
                    endDate: endDateQuery,
                    roomsCount: roomsCountQuery
                  });
                }}
                className={`relative px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  modeQuery !== 'ai' ? 'text-gray-900 font-extrabold bg-white shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>🏙️ City Search</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchParams({
                    mode: 'ai',
                    query: queryQuery || 'luxury with pool'
                  });
                }}
                className={`relative px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  modeQuery === 'ai' ? 'text-gray-900 font-extrabold bg-white shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1">
                  🤖 AI Search <Sparkles className="w-2.5 h-2.5 text-purple-600 fill-purple-600/20" />
                </span>
              </button>
            </div>

            <form onSubmit={handleUpdateSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {modeQuery === 'ai' ? (
                <>
                  {/* AI input spanning 10 columns */}
                  <div className="sm:col-span-10 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse flex-shrink-0" />
                    <div className="flex-grow">
                      <span className="text-[9px] text-purple-600 font-bold uppercase tracking-wider block leading-none">AI Smart Search</span>
                      <input
                        type="text"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        placeholder="Describe your stay vibe (e.g., hill station vibe, luxury with pool)..."
                        className="w-full text-xs font-semibold text-gray-700 bg-transparent focus:outline-none mt-0.5"
                        required
                      />
                    </div>
                  </div>
                  {/* Search Button spanning 2 columns */}
                  <div className="sm:col-span-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-[#FF385C] to-[#7C3AED] hover:opacity-95 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-subtle hover:shadow-md cursor-pointer"
                    >
                      Search <Sparkles className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  {/* Destination */}
                  <div className="sm:col-span-4 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                    <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
                    <div className="flex-grow">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block leading-none">Destination</span>
                      <input
                        type="text"
                        value={inputCity}
                        onChange={(e) => setInputCity(e.target.value)}
                        placeholder="Where to?"
                        className="w-full text-xs font-semibold text-gray-700 bg-transparent focus:outline-none mt-0.5"
                        required
                      />
                    </div>
                  </div>

                  {/* Check-In */}
                  <div className="sm:col-span-3 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                    <Calendar className="w-4 h-4 text-brand flex-shrink-0" />
                    <div className="flex-grow">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block leading-none">Check-in</span>
                      <input
                        type="date"
                        value={inputStartDate}
                        onChange={(e) => setInputStartDate(e.target.value)}
                        className="w-full text-xs font-semibold text-gray-700 bg-transparent focus:outline-none mt-0.5"
                        required
                      />
                    </div>
                  </div>

                  {/* Check-Out */}
                  <div className="sm:col-span-3 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                    <Calendar className="w-4 h-4 text-brand flex-shrink-0" />
                    <div className="flex-grow">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block leading-none">Check-out</span>
                      <input
                        type="date"
                        value={inputEndDate}
                        onChange={(e) => setInputEndDate(e.target.value)}
                        className="w-full text-xs font-semibold text-gray-700 bg-transparent focus:outline-none mt-0.5"
                        required
                      />
                    </div>
                  </div>

                  {/* Rooms & Search button */}
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <div className="flex-grow flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                      <Users className="w-4 h-4 text-brand flex-shrink-0" />
                      <div className="flex-grow">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block leading-none">Rooms</span>
                        <input
                          type="number"
                          min="1"
                          value={inputRoomsCount}
                          onChange={(e) => setInputRoomsCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full text-xs font-semibold text-gray-700 bg-transparent focus:outline-none mt-0.5"
                          required
                        />
                      </div>
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="bg-brand hover:bg-brand-dark text-white p-3 rounded-xl transition-all shadow-subtle hover:shadow-md cursor-pointer flex-shrink-0"
                    >
                      <Search className="w-4 h-4" />
                    </motion.button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Listings Result layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          
          {/* Summary line */}
          <div className="flex justify-between items-center mb-6">
            {modeQuery === 'ai' ? (
              <div>
                <h2 className="text-xl font-black bg-gradient-to-r from-[#FF385C] to-[#7C3AED] bg-clip-text text-transparent flex items-center gap-2">
                  AI Smart Search Results <Sparkles className="w-5 h-5 text-purple-600 animate-pulse fill-purple-600/10" />
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Found {totalElements} stay{totalElements === 1 ? '' : 's'} matching "{queryQuery}"
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Stays in <span className="text-brand capitalize">{cityQuery}</span>
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {startDateQuery && endDateQuery ? `${startDateQuery} to ${endDateQuery} · ` : ''}
                  {roomsCountQuery} room{parseInt(roomsCountQuery) > 1 ? 's' : ''}
                </p>
              </div>
            )}
            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-150 rounded-lg px-3 py-1.5 shadow-subtle flex items-center gap-1.5">
              {modeQuery === 'ai' && <Sparkles className="w-3.5 h-3.5 text-purple-500 fill-purple-500/15" />}
              {totalElements} stays available
            </span>
          </div>

          {/* AI Banner */}
          {modeQuery === 'ai' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-6 bg-gradient-to-r from-[#7C3AED] to-[#FF385C] rounded-2xl p-4 flex items-center justify-between shadow-md text-white"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl text-white shadow-inner flex-shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm leading-tight">AI Smart Match</h3>
                  <p className="text-xs font-semibold text-white/95 mt-0.5">
                    AI found {totalElements} hotel{totalElements === 1 ? '' : 's'} matching "{queryQuery}"
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1">
                Gemini AI ✨
              </span>
            </motion.div>
          )}

          {/* Loaders or Listings */}
          {loading ? (
            modeQuery === 'ai' ? (
              /* Custom Sparkle Loader */
              <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-150 rounded-3xl shadow-subtle p-8 max-w-md mx-auto mt-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FF385C] border-r-[#7C3AED] border-b-purple-350"
                  />
                  <motion.div
                    animate={{ rotate: -360, scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="text-purple-600"
                  >
                    <Sparkles className="w-8 h-8 fill-purple-600/10" />
                  </motion.div>
                </div>
                <h3 className="text-base font-black text-gray-950 mt-6 mb-1">StayEase AI is searching...</h3>
                <p className="text-xs text-gray-550 text-center leading-relaxed max-w-xs">
                  We're scanning our descriptions, amenities, and locations to find your perfect vibe.
                </p>
                <div className="mt-4 flex gap-1 justify-center">
                  <div className="w-1.5 h-1.5 bg-[#FF385C] rounded-full animate-bounce-dot" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce-dot" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : (
              /* Skeleton Loaders */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="animate-pulse flex flex-col gap-3">
                    <div className="bg-gray-200 aspect-[4/3] rounded-2xl w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4 mt-1"></div>
                  </div>
                ))}
              </div>
            )
          ) : hotels.length === 0 ? (
            /* Animated Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-20 bg-white border border-gray-150 rounded-3xl shadow-subtle p-8 max-w-md mx-auto mt-10"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0], y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}
                className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-5"
              >
                <AlertCircle className="w-8 h-8" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No stays match your criteria</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto mb-6">
                {modeQuery === 'ai'
                  ? "AI couldn't find exact matches. Try different words or use city search."
                  : `We couldn't find any rooms in "${cityQuery}". Try looking up "Mumbai", "Goa", or "Manali" for working models.`
                }
              </p>
              <button
                onClick={() => {
                  if (modeQuery === 'ai') {
                    // Switch back to City Search (Normal Mode)
                    setSearchParams({
                      city: cityQuery || 'Mumbai',
                      startDate: startDateQuery,
                      endDate: endDateQuery,
                      roomsCount: roomsCountQuery
                    });
                  } else {
                    setInputCity('Mumbai');
                    setSearchParams({
                      city: 'Mumbai',
                      startDate: inputStartDate,
                      endDate: inputEndDate,
                      roomsCount: inputRoomsCount.toString(),
                    });
                  }
                }}
                className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all shadow-subtle cursor-pointer"
              >
                {modeQuery === 'ai' ? 'Switch to City Search 🏙️' : 'Search Mumbai'}
              </button>
            </motion.div>
          ) : (
            /* Staggered Cards Grid */
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {hotels.map((hotel) => (
                  <motion.div
                    key={hotel.id}
                    variants={cardVariants}
                    onClick={() => handleCardClick(hotel.id)}
                    whileHover={
                      modeQuery === 'ai'
                        ? { y: -8, scale: 1.01, boxShadow: '0 20px 25px -5px rgba(124, 58, 237, 0.15), 0 8px 10px -6px rgba(124, 58, 237, 0.15)', borderColor: 'rgba(124, 58, 237, 0.3)' }
                        : { y: -8, scale: 1.01, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)' }
                    }
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    className="group bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-subtle cursor-pointer flex flex-col"
                  >
                    {/* Thumbnail Photo */}
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      {modeQuery === 'ai' && (
                        <>
                          <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#FF385C] to-[#7C3AED] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            AI Matched <Sparkles className="w-2.5 h-2.5 fill-white/20 animate-pulse" />
                          </span>
                          <span 
                            style={{
                              background: 'linear-gradient(var(--card-bg), var(--card-bg)) padding-box, linear-gradient(135deg, #FF385C, #7C3AED) border-box',
                              border: '1.5px solid transparent',
                              borderRadius: '9999px'
                            }}
                            className="absolute top-3 right-12 z-10 text-purple-700 dark:text-purple-300 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 shadow-sm flex items-center gap-0.5"
                          >
                            ✨ AI Pick
                          </span>
                        </>
                      )}
                      <img
                        src={
                          hotel.photos && hotel.photos.length > 0
                            ? hotel.photos[0]
                            : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle wish list
                        }}
                        className="absolute top-3 right-3 bg-white/70 hover:bg-white p-2 rounded-full backdrop-blur-sm shadow-subtle transition-all cursor-pointer text-gray-600 hover:text-brand"
                      >
                        <Heart className="w-3.5 h-3.5 fill-transparent" />
                      </button>
                    </div>

                    {/* Description Block */}
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-brand transition-colors line-clamp-1">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs font-semibold text-gray-800 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{hotel.rating || 4.7}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-550 mb-3.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" /> {hotel.city}
                      </p>

                      {/* Amenities pills */}
                      <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                        {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5"
                          >
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities?.length > 3 && (
                          <span className="text-[9px] font-bold text-gray-400 py-0.5 px-1">
                            +{hotel.amenities.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-black text-brand">₹{(hotel.price || 5000).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-gray-400">/ night</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12 border-t border-gray-100 pt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-gray-650">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

