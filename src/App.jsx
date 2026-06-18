import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import HotelSearchPage from './pages/HotelSearchPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingInitPage from './pages/BookingInitPage';
import BookingGuestsPage from './pages/BookingGuestsPage';
import BookingPaymentPage from './pages/BookingPaymentPage';
import BookingStatusPage from './pages/BookingStatusPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import GuestManagementPage from './pages/GuestManagementPage';
import UserDashboard from './pages/UserDashboard';
import EditProfilePage from './pages/EditProfilePage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminHotelFormPage from './pages/AdminHotelFormPage';
import AdminRoomPage from './pages/AdminRoomPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import { useAuthStore } from './store/authStore';
import FloatingChatbot from './components/FloatingChatbot';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotels/search" element={<HotelSearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/hotels/:id" element={<HotelDetailsPage />} />
        <Route 
          path="/booking/init" 
          element={
            <PrivateRoute>
              <BookingInitPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/booking/:bookingId/guests" 
          element={
            <PrivateRoute>
              <BookingGuestsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/booking/:bookingId/payment" 
          element={
            <PrivateRoute>
              <BookingPaymentPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/payments/:bookingId/status" 
          element={
            <PrivateRoute>
              <BookingStatusPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/my-bookings" 
          element={
            <PrivateRoute>
              <MyBookingsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/bookings/:bookingId" 
          element={
            <PrivateRoute>
              <BookingDetailsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile/edit" 
          element={
            <PrivateRoute>
              <EditProfilePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/guests" 
          element={
            <PrivateRoute>
              <GuestManagementPage />
            </PrivateRoute>
          } 
        />

        {/* Admin / Hotel Manager Section */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="hotels/new" element={<AdminHotelFormPage />} />
          <Route path="hotels/:hotelId/edit" element={<AdminHotelFormPage />} />
          <Route path="hotels/:hotelId/rooms" element={<AdminRoomPage />} />
          <Route path="inventory/:roomId" element={<AdminInventoryPage />} />
          <Route path="hotels/:hotelId/bookings" element={<AdminBookingsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { fetchUserProfile, accessToken } = useAuthStore();

  // Sync user profile state on application load if token exists
  useEffect(() => {
    if (accessToken) {
      fetchUserProfile();
    }
  }, [accessToken, fetchUserProfile]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#F7F7F7] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <AnimatedRoutes />
        </main>
        <Footer />
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#222222',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#FF385C',
                secondary: '#ffffff',
              },
            },
          }} 
        />
        <FloatingChatbot />
      </div>
    </Router>
  );
}

export default App;
