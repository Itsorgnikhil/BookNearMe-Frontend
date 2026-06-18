import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Plus, Check, UserPlus, CreditCard } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockGuests } from '../utils/mockData';
import PageTransition from '../components/PageTransition';
import BookingWizardLayout from '../components/BookingWizardLayout';

export default function BookingGuestsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Route details carried from step 1
  const hotelName = location.state?.hotelName || 'Selected Hotel';
  const roomType = location.state?.roomType || 'Selected Room';

  // Guest list states
  const [frequentGuests, setFrequentGuests] = useState([]);
  const [selectedGuestIds, setSelectedGuestIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expanded form states
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestGender, setNewGuestGender] = useState('MALE');
  const [newGuestAge, setNewGuestAge] = useState('');

  // Loader states
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isSavingCompanions, setIsSavingCompanions] = useState(false);

  const fetchCompanions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users/guests');
      setFrequentGuests(response.data || []);
    } catch (error) {
      console.warn('API error fetching guests list, using mock fallback:', error);
      setFrequentGuests(mockGuests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanions();
  }, []);

  const handleToggleGuest = (guestId) => {
    if (selectedGuestIds.includes(guestId)) {
      setSelectedGuestIds(selectedGuestIds.filter(id => id !== guestId));
    } else {
      setSelectedGuestIds([...selectedGuestIds, guestId]);
    }
  };

  const handleAddGuestSubmit = async (e) => {
    e.preventDefault();
    if (!newGuestName.trim() || !newGuestAge) {
      toast.error('Please fill in Name and Age fields.');
      return;
    }

    setIsAddingGuest(true);
    try {
      const payload = {
        name: newGuestName.trim(),
        gender: newGuestGender,
        age: parseInt(newGuestAge)
      };
      
      const response = await axiosInstance.post('/users/guests', payload);
      setFrequentGuests([...frequentGuests, response.data]);
      setSelectedGuestIds([...selectedGuestIds, response.data.id]);

      setNewGuestName('');
      setNewGuestAge('');
      setIsFormExpanded(false);
      toast.success('Companion guest added and selected!');
    } catch (error) {
      console.error('Failed to add companion, simulating locally:', error);
      const mockNewGuest = {
        id: Date.now(),
        name: newGuestName,
        gender: newGuestGender,
        age: parseInt(newGuestAge)
      };
      setFrequentGuests([...frequentGuests, mockNewGuest]);
      setSelectedGuestIds([...selectedGuestIds, mockNewGuest.id]);
      setNewGuestName('');
      setNewGuestAge('');
      setIsFormExpanded(false);
      toast.success('Companion guest added (offline mode).');
    } finally {
      setIsAddingGuest(false);
    }
  };

  const handleSaveCompanions = async () => {
    if (selectedGuestIds.length === 0) {
      toast.error('Please select at least one guest.');
      return;
    }

    setIsSavingCompanions(true);
    const toastId = toast.loading('Registering guests to reservation...');

    try {
      // POST /bookings/:bookingId/addGuests
      await axiosInstance.post(`/bookings/${bookingId}/addGuests`, selectedGuestIds);
      toast.success('Guests updated! Continuing to payments...', { id: toastId });
      
      navigate(`/booking/${bookingId}/payment`, {
        state: { hotelName, roomType }
      });
    } catch (error) {
      console.error('Adding guests to booking failed:', error);
      toast.error('API registration failed. Continuing locally...', { id: toastId });
      
      setTimeout(() => {
        navigate(`/booking/${bookingId}/payment`, {
          state: { hotelName, roomType }
        });
      }, 1500);
    } finally {
      setIsSavingCompanions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-24 bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <PageTransition>
      <BookingWizardLayout currentStep={2}>
        <div className="max-w-xl mx-auto space-y-6">
          {/* Back link */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-semibold mb-2 focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Summary
          </button>

          {/* Stepper Content */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Add Guests</h2>
              <p className="text-xs text-gray-500 leading-normal">
                Who will be staying at <span className="font-semibold text-gray-800">{hotelName}</span>? Please assign frequent companions from the list.
              </p>
            </div>

            {/* List with Checkboxes */}
            {frequentGuests.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-gray-50 border border-gray-100 rounded-xl p-4">
                No frequent companions found. Expand the new guest form below to add one.
              </p>
            ) : (
              <div className="space-y-2.5">
                {frequentGuests.map((guest) => {
                  const isChecked = selectedGuestIds.includes(guest.id);
                  return (
                    <button
                      key={guest.id}
                      onClick={() => handleToggleGuest(guest.id)}
                      type="button"
                      className={`w-full flex items-center justify-between p-3.5 border rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer ${
                        isChecked
                          ? 'border-brand bg-brand/5 text-gray-950 shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate text-gray-950 leading-tight">{guest.name}</p>
                        <span className="text-[10px] text-gray-400 font-medium capitalize">
                          {guest.gender?.toLowerCase()} · Age: {guest.age}
                        </span>
                      </div>
                      {isChecked ? (
                        <Check className="w-4 h-4 text-brand flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-300 rounded flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Expandable inline form */}
            <div className="border-t border-gray-100 pt-5">
              {!isFormExpanded ? (
                <button
                  onClick={() => setIsFormExpanded(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer focus:outline-none"
                >
                  <Plus className="w-4 h-4" /> Add a New Companion
                </button>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-brand" /> Register Companion
                    </h4>
                    <button 
                      onClick={() => setIsFormExpanded(false)} 
                      className="text-gray-400 hover:text-gray-650"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleAddGuestSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                      <input
                        type="text"
                        value={newGuestName}
                        onChange={(e) => setNewGuestName(e.target.value)}
                        placeholder="Companion name"
                        className="block w-full border border-gray-200 rounded-xl px-3 py-2 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        required
                        disabled={isAddingGuest}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Gender</label>
                        <select
                          value={newGuestGender}
                          onChange={(e) => setNewGuestGender(e.target.value)}
                          className="block w-full border border-gray-200 rounded-xl px-3 py-2 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                          disabled={isAddingGuest}
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Age</label>
                        <input
                          type="number"
                          value={newGuestAge}
                          onChange={(e) => setNewGuestAge(e.target.value)}
                          placeholder="Age"
                          min="1"
                          max="120"
                          className="block w-full border border-gray-200 rounded-xl px-3 py-2 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                          required
                          disabled={isAddingGuest}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isAddingGuest}
                      className="w-full bg-white hover:bg-gray-150 border border-gray-200 text-[10px] text-gray-700 font-bold py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      {isAddingGuest ? 'Adding...' : 'Save and Select'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-100 pt-5 flex justify-end">
              <button
                onClick={handleSaveCompanions}
                disabled={selectedGuestIds.length === 0 || isSavingCompanions}
                className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-subtle hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {isSavingCompanions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <CreditCard className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </BookingWizardLayout>
    </PageTransition>
  );
}
