import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, accessToken, isLoading } = useAuthStore();
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
          <p className="text-sm text-gray-500 font-semibold">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // We check if the user is authenticated and is a hotel manager
  // Role check: we check if user?.role is 'HOTEL_MANAGER' or if there's no user fetched yet
  if (!user || user.role !== 'HOTEL_MANAGER') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="max-w-md w-full bg-white border border-gray-150 rounded-3xl p-8 shadow-subtle text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">Access Denied</h2>
            <p className="text-sm text-gray-500 leading-normal">
              You do not have permission to access the management section. This area is reserved strictly for registered Hotel Managers.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-all shadow-subtle hover:shadow-md cursor-pointer text-xs uppercase tracking-wider"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return children;
}
