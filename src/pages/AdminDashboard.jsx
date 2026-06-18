import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Building2, Plus, MapPin, Mail, Phone, Trash2, Edit, BedDouble, CalendarRange, Power, AlertTriangle, Loader2 } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockHotels } from '../utils/mockData';
import PageTransition from '../components/PageTransition';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/hotels');
      // Set fetched data, default active to true if missing
      const data = (response.data || []).map(h => ({ ...h, active: h.active !== false }));
      setHotels(data);
    } catch (error) {
      console.warn('API error fetching admin hotels, falling back to mock hotels:', error);
      // Simulate that this manager owns a subset or all mock hotels in development
      const fallbackData = mockHotels.map(h => ({
        ...h,
        active: h.active !== false // assume active by default
      }));
      setHotels(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleToggleActive = async (hotelId, currentStatus) => {
    setTogglingId(hotelId);
    const toastId = toast.loading('Toggling active status...');
    try {
      await axiosInstance.patch(`/admin/hotels/${hotelId}/activate`);
      setHotels(prev =>
        prev.map(h => h.id === hotelId ? { ...h, active: !currentStatus } : h)
      );
      toast.success(`Hotel ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, { id: toastId });
    } catch (error) {
      console.error('Failed to toggle status:', error);
      // Fallback update for mock simulation
      setHotels(prev =>
        prev.map(h => h.id === hotelId ? { ...h, active: !currentStatus } : h)
      );
      toast.success(`Hotel ${!currentStatus ? 'activated' : 'deactivated'} (offline simulation).`, { id: toastId });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteTrigger = (hotelId) => {
    setDeleteConfirmId(hotelId);
  };

  const confirmDeleteHotel = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting hotel record...');
    try {
      await axiosInstance.delete(`/admin/hotels/${deleteConfirmId}`);
      setHotels(prev => prev.filter(h => h.id !== deleteConfirmId));
      toast.success('Hotel record deleted successfully.', { id: toastId });
    } catch (error) {
      console.error('Delete hotel failed:', error);
      // Fallback delete
      setHotels(prev => prev.filter(h => h.id !== deleteConfirmId));
      toast.success('Hotel record deleted (offline simulation).', { id: toastId });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Manage Hotels</h1>
            <p className="text-sm text-gray-500">Create, edit, and coordinate listings for your hotel brand</p>
          </div>
          <Link
            to="/admin/hotels/new"
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold px-4 py-3 rounded-xl text-xs transition-all shadow-subtle hover:shadow-md cursor-pointer self-start sm:self-auto uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hotel</span>
          </Link>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-150 p-8 shadow-subtle max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-950 mb-1">No hotels listed yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by registering your first hotel property onto BookNearMe!
            </p>
            <Link
              to="/admin/hotels/new"
              className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              <span>Register Property</span>
            </Link>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {hotels.map((hotel) => (
              <motion.div
                key={hotel.id}
                variants={cardVariants}
                className="bg-white rounded-3xl border border-gray-150 shadow-subtle overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
              >
                {/* Photo Header */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={hotel.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                      hotel.active 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {hotel.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-950 text-lg group-hover:text-brand transition-colors line-clamp-1">
                      {hotel.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                      <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
                      <span>{hotel.city}</span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-650">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{hotel.contactInfo?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-655">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{hotel.contactInfo?.phoneNumber || hotel.contactInfo?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    {/* Management Navigation */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/admin/hotels/${hotel.id}/rooms`}
                        className="flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-brand hover:text-white border border-gray-200 text-gray-700 font-bold py-2 rounded-xl text-[11px] transition-all cursor-pointer shadow-sm hover:border-brand"
                      >
                        <BedDouble className="w-3.5 h-3.5" />
                        <span>Manage Rooms</span>
                      </Link>
                      <Link
                        to={`/admin/hotels/${hotel.id}/bookings`}
                        className="flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-brand hover:text-white border border-gray-200 text-gray-700 font-bold py-2 rounded-xl text-[11px] transition-all cursor-pointer shadow-sm hover:border-brand"
                      >
                        <CalendarRange className="w-3.5 h-3.5" />
                        <span>Bookings</span>
                      </Link>
                    </div>

                    {/* Modification Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleToggleActive(hotel.id, hotel.active)}
                        disabled={togglingId === hotel.id}
                        className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 ${
                          hotel.active ? 'text-rose-500 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                        title={hotel.active ? 'Deactivate listing' : 'Activate listing'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{hotel.active ? 'Deactivate' : 'Activate'}</span>
                      </button>

                      <div className="flex items-center gap-2.5">
                        <Link
                          to={`/admin/hotels/${hotel.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit hotel details"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteTrigger(hotel.id)}
                          className="p-1.5 text-gray-450 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete hotel property"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 p-6 text-center space-y-6 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-950 mb-1.5">Delete Property Listing</h3>
                <p className="text-xs text-gray-500 leading-normal max-w-xs mx-auto">
                  Are you sure you want to completely delete this hotel listing? This will also purge associated rooms and bookings.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteHotel}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-650 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-subtle cursor-pointer flex justify-center items-center gap-1 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
