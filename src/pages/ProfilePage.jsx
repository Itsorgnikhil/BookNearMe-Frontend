import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar, UserCheck, Mail, Edit3, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import PageTransition from '../components/PageTransition';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'UN';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user?.name);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">View your account identity and companion credentials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Avatar card */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 shadow-subtle text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-brand text-white flex items-center justify-center text-3xl font-black mx-auto shadow-md select-none">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{user?.name}</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-1.5 flex items-center justify-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700 rounded-xl p-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              StayEase Member
            </div>
          </div>

          {/* RIGHT: Profile Info & Links */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Personal Info Display */}
            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-4">
                <h2 className="text-lg font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-brand" /> Personal Information
                </h2>
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-subtle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-wider block">Full Name</span>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">{user?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-wider block">Gender</span>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1 capitalize">{user?.gender?.toLowerCase() || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-wider block">Date of Birth</span>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">{user?.dateOfBirth || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-wider block">User Role Authority</span>
                  <p className="text-gray-950 dark:text-white font-mono mt-1 font-black">{user?.role || 'GUEST'}</p>
                </div>
              </div>
            </div>

            {/* Guest Management Link */}
            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="bg-brand/10 p-3.5 rounded-2xl text-brand flex-shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex-grow text-center sm:text-left space-y-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Companions & Guest Manifests</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-normal">
                  Pre-register frequent companions (names, ages, genders) so you can quickly associate them to reservation sessions.
                </p>
                <button
                  onClick={() => navigate('/guests')}
                  className="flex items-center justify-center gap-1 text-xs font-bold text-brand hover:underline cursor-pointer focus:outline-none mx-auto sm:mx-0"
                >
                  <span>Manage Saved Guests</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
