import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { User, Calendar, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { axiosInstance } from '../api/axiosInstance';
import PageTransition from '../components/PageTransition';

// Form Validation Schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, {
    message: 'Birthdate must be a valid date in the past',
  }),
});

export default function EditProfilePage() {
  const { user, fetchUserProfile } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      gender: 'MALE',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('gender', user.gender || 'MALE');
      setValue('dateOfBirth', user.dateOfBirth || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    const toastId = toast.loading('Saving profile changes...');
    try {
      const payload = {
        name: data.name.trim(),
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || null,
      };

      // PATCH /users/profile
      await axiosInstance.patch('/users/profile', payload);
      
      // Update state in Zustand store
      await fetchUserProfile();
      
      toast.success('Profile updated successfully!', { id: toastId });
      navigate('/profile');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile. Simulating updates locally...', { id: toastId });
      
      // Fallback local update simulation
      if (user) {
        useAuthStore.setState({
          user: { ...user, name: data.name, gender: data.gender, dateOfBirth: data.dateOfBirth },
        });
      }
      setTimeout(() => navigate('/profile'), 1000);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl border border-gray-150 dark:border-slate-700 shadow-subtle text-gray-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
              Edit Profile
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Update name, birthdate, and gender details</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-subtle">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-655 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Enter full name"
                  className="block w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 text-gray-750 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && (
                <p className="text-rose-500 text-xs mt-1.5 font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-655 dark:text-slate-400 uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                {...register('gender')}
                className="block w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 text-gray-750 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer font-semibold"
                disabled={isSubmitting}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.gender && (
                <p className="text-rose-500 text-xs mt-1.5 font-semibold">{errors.gender.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-gray-655 dark:text-slate-400 uppercase tracking-wider mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="block w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 text-gray-755 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-semibold"
                disabled={isSubmitting}
              />
              {errors.dateOfBirth && (
                <p className="text-rose-500 text-xs mt-1.5 font-semibold">{errors.dateOfBirth.message}</p>
              )}
            </div>

            {/* Save Buttons */}
            <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <Link
                to="/profile"
                className="flex-grow text-center border border-gray-250 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </Link>
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
                <span>Save Changes</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </PageTransition>
  );
}
