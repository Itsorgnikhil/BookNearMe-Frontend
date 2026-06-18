import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Calendar, DollarSign, TrendingUp, ArrowLeft, Loader2, Filter, Receipt, RefreshCw } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import { mockBookings, mockHotels } from '../utils/mockData';
import PageTransition from '../components/PageTransition';

export default function AdminBookingsPage() {
  const { hotelId } = useParams();

  const [hotelName, setHotelName] = useState('Hotel Property');
  const [bookings, setBookings] = useState([]);
  const [report, setReport] = useState({ totalRevenue: 0, totalBookings: 0 });
  
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchBookingsAndReports = async () => {
    setLoading(true);
    try {
      // Fetch hotel name
      const hotelData = mockHotels.find(h => h.id === parseInt(hotelId));
      if (hotelData) {
        setHotelName(hotelData.name);
      }

      // Fetch bookings list
      const bookingsRes = await axiosInstance.get(`/admin/hotels/${hotelId}/bookings`);
      setBookings(bookingsRes.data || []);

      // Fetch report DTO
      const startQuery = startDate ? `&startDate=${startDate}` : '';
      const endQuery = endDate ? `&endDate=${endDate}` : '';
      const reportRes = await axiosInstance.get(`/admin/hotels/${hotelId}/reports?dummy=1${startQuery}${endQuery}`);
      setReport(reportRes.data || { totalRevenue: 0, totalBookings: 0 });

    } catch (error) {
      console.warn('API error fetching bookings/reports, running offline simulation:', error);
      // Fallback local simulation
      // Filter bookings matching this hotel
      const hotelBookings = mockBookings.filter(b => b.hotelId === parseInt(hotelId) || !b.hotelId);
      
      // Filter bookings by selected dates if present
      const filtered = hotelBookings.filter(b => {
        if (startDate && new Date(b.checkInDate) < new Date(startDate)) return false;
        if (endDate && new Date(b.checkOutDate) > new Date(endDate)) return false;
        return true;
      });

      setBookings(filtered);

      // Compute stats
      const totalRev = filtered.reduce((sum, b) => sum + (b.price || b.amount || 0), 0);
      setReport({
        totalRevenue: totalRev,
        totalBookings: filtered.length
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndReports();
  }, [hotelId]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date.');
      return;
    }
    setFiltering(true);
    fetchBookingsAndReports().then(() => {
      setFiltering(false);
      toast.success('Report metrics updated.');
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'PAYMENTS_PENDING':
      case 'PENDING':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
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
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">Bookings & Reports</h1>
              <p className="text-xs text-gray-500 mt-1">{hotelName} Performance Dashboard</p>
            </div>
          </div>
          <button
            onClick={fetchBookingsAndReports}
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1.5 focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Data</span>
          </button>
        </div>

        {/* Date Filter Panel */}
        <form onSubmit={handleFilterSubmit} className="bg-white border border-gray-150 rounded-3xl p-5 shadow-subtle flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 font-semibold"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={filtering || loading}
            className="bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer w-full sm:w-auto justify-center"
          >
            <Filter className="w-4 h-4" />
            <span>Filter Report</span>
          </button>
        </form>

        {/* Aggregates Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-subtle flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Aggregate Revenue</span>
              <h3 className="text-2xl font-black text-gray-950 mt-1">
                ₹{report.totalRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-subtle flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-brand/10 text-brand">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Total Bookings</span>
              <h3 className="text-2xl font-black text-gray-950 mt-1">
                {report.totalBookings}
              </h3>
            </div>
          </div>
        </div>

        {/* Bookings Table list */}
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
            <Receipt className="w-4 h-4 text-brand" /> Detailed Reservations Log
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50">
              <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium mb-1">No reservations logged</p>
              <p className="text-xs text-gray-400">There are no bookings matching your criteria in this period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-150 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="p-3">Reference ID</th>
                    <th className="p-3">Customer / Guests</th>
                    <th className="p-3">Check-in</th>
                    <th className="p-3">Check-out</th>
                    <th className="p-3">Rooms Count</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-semibold font-mono text-gray-700">#{booking.id}</td>
                      <td className="p-3 font-semibold text-gray-900">
                        {booking.guests?.[0]?.name || 'BookNearMe Guest'}
                        {booking.guests?.length > 1 && (
                          <span className="text-[10px] font-medium text-brand block">
                            +{booking.guests.length - 1} companions
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-gray-650">{booking.checkInDate}</td>
                      <td className="p-3 font-medium text-gray-650">{booking.checkOutDate}</td>
                      <td className="p-3 font-bold text-gray-600">{booking.roomsCount} Room{booking.roomsCount > 1 ? 's' : ''}</td>
                      <td className="p-3 font-black text-gray-900">
                        ₹{(booking.price || booking.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                          getStatusColor(booking.bookingStatus)
                        }`}>
                          {booking.bookingStatus?.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
