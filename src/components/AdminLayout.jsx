import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BedDouble, CalendarRange, Menu, X, Building2, LogOut, ArrowLeft, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Extract hotelId from URL if present, otherwise check localStorage for active memory
  const hotelId = params.hotelId || localStorage.getItem('lastAdminHotelId');

  useEffect(() => {
    if (params.hotelId) {
      localStorage.setItem('lastAdminHotelId', params.hotelId);
    }
  }, [params.hotelId]);

  const handleNavClick = (e, targetPath, requiresHotel = false) => {
    if (requiresHotel && !hotelId) {
      e.preventDefault();
      toast.error('Please select a hotel from the dashboard first.');
      navigate('/admin');
    }
  };

  const navItems = [
    {
      label: 'Hotels List',
      path: '/admin',
      icon: Building2,
      exact: true,
      requiresHotel: false
    },
    {
      label: 'Room Management',
      path: hotelId ? `/admin/hotels/${hotelId}/rooms` : '#',
      icon: BedDouble,
      exact: false,
      requiresHotel: true
    },
    {
      label: 'Bookings & Reports',
      path: hotelId ? `/admin/hotels/${hotelId}/bookings` : '#',
      icon: BarChart3,
      exact: false,
      requiresHotel: true
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-950">
        <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 fill-brand"
          >
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533.981c.198.39.499.746.867 1.012l.83.564C25.057 8.371 27 11.233 27 14.5c0 6.06-6.056 11.5-11 16.5-4.944-5-11-10.44-11-16.5 0-3.267 1.943-6.129 4.819-7.674l.83-.564c.368-.266.669-.622.867-1.012l.533-.981C12.537 1.963 13.992 1 16 1zm0 2c-1.235 0-2.208.599-3.23 2.426l-.496.914A4.015 4.015 0 0 1 10.74 8.24l-.813.553C7.545 10.363 6 12.28 6 14.5c0 4.887 5.253 9.771 10 14.57 4.747-4.799 10-9.683 10-14.57 0-2.22-1.545-4.137-4.127-5.707l-.813-.553a4.014 4.014 0 0 1-1.531-1.9l-.496-.914C18.208 3.599 17.235 3 16 3zm0 5.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
          </svg>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white leading-none">BookNearMe</span>
            <span className="text-[9px] text-brand font-bold uppercase tracking-wider">Manager Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path.split('/:')[0]) && item.path !== '#';

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={(e) => {
                handleNavClick(e, item.path, item.requiresHotel);
                setMobileOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-brand text-white shadow-md shadow-brand/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / User Profile */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/60">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">
            {(user?.name || 'M').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-grow">
            <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Hotel Manager'}</p>
            <span className="inline-block bg-brand/10 text-brand text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 leading-none">
              Manager
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 w-full text-left text-xs font-bold text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Main Site</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2.5 w-full text-left text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      {/* Desktop Sidebar (Pinned) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden shadow-xl"
            >
              <div className="h-full relative">
                {sidebarContent}
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-[-45px] p-2 bg-gray-900 text-white rounded-r-xl border-l border-gray-800 focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Page Area */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* Top Header Panel */}
        <header className="h-16 border-b border-gray-200 bg-white px-4 sm:px-6 flex items-center justify-between lg:justify-end sticky top-0 z-20 shadow-sm">
          {/* Burger trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Stats Summary or Context Breadcrumb */}
          <div className="text-xs text-gray-500 font-bold hidden sm:block">
            {hotelId ? (
              <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-650">
                Active Context Hotel ID: <span className="font-mono font-black text-gray-800">#{hotelId}</span>
              </span>
            ) : (
              <span className="text-gray-400">Select a hotel to start managing rooms</span>
            )}
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
