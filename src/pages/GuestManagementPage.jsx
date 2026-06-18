import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Calendar, Trash2, Edit2, Plus, X, UserCheck, ShieldAlert, Loader2, Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockGuests } from '../utils/mockData';
import PageTransition from '../components/PageTransition';

export default function GuestManagementPage() {
  const navigate = useNavigate();

  // CRUD States
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [editingGuest, setEditingGuest] = useState(null); // Guest object currently editing (null if creating)
  const [name, setName] = useState('');
  const [gender, setGender] = useState('MALE');
  const [age, setAge] = useState('');

  // Delete Modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users/guests');
      setGuests(response.data || []);
    } catch (error) {
      console.warn('API error fetching guests, using mock fallback:', error);
      setGuests(mockGuests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !age) {
      toast.error('Please fill in the guest name and age.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(editingGuest ? 'Saving companion changes...' : 'Creating new companion profile...');

    try {
      const payload = {
        name: name.trim(),
        gender,
        age: parseInt(age)
      };

      if (editingGuest) {
        // Edit Guest: PUT /users/guests/:id
        await axiosInstance.put(`/users/guests/${editingGuest.id}`, payload);
        
        // Update state
        setGuests(prev => prev.map(g => g.id === editingGuest.id ? { ...g, ...payload } : g));
        toast.success('Companion profile updated.', { id: toastId });
      } else {
        // Create Guest: POST /users/guests
        const response = await axiosInstance.post('/users/guests', payload);
        
        // Add to state
        setGuests(prev => [...prev, response.data]);
        toast.success('Companion profile registered.', { id: toastId });
      }

      // Reset form states
      resetForm();
    } catch (error) {
      console.error('Companion operations failed:', error);
      // Fallback local mock simulation
      if (editingGuest) {
        setGuests(prev => prev.map(g => g.id === editingGuest.id ? { ...g, name, gender, age: parseInt(age) } : g));
        toast.success('Companion profile updated (offline simulation).', { id: toastId });
      } else {
        const mockNew = {
          id: Date.now(),
          name: name.trim(),
          gender,
          age: parseInt(age)
        };
        setGuests(prev => [...prev, mockNew]);
        toast.success('Companion profile registered (offline simulation).', { id: toastId });
      }
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (guest) => {
    setEditingGuest(guest);
    setName(guest.name);
    setGender(guest.gender || 'MALE');
    setAge(guest.age || '');
  };

  const handleDeleteTrigger = (guestId) => {
    setDeleteConfirmId(guestId);
  };

  const confirmDeleteGuest = async () => {
    if (!deleteConfirmId) return;

    setIsDeleting(true);
    const toastId = toast.loading('Removing companion profile...');

    try {
      // DELETE /users/guests/:id
      await axiosInstance.delete(`/users/guests/${deleteConfirmId}`);
      
      // Update state
      setGuests(prev => prev.filter(g => g.id !== deleteConfirmId));
      toast.success('Companion profile removed.', { id: toastId });
    } catch (error) {
      console.error('Delete guest failed:', error);
      // Fallback deletion
      setGuests(prev => prev.filter(g => g.id !== deleteConfirmId));
      toast.success('Companion profile removed (offline simulation).', { id: toastId });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const resetForm = () => {
    setEditingGuest(null);
    setName('');
    setGender('MALE');
    setAge('');
  };

  return (
    <PageTransition>
      <div className="flex-grow bg-[#FAFAFA] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button 
              onClick={() => navigate('/profile')} 
              className="p-2 bg-white hover:bg-gray-50 rounded-xl border border-gray-150 shadow-subtle text-gray-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">Frequent Guests</h1>
              <p className="text-sm text-gray-500">Manage companion profiles for fast checkout check-ins</p>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE: Form Add / Edit */}
            <div className="lg:col-span-5 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-subtle">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                {editingGuest ? <Edit2 className="w-5 h-5 text-brand" /> : <Plus className="w-5 h-5 text-brand" />}
                <span>{editingGuest ? 'Edit Companion' : 'Register Companion'}</span>
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Gender & DOB grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-650 uppercase tracking-wider mb-2">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer font-semibold"
                      disabled={isSubmitting}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age"
                      min="1"
                      max="120"
                      className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-755 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3">
                  {editingGuest && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-grow border border-gray-200 hover:bg-gray-50 text-gray-650 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer text-center"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-all shadow-subtle hover:shadow-md cursor-pointer disabled:opacity-50 text-xs flex justify-center items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{editingGuest ? 'Save Changes' : 'Register Guest'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT SIDE: Guests List Table/Cards (layout animations) */}
            <div className="lg:col-span-7 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-subtle">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand" /> Registered Companions
              </h2>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-brand" />
                </div>
              ) : guests.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50">
                  <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium mb-1">No companions registered</p>
                  <p className="text-xs text-gray-400">Add frequent guest details here to easily select them when booking rooms.</p>
                </div>
              ) : (
                /* Framer Motion layout animated list */
                <motion.div layout className="space-y-3">
                  <AnimatePresence>
                    {guests.map((g) => (
                      <motion.div
                        key={g.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center justify-between p-4 border rounded-2xl hover:bg-gray-50 transition-all bg-white shadow-subtle ${
                          editingGuest?.id === g.id ? 'border-brand/40 ring-2 ring-brand/5' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2.5 rounded-full text-gray-500">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm leading-tight">{g.name}</p>
                            <p className="text-xs text-gray-450 mt-0.5">
                              {g.gender?.toLowerCase()} · Age: {g.age}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(g)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-550 hover:text-gray-900 transition-colors cursor-pointer"
                            title="Edit"
                            disabled={isSubmitting}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrigger(g.id)}
                            className="p-2 hover:bg-rose-50 rounded-lg text-gray-450 hover:text-red-650 transition-colors cursor-pointer"
                            title="Delete"
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

          </div>
        </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 z-50 p-6 text-center space-y-6"
              >
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-950 mb-1.5">Remove Companion Profile</h3>
                  <p className="text-xs text-gray-500 leading-normal max-w-xs mx-auto">
                    Are you sure you want to remove this companion from your frequent guests list? This action cannot be undone.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={isDeleting}
                    className="border border-gray-205 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteGuest}
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
              </motion.div>
            </motion.div>
          </>
        )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
