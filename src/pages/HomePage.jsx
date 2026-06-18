import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Compass, Shield, HelpCircle, Star, Heart, Loader2, Sparkles } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { axiosInstance } from '../api/axiosInstance';

// Custom hook to type and cycle placeholder suggestions letter-by-letter
function useTypingPlaceholder(strings, speed = 80, delay = 3000) {
  const [placeholder, setPlaceholder] = useState('');
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentString = strings[stringIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setPlaceholder(currentString.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, speed / 2);
    } else {
      timer = setTimeout(() => {
        setPlaceholder(currentString.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, speed);
    }

    if (!isDeleting && charIndex === currentString.length) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setStringIndex((prev) => (prev + 1) % strings.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, stringIndex, strings, speed, delay]);

  return placeholder;
}

const destinationSuggestions = [
  { name: 'Mumbai', img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80', description: 'Financial Capital & Beaches' },
  { name: 'Goa', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80', description: 'Tropical Paradise & Nightlife' },
  { name: 'Manali', img: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=400&q=80', description: 'Snowy Retreat & Adventure' },
  { name: 'Jaipur', img: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcRR97FQjhVYQPeeLpT4WAuRjyGd0eEm6yVLUfb8FJQSftbjW8r55hS1YjdtLuGYADk-8S3v7DHDFWoDJMLpiMQz3wQ&s=19', description: 'Palace Heritage & Culture' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchModeParam = searchParams.get('searchMode');

  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomsCount, setRoomsCount] = useState(1);

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const [searchMode, setSearchMode] = useState('city');
  const [aiQuery, setAiQuery] = useState('');

  const placeholderText = useTypingPlaceholder([
    "luxury hotel with rooftop pool...",
    "budget stay near old city...",
    "hill station with mountain view...",
    "beach resort with spa..."
  ]);

  const handleAiSearchSubmit = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    navigate(`/hotels/search?mode=ai&query=${encodeURIComponent(aiQuery.trim())}`);
  };

  // Sync searchMode from URL param if set
  useEffect(() => {
    if (searchModeParam === 'ai') {
      setSearchMode('ai');
      const el = document.getElementById('hero-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchModeParam]);

  // Default date values
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Fetch active hotels on mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axiosInstance.get('/hotels');
        setRecommendations(response.data || []);
      } catch (error) {
        console.error('Error fetching popular recommendations:', error);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      city: city.trim(),
      startDate,
      endDate,
      roomsCount: roomsCount.toString()
    }).toString();
    navigate(`/hotels/search?${queryParams}`);
  };

  const handleSuggestClick = (cityName) => {
    const queryParams = new URLSearchParams({
      city: cityName,
      startDate,
      endDate,
      roomsCount: roomsCount.toString()
    }).toString();
    navigate(`/hotels/search?${queryParams}`);
  };

  return (
    <PageTransition>
      <div id="hero-section" className="flex-grow flex flex-col relative overflow-hidden bg-white">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-rose-200/20 blur-3xl" />
        </div>

        {/* Hero Section */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-16 sm:py-24 max-w-7xl mx-auto w-full text-center">
          
          {/* Animated Headline & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl mx-auto mb-10"
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-none mb-6">
              Find your <span className="text-brand">perfect stay</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 font-medium max-w-xl mx-auto leading-relaxed">
              Discover verified accommodations, luxury resorts, and cozy mountain chalets near you at guaranteed low prices.
            </p>
          </motion.div>

          {/* Toggle Tab */}
          <div className="flex space-x-2 mb-6 bg-gray-100 p-1.5 rounded-2xl w-fit relative z-10">
            <button
              type="button"
              onClick={() => setSearchMode('city')}
              className={`relative px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                searchMode === 'city' ? 'text-gray-900 font-extrabold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {searchMode === 'city' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-200/50"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">🏙️ Search by City</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('ai')}
              className={`relative px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                searchMode === 'ai' ? 'text-gray-900 font-extrabold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {searchMode === 'ai' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-200/50"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                🤖 AI Smart Search 
                <Sparkles className="w-3 h-3 text-purple-600 fill-purple-600/20" />
              </span>
            </button>
          </div>

          {/* Search Form Card */}
          <AnimatePresence mode="wait">
            {searchMode === 'city' ? (
              <motion.div
                key="city-search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-full shadow-premium hover:shadow-premium-hover border border-gray-150 p-5 sm:p-4 text-left transition-all mb-16 relative z-10"
              >
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-0 items-center">
                  
                  {/* City */}
                  <div className="sm:col-span-4 px-4 sm:border-r border-gray-100 flex flex-col">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand" /> City / Destination
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Where are you going?"
                      className="w-full text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent py-1"
                      required
                    />
                  </div>

                  {/* Check-In */}
                  <div className="sm:col-span-3 px-4 sm:border-r border-gray-100 flex flex-col">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand" /> Check In
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-sm font-semibold text-gray-700 bg-transparent py-1 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Check-Out */}
                  <div className="sm:col-span-3 px-4 sm:border-r border-gray-100 flex flex-col">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand" /> Check Out
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-sm font-semibold text-gray-700 bg-transparent py-1 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Rooms */}
                  <div className="sm:col-span-2 px-4 flex sm:flex-row justify-between items-center gap-3">
                    <div className="flex flex-col flex-grow">
                      <label className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-brand" /> Rooms
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={roomsCount}
                        onChange={(e) => setRoomsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-sm font-semibold text-gray-700 bg-transparent focus:outline-none py-1"
                        required
                      />
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="bg-brand hover:bg-brand-dark text-white p-3.5 rounded-full transition-all shadow-subtle hover:shadow-md cursor-pointer flex-shrink-0"
                    >
                      <Search className="w-5 h-5" />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="ai-search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-full shadow-premium hover:shadow-premium-hover border border-gray-150 p-5 sm:p-4 text-left transition-all mb-16 relative z-10"
              >
                <form onSubmit={handleAiSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-grow flex items-center gap-3 px-4 w-full">
                    <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder={placeholderText ? `Try: "${placeholderText}"` : 'Describe your stay vibe...'}
                      className="w-full text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent py-2.5"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#FF385C] to-[#7C3AED] hover:opacity-95 text-white rounded-2xl sm:rounded-full text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    Search with AI <Sparkles className="w-4 h-4" />
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Suggestions / Explore Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full max-w-4xl mx-auto"
          >
            <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider mb-6">Popular Destinations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {destinationSuggestions.map((dest) => (
                <motion.div
                  key={dest.name}
                  onClick={() => handleSuggestClick(dest.name)}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group cursor-pointer rounded-2xl overflow-hidden shadow-subtle border border-gray-100 hover:border-brand/30 bg-white text-left"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-50 relative">
                    <img 
                      src={dest.img} 
                      alt={dest.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-white font-bold text-sm tracking-tight">{dest.name}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-gray-500 font-medium line-clamp-1">{dest.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Popular Recommendations Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="w-full max-w-4xl mx-auto mt-16 text-left"
          >
            <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider mb-6 text-center sm:text-left">Popular Recommendations</h3>
            
            {loadingRecs ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl bg-gray-50/50">
                <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">No recommended properties listed yet</p>
                <p className="text-xs text-gray-400 mt-1">Properties added by administrators will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {recommendations.slice(0, 3).map((hotel) => (
                  <motion.div
                    key={hotel.id}
                    onClick={() => navigate(`/hotels/${hotel.id}`)}
                    whileHover={{ y: -8, scale: 1.01, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)' }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    className="group bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-subtle cursor-pointer flex flex-col"
                  >
                    {/* Photo */}
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={hotel.photos && hotel.photos.length > 0 ? hotel.photos[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="absolute top-3 right-3 bg-white/70 hover:bg-white p-2 rounded-full backdrop-blur-sm shadow-subtle transition-all cursor-pointer text-gray-500 hover:text-brand"
                      >
                        <Heart className="w-3.5 h-3.5 fill-transparent" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-brand transition-colors line-clamp-1">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs font-semibold text-gray-800 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>4.7</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-550 mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" /> {hotel.city}
                      </p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-2 mt-auto">
                        {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Feature Highlights bar */}
        <div className="bg-gray-50/70 border-t border-gray-150 py-10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="bg-brand/10 p-3 rounded-2xl text-brand">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Wide Accommodation Range</h4>
                <p className="text-xs text-gray-500 leading-normal">From luxury penthouses to cozy mountainside chalets, find stays matching any theme.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="bg-brand/10 p-3 rounded-2xl text-brand">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Secure & Safe Bookings</h4>
                <p className="text-xs text-gray-500 leading-normal">Stripe checkout integrations protect your transaction and booking security.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="bg-brand/10 p-3 rounded-2xl text-brand">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Dedicated Customer Support</h4>
                <p className="text-xs text-gray-500 leading-normal">Our team is available round the clock to ensure your check-in remains seamless.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
