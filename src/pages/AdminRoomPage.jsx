import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { BedDouble, Plus, Edit, Trash2, CalendarRange, X, Save, ArrowLeft, Loader2, DollarSign, Users } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockRoomsByHotel, mockHotels } from '../utils/mockData';
import PageTransition from '../components/PageTransition';

const AVAILABLE_ROOM_AMENITIES = [
  "King Bed",
  "Queen Bed",
  "Double Bed",
  "Sea View",
  "Mountain View",
  "Garden View",
  "Private Balcony",
  "Mini-bar",
  "Espresso Machine",
  "Hammock",
  "Outdoor Shower",
  "Wood Fireplace",
  "Sun Deck",
  "En-suite Jacuzzi"
];

export default function AdminRoomPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotelName, setHotelName] = useState('Hotel Properties');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Modal States
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit' | null
  const [editingRoom, setEditingRoom] = useState(null);

  // Form Fields
  const [roomType, setRoomType] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [totalCount, setTotalCount] = useState(5);
  const [photos, setPhotos] = useState([]);
  const [photoInput, setPhotoInput] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Deletion State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      // Fetch hotel name first
      let hotelData = mockHotels.find(h => h.id === parseInt(hotelId));
      if (hotelData) {
        setHotelName(hotelData.name);
      }

      const response = await axiosInstance.get(`/admin/hotels/${hotelId}/rooms`);
      setRooms(response.data || []);
    } catch (error) {
      console.warn('API error fetching rooms, using local mocks:', error);
      // Fallback
      const mocks = mockRoomsByHotel[hotelId] || [];
      // Mock DTO mapping if fields like capacity / totalCount are missing
      const formattedMocks = mocks.map(r => ({
        ...r,
        capacity: r.capacity || 2,
        totalCount: r.totalCount || 10
      }));
      setRooms(formattedMocks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setRoomType('');
    setBasePrice('');
    setCapacity(2);
    setTotalCount(5);
    setPhotos([]);
    setPhotoInput('');
    setSelectedAmenities([]);
    setActiveModal('create');
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setRoomType(room.type || '');
    setBasePrice(room.price || room.basePrice || '');
    setCapacity(room.capacity || 2);
    setTotalCount(room.totalCount || 5);
    setPhotos(room.photos || []);
    setPhotoInput('');
    setSelectedAmenities(room.amenities || []);
    setActiveModal('edit');
  };

  const handleAddPhoto = () => {
    if (!photoInput.trim()) return;
    setPhotos(prev => [...prev, photoInput.trim()]);
    setPhotoInput('');
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!roomType.trim() || !basePrice) {
      toast.error('Please enter a room type and base price.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(editingRoom ? 'Saving room edits...' : 'Creating new room category...');

    const payload = {
      type: roomType.trim(),
      basePrice: parseFloat(basePrice),
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'],
      amenities: selectedAmenities,
      totalCount: parseInt(totalCount),
      capacity: parseInt(capacity)
    };

    try {
      if (editingRoom) {
        // PUT /admin/hotels/:hotelId/rooms/:roomId
        await axiosInstance.put(`/admin/hotels/${hotelId}/rooms/${editingRoom.id}`, payload);
        
        setRooms(prev =>
          prev.map(r => r.id === editingRoom.id ? { ...r, ...payload, price: payload.basePrice } : r)
        );
        toast.success('Room category updated.', { id: toastId });
      } else {
        // POST /admin/hotels/:hotelId/rooms
        const response = await axiosInstance.post(`/admin/hotels/${hotelId}/rooms`, payload);
        const newRoom = response.data || { ...payload, id: Date.now(), price: payload.basePrice };
        setRooms(prev => [...prev, newRoom]);
        toast.success('Room category registered successfully.', { id: toastId });
      }
      setActiveModal(null);
    } catch (error) {
      console.error('Room operation failed:', error);
      // Fallback
      if (editingRoom) {
        setRooms(prev =>
          prev.map(r => r.id === editingRoom.id ? { ...r, ...payload, price: payload.basePrice } : r)
        );
        toast.success('Room category updated (offline simulation).', { id: toastId });
      } else {
        const simulated = {
          ...payload,
          id: Date.now(),
          price: payload.basePrice
        };
        setRooms(prev => [...prev, simulated]);
        toast.success('Room category registered (offline simulation).', { id: toastId });
      }
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrigger = (roomId) => {
    setDeleteConfirmId(roomId);
  };

  const confirmDeleteRoom = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    const toastId = toast.loading('Removing room category...');
    try {
      await axiosInstance.delete(`/admin/hotels/${hotelId}/rooms/${deleteConfirmId}`);
      setRooms(prev => prev.filter(r => r.id !== deleteConfirmId));
      toast.success('Room category deleted.', { id: toastId });
    } catch (error) {
      console.error('Delete room failed:', error);
      // Fallback delete
      setRooms(prev => prev.filter(r => r.id !== deleteConfirmId));
      toast.success('Room category deleted (offline simulation).', { id: toastId });
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
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2 bg-white hover:bg-gray-50 rounded-xl border border-gray-150 shadow-subtle text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">{hotelName}</h1>
              <p className="text-xs text-gray-500 mt-1">Configure room types, default prices, and inventory controls</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold px-4 py-3 rounded-xl text-xs transition-all shadow-subtle hover:shadow-md cursor-pointer self-start sm:self-auto uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room Category</span>
          </button>
        </div>

        {/* Rooms List Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-150 p-8 shadow-subtle max-w-md mx-auto">
            <BedDouble className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-950 mb-1">No rooms added</h3>
            <p className="text-xs text-gray-500 mb-6">
              Create rooms to define accommodation tiers, capacities, and base rates.
            </p>
            <button
              onClick={openCreateModal}
              className="bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Add First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-3xl border border-gray-150 shadow-subtle overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="sm:w-48 h-40 sm:h-auto bg-gray-100 flex-shrink-0 relative">
                  <img
                    src={room.photos?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'}
                    alt={room.type}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-gray-950 text-base leading-snug">{room.type}</h3>
                      <div className="text-right">
                        <span className="text-brand font-black text-sm">₹{((room.price || room.basePrice || 0)).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-gray-400 block font-bold">/ night</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-brand" /> Max Guests: {room.capacity || 2}
                      </span>
                      <span>Total Rooms: {room.totalCount || 5}</span>
                    </div>

                    {/* Amenities list */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {room.amenities.slice(0, 3).map((a, i) => (
                          <span key={i} className="text-[9px] font-semibold text-gray-650 bg-gray-100 border border-gray-150/45 px-2 py-0.5 rounded-md">
                            {a}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-[9px] font-semibold text-brand bg-brand/5 px-2 py-0.5 rounded-md">
                            +{room.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <motion.button
                      onClick={() => navigate(`/admin/inventory/${room.id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer shadow-subtle"
                    >
                      <CalendarRange className="w-3.5 h-3.5" />
                      <span>Manage Calendar</span>
                    </motion.button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Room Type"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(room.id)}
                        className="p-1.5 text-gray-450 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Room Type"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Dialog Overlay */}
        <AnimatePresence>
          {activeModal && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh] border border-gray-100 p-6 space-y-6 relative"
              >
                {/* Close trigger */}
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-black text-gray-950 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <BedDouble className="w-5 h-5 text-brand" />
                  <span>{activeModal === 'edit' ? 'Modify Room Category' : 'Register Room Category'}</span>
                </h3>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Category Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Room Type / Name</label>
                    <input
                      type="text"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      placeholder="e.g. Deluxe Ocean View Suite"
                      className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Pricing / Capacity Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="Price"
                        min="1"
                        className="block w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Capacity</label>
                      <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        min="1"
                        max="20"
                        className="block w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Total Rooms</label>
                      <input
                        type="number"
                        value={totalCount}
                        onChange={(e) => setTotalCount(e.target.value)}
                        min="1"
                        className="block w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Photo URLs */}
                  <div>
                    <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Add Photo URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={photoInput}
                        onChange={(e) => setPhotoInput(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="block flex-grow border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-mono"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="bg-brand hover:bg-brand-dark text-white font-bold px-3 rounded-xl text-xs transition-colors flex items-center cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Previews */}
                    {photos.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto py-2 px-1 border border-gray-100 bg-gray-50 rounded-xl">
                        {photos.map((url, i) => (
                          <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                            <img src={url} alt={`Room Preview ${i}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(i)}
                              className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Amenities checkbox grid */}
                  <div>
                    <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Amenities</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-100 bg-gray-50 p-3 rounded-2xl">
                      {AVAILABLE_ROOM_AMENITIES.map((a) => {
                        const selected = selectedAmenities.includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => toggleAmenity(a)}
                            className={`flex items-center justify-between p-2 border rounded-xl text-[10px] font-bold cursor-pointer transition-colors ${
                              selected ? 'border-brand/40 bg-brand/5 text-brand' : 'border-gray-200 bg-white text-gray-650'
                            }`}
                          >
                            <span>{a}</span>
                            {selected && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      disabled={isSubmitting}
                      className="border border-gray-250 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-brand hover:bg-brand-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-subtle cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Save Category</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 p-6 text-center space-y-6 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-950 mb-1.5">Remove Room Category</h3>
                <p className="text-xs text-gray-500 leading-normal max-w-xs mx-auto">
                  Are you sure you want to delete this room type? This will also clear all booking configurations and dates for this category.
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
                  onClick={confirmDeleteRoom}
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
