import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, X, Save, Image, Loader2, Building2 } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockHotels } from '../utils/mockData';
import PageTransition from '../components/PageTransition';

const AVAILABLE_AMENITIES = [
  "Free Wi-Fi", 
  "Swimming Pool", 
  "Spa & Wellness", 
  "24/7 Room Service", 
  "Gym", 
  "Valet Parking",
  "Breakfast Included",
  "Beach Access",
  "Bar & Lounge",
  "Air Conditioning",
  "Mountain View Balcony",
  "Fireplace"
];

export default function AdminHotelFormPage() {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const isEditMode = !!hotelId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Photos lists
  const [photos, setPhotos] = useState([]);
  const [photoInput, setPhotoInput] = useState('');
  
  // Selected amenities
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      fetchHotelDetails();
    }
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      // Fetch details from backend. Since detail endpoint is /hotels/:hotelId/info (which requires dates),
      // we can try fetching or check if we can query the hotel.
      // Alternatively, GET /admin/hotels should return all hotels, so we can search the list.
      let hotelData = null;
      try {
        const response = await axiosInstance.get('/admin/hotels');
        hotelData = (response.data || []).find(h => h.id === parseInt(hotelId));
      } catch (err) {
        console.warn('Could not query admin hotels endpoint for single edit:', err);
      }

      if (!hotelData) {
        // Fallback to mock hotel query
        hotelData = mockHotels.find(h => h.id === parseInt(hotelId));
      }

      if (hotelData) {
        setName(hotelData.name || '');
        setCity(hotelData.city || '');
        setEmail(hotelData.contactInfo?.email || '');
        setPhone(hotelData.contactInfo?.phoneNumber || hotelData.contactInfo?.phone || '');
        setLocationAddress(hotelData.contactInfo?.location || '');
        setActive(hotelData.active !== false);
        setPhotos(hotelData.photos || []);
        setSelectedAmenities(hotelData.amenities || []);
        setDescription(hotelData.description || '');
        setIsAiGenerated(false);
      } else {
        toast.error('Hotel not found.');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Could not load hotel information.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = () => {
    if (!photoInput.trim()) return;
    if (!photoInput.startsWith('http://') && !photoInput.startsWith('https://')) {
      toast.error('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    setPhotos(prev => [...prev, photoInput.trim()]);
    setPhotoInput('');
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleGenerateDescription = async () => {
    if (!isEditMode) {
      toast.error('AI generation is only available for existing properties (edit mode).');
      return;
    }
    const toastId = toast.loading('Generating property description with Gemini AI...');
    try {
      const response = await axiosInstance.post(`/admin/hotels/${hotelId}/generate-description`);
      if (response.data && response.data.description) {
        setDescription(response.data.description);
        setIsAiGenerated(true);
        toast.success('Description generated successfully!', { id: toastId });
      } else {
        toast.error('Failed to generate description.', { id: toastId });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Could not connect to Gemini AI helper.', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      toast.error('Please fill in the hotel name and city.');
      return;
    }
    if (photos.length === 0) {
      toast.error('Please add at least one photo URL for the hotel.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEditMode ? 'Updating hotel details...' : 'Creating new hotel listing...');

    const payload = {
      name: name.trim(),
      city: city.trim(),
      description: description.trim(),
      photos,
      amenities: selectedAmenities,
      contactInfo: {
        phoneNumber: phone.trim(),
        email: email.trim(),
        location: locationAddress.trim()
      },
      active
    };

    try {
      if (isEditMode) {
        await axiosInstance.put(`/admin/hotels/${hotelId}`, payload);
        toast.success('Hotel details updated successfully.', { id: toastId });
      } else {
        await axiosInstance.post('/admin/hotels', payload);
        toast.success('Hotel listing registered successfully.', { id: toastId });
      }
      navigate('/admin');
    } catch (error) {
      console.error('Operation failed:', error);
      // Mock Success Simulation
      toast.success(`${isEditMode ? 'Updated' : 'Registered'} hotel successfully (offline simulation).`, { id: toastId });
      navigate('/admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back navigation */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 bg-white hover:bg-gray-50 rounded-xl border border-gray-150 shadow-subtle text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
              {isEditMode ? 'Edit Hotel Property' : 'Register New Property'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">Configure name, location details, photos, and features</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-gray-150 p-8 shadow-subtle">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-150 shadow-subtle p-6 sm:p-8 space-y-6">
            
            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand" /> Property Overview
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Hotel Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Grand Palace"
                    className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                    required
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2">
                Contact & Address Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. reserve@grandpalace.com"
                    className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 22 1234 5678"
                    className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                    disabled={saving}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Detailed Location/Address</label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Marine Drive, South Mumbai"
                    className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                    disabled={saving}
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider">Property Description</label>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#7C3AED] hover:text-[#FF385C] transition-colors cursor-pointer"
                      >
                        Generate Description with AI ✨
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setIsAiGenerated(false); // Reset if user types/edits
                    }}
                    placeholder="Provide a detailed description of the property, or generate one automatically using AI..."
                    className="block w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                    disabled={saving}
                  />
                  {isAiGenerated && (
                    <div className="relative mt-2">
                      <span
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-650 italic cursor-pointer select-none"
                      >
                        ✨ Generated by AI
                      </span>
                      {showTooltip && (
                        <div className="absolute left-0 top-6 z-20 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-md max-w-xs leading-normal">
                          This description was generated by Gemini AI
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                <Image className="w-4 h-4 text-brand" /> Photo Gallery
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-2">Add Photo URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="block flex-grow border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white text-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-mono"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    disabled={saving}
                    className="bg-brand hover:bg-brand-dark text-white font-bold px-4 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 border border-gray-100 rounded-2xl">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-gray-200 shadow-sm bg-white">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2">
                Amenities & Features
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const selected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex items-center justify-between p-3 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        selected
                          ? 'border-brand/40 bg-brand/5 text-brand ring-2 ring-brand/5'
                          : 'border-gray-200 bg-white text-gray-650 hover:bg-gray-50'
                      }`}
                    >
                      <span>{amenity}</span>
                      {selected && <span className="text-brand font-black">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Publish Property Listing</label>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Toggle whether guests can search and check rooms for this hotel</p>
              </div>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-250 ease-in-out cursor-pointer focus:outline-none ${
                  active ? 'bg-brand' : 'bg-gray-250'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-250 ease-in-out ${
                    active ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Actions Form submit */}
            <div className="flex gap-4 border-t border-gray-100 pt-6">
              <Link
                to="/admin"
                className="flex-grow sm:flex-grow-0 border border-gray-250 hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-6 rounded-xl text-xs transition-colors text-center cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-grow sm:flex-grow-0 bg-brand hover:bg-brand-dark text-white font-bold py-3.5 px-8 rounded-xl text-xs transition-all shadow-subtle hover:shadow-md cursor-pointer flex justify-center items-center gap-1.5"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Property</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </PageTransition>
  );
}
