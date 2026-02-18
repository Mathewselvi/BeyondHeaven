import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { DollarSign, Calendar, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings');
                setBookings(res.data.data || []);
            } catch (err) {
                console.error('Error fetching bookings:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/admin/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [navigate]);

    // Calculate Stats
    const pendingRequests = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const today = new Date().toISOString().split('T')[0];
    const arrivalsToday = bookings.filter(b => b.dates?.checkIn?.startsWith(today) && b.status === 'confirmed').length;

    if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back, Admin</p>
                </div>

            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                {/* Pending */}
                <div className="card hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                            <Calendar size={20} />
                        </div>
                        <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-full">ACTION</span>
                    </div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pending Requests</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{pendingRequests}</p>
                </div>

                {/* Confirmed */}
                <div className="card hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 rounded-full text-gray-900">
                            <div className="text-lg">✔</div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Confirmed Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{confirmedBookings}</p>
                </div>

                {/* Arrivals */}
                <div className="card hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 rounded-full text-gray-900">
                            <div className="text-lg">🧳</div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Arrivals Today</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{arrivalsToday}</p>
                </div>

                {/* Walk-in */}
                <Link to="/admin/register" className="card hover:shadow-md transition-shadow border-dashed border-2 bg-gray-50 flex flex-col items-center justify-center text-center py-8">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 text-black">
                        <Plus size={24} />
                    </div>
                    <p className="text-gray-900 font-bold text-sm">New Walk-in</p>
                    <p className="text-gray-400 text-xs mt-1">Add details manually</p>
                </Link>
            </div>

            {/* Recent Booking Requests Table */}
            <div className="card overflow-hidden p-0">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
                    <a href="/admin/bookings" className="text-sm text-gray-500 hover:text-black font-medium transition-colors">View All</a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room & Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {bookings.slice(0, 5).map((booking, index) => (
                                <tr key={booking._id} className="hover:bg-gray-50 transition-colors bg-white">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{booking.guest?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{booking.guest?.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900 font-medium">{booking.room?.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {format(new Date(booking.dates.checkIn), 'MMM d')} - {format(new Date(booking.dates.checkOut), 'MMM d')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border
                                            ${booking.status === 'confirmed' ? 'bg-black text-white border-black' :
                                                booking.status === 'pending' ? 'bg-white text-gray-900 border-gray-200' : 'bg-gray-100 text-gray-400 border-transparent'}
                                        `}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <a href="/admin/bookings" className="text-black font-semibold text-xs border-b border-black pb-0.5 hover:opacity-70 transition-opacity">Review</a>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-400">No recent bookings.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
