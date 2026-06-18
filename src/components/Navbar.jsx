import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Compass, Calendar, User, LogIn, LogOut, Menu, X, UserCheck, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAiBadgeClick = () => {
    navigate('/?searchMode=ai');
    setTimeout(() => {
      const heroEl = document.getElementById('hero-section');
      if (heroEl) {
        heroEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
      isActive
        ? 'bg-gray-100 dark:bg-slate-800 text-gray-950 dark:text-white shadow-sm'
        : 'text-gray-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-all ${
      isActive
        ? 'bg-brand/10 text-brand dark:text-purple-400'
        : 'text-gray-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-sm backdrop-blur-md border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-gray-900 dark:text-white">
      {/* Shimmer Sweep Animation CSS */}
      <style>{`
        @keyframes shimmerSweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .shimmer-badge {
          background: linear-gradient(90deg, #7C3AED 0%, #FF385C 35%, #ffffff 50%, #FF385C 65%, #7C3AED 100%);
          background-size: 300% 100%;
          animation: shimmerSweep 5s infinite linear;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 focus:outline-none">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <svg
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                  className="w-8 h-8 fill-brand"
                >
                  <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533.981c.198.39.499.746.867 1.012l.83.564C25.057 8.371 27 11.233 27 14.5c0 6.06-6.056 11.5-11 16.5-4.944-5-11-10.44-11-16.5 0-3.267 1.943-6.129 4.819-7.674l.83-.564c.368-.266.669-.622.867-1.012l.533-.981C12.537 1.963 13.992 1 16 1zm0 2c-1.235 0-2.208.599-3.23 2.426l-.496.914A4.015 4.015 0 0 1 10.74 8.24l-.813.553C7.545 10.363 6 12.28 6 14.5c0 4.887 5.253 9.771 10 14.57 4.747-4.799 10-9.683 10-14.57 0-2.22-1.545-4.137-4.127-5.707l-.813-.553a4.014 4.014 0 0 1-1.531-1.9l-.496-.914C18.208 3.599 17.235 3 16 3zm0 5.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                </svg>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-brand leading-none">BookNearMe</span>
                <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">StayEase</span>
              </div>
            </Link>
          </div>
 
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" className={navLinkClass}>
              <Compass className="w-4 h-4" />
              <span>Home</span>
            </NavLink>
 
            {user && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/my-bookings" className={navLinkClass}>
                  <Calendar className="w-4 h-4" />
                  <span>My Bookings</span>
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </NavLink>
                {user.role === 'HOTEL_MANAGER' && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <UserCheck className="w-4 h-4 text-brand" />
                    <span>Manager Panel</span>
                  </NavLink>
                )}
              </>
            )}
          </div>
 
          {/* User Profile / Login Button */}
          <div className="hidden md:flex items-center space-x-3">
            {/* AI Search Badge Button */}
            <motion.button
              onClick={handleAiBadgeClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="shimmer-badge text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm cursor-pointer mr-2 flex items-center gap-1 border-0"
              title="Try AI Smart Search"
            >
              <span>✨ AI</span>
            </motion.button>

            {/* Dark Mode toggle */}
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.15, rotate: 18 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-755 dark:text-slate-200 rounded-full transition-colors cursor-pointer mr-1.5"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <UserCheck className="w-3.5 h-3.5 text-brand" />
                  Hi, <span className="font-semibold">{user.name}</span>
                </span>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-350 hover:text-white border border-gray-300 dark:border-slate-650 hover:border-brand hover:bg-brand rounded-full px-4 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-subtle hover:shadow-md block"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 pt-2 pb-4 space-y-1 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
          <NavLink
            to="/"
            onClick={() => setIsOpen(false)}
            className={mobileNavLinkClass}
          >
            <Compass className="w-5 h-5" />
            <span>Home</span>
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClass}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/my-bookings"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClass}
              >
                <Calendar className="w-5 h-5" />
                <span>My Bookings</span>
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClass}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </NavLink>
              {user.role === 'HOTEL_MANAGER' && (
                <NavLink
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <UserCheck className="w-5 h-5 text-brand" />
                  <span>Manager Panel</span>
                </NavLink>
              )}
            </>
          )}

          <hr className="border-gray-200 dark:border-slate-800 my-2 mx-4" />

          <div className="px-4 py-2 space-y-3">
            {/* AI Search in Mobile */}
            <button
              onClick={() => {
                setIsOpen(false);
                handleAiBadgeClick();
              }}
              className="shimmer-badge w-full text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm border-0 cursor-pointer"
            >
              <span>✨ AI Smart Search</span>
            </button>

            {/* Theme Toggle in Mobile */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold py-2 rounded-lg cursor-pointer"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              <span>Toggle Theme</span>
            </button>

            {user ? (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand" />
                  Logged in as <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-rose-50 hover:text-rose-655 dark:bg-slate-850 dark:hover:bg-rose-950/20 dark:text-rose-405 text-gray-700 font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-700 text-gray-750 dark:text-slate-300 font-semibold py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-all shadow-subtle"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
