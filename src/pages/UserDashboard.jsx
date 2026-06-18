import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, User, ArrowRight, Building, Plus, Compass, Star, Heart, MapPin, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { axiosInstance } from '../api/axiosInstance';
import PageTransition from '../components/PageTransition';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [guestsCount, setGuestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axiosInstance.get('/hotels');
        setRecommendations(response.data || []);
      } catch (error) {
        console.error('Error fetching popular recommendations in dashboard:', error);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecommendations();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user's bookings
        const bookingsRes = await axiosInstance.get('/users/myBookings');
        setBookings(bookingsRes.data || []);
        
        // Fetch user's guests count
        const guestsRes = await axiosInstance.get('/users/guests');
        setGuestsCount((guestsRes.data || []).length);
      } catch (error) {
        console.warn('API error in user dashboard, falling back to local mocks:', error);
        // Fallback mock calculations
        setBookings([]);
        setGuestsCount(2); // default mock guest count
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.checkInDate >= today && b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'EXPIRED';
  });

  return (
    <PageTransition>
      <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-brand to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-premium relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              User Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Guest'}!
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 max-w-md">
              Find your next destination, check active stay dates, or configure companion profiles.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-y-4 translate-x-4">
            <Building className="w-56 h-56" />
          </div>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 shadow-subtle flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-brand/10 text-brand">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-wider block">Upcoming Stays</span>
              <h3 className="text-xl font-black text-gray-950 dark:text-white mt-1">
                {upcomingBookings.length} Active
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 shadow-subtle flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-brand/10 text-brand">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-wider block">Saved Guests</span>
              <h3 className="text-xl font-black text-gray-950 dark:text-white mt-1">
                {guestsCount} Companions
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 shadow-subtle flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-brand/10 text-brand">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-wider block">Account Identity</span>
              <h3 className="text-sm font-bold text-gray-950 dark:text-white mt-1 truncate max-w-[150px]">
                {user?.email}
              </h3>
            </div>
          </div>

        </div>

        {/* Two-Column Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Upcoming Bookings List */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 shadow-subtle space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-950 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" /> Upcoming Reservations
              </h2>
              <Link 
                to="/my-bookings" 
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="animate-pulse flex gap-4 p-4 border border-gray-100 dark:border-slate-700 rounded-2xl">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
                    <div className="flex-grow space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-slate-900/40 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                <Compass className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-gray-550 dark:text-slate-400 text-sm font-semibold mb-1">No upcoming reservations</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">You have no active stays scheduled. Plan your next adventure now!</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-xs shadow-subtle cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book a Stay</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    className="p-4 border border-gray-100 dark:border-slate-700 hover:border-brand/35 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-900/20 transition-all bg-white dark:bg-slate-800"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">
                        {b.hotel?.name || b.hotelName || `Booking #${b.id}`}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-brand" />
                        {b.checkInDate} to {b.checkOutDate} · {b.roomsCount} Room{b.roomsCount > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        {b.bookingStatus}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Quick Action Portals */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 shadow-subtle space-y-6">
            <h2 className="text-lg font-black text-gray-950 dark:text-white">Quick Portals</h2>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/')}
                className="w-full text-left p-4 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-brand/40 bg-gray-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="p-2.5 rounded-xl bg-brand text-white group-hover:scale-110 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider">Explore Hotels</h4>
                  <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 font-semibold">Find and browse active deals</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/guests')}
                className="w-full text-left p-4 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-brand/40 bg-gray-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="p-2.5 rounded-xl bg-brand text-white group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider">Saved Guests</h4>
                  <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 font-semibold">Pre-register your companions</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-full text-left p-4 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-brand/40 bg-gray-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="p-2.5 rounded-xl bg-brand text-white group-hover:scale-110 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider">My Profile</h4>
                  <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 font-semibold">Adjust details and settings</p>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Popular Recommendations Section */}
        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 shadow-subtle space-y-6">
          <h2 className="text-lg font-black text-gray-950 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand animate-pulse" /> Popular Recommendations
          </h2>

          {loadingRecs ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-slate-900/40 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
              <Compass className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">No properties recommended yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map((hotel) => (
                <div
                  key={hotel.id}
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                  className="group cursor-pointer rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-brand/30 bg-white dark:bg-slate-900 overflow-hidden shadow-subtle hover:shadow-premium transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-slate-800 relative">
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
                      className="absolute top-2.5 right-2.5 bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-800 p-1.5 rounded-full backdrop-blur-sm shadow-subtle transition-all cursor-pointer text-gray-500 hover:text-brand dark:text-slate-300 dark:hover:text-brand"
                    >
                      <Heart className="w-3.5 h-3.5 fill-transparent" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-1 mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-brand transition-colors">
                        {hotel.name}
                      </h4>
                      <div className="flex items-center gap-0.5 text-xs font-semibold text-gray-800 dark:text-slate-200 flex-shrink-0">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>4.7</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3 text-gray-400" /> {hotel.city}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {hotel.amenities?.slice(0, 2).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-bold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded px-1.5 py-0.5"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
