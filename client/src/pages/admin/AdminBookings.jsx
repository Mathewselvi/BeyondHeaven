import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed'

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;

        try {
            await api.put(`/bookings/${id}`, { status });

            // Refresh
            fetchBookings();
            alert(`Booking ${status} successfully!`);
        } catch (err) {
            console.error(err);
            alert('Failed to update booking');
        }
    };

    const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

    if (loading) return <div className="p-8">Loading Bookings...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bookings</h1>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Room Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50 transition-colors bg-white">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-gray-900">{booking.guest.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{booking.guest.email}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-medium text-gray-700">{booking.room?.name || 'Unknown Room'}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(booking.dates.checkIn).toLocaleDateString()} - {new Date(booking.dates.checkOut).toLocaleDateString()}
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] uppercase font-bold ${booking.source === 'site' || !booking.source ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {booking.source || 'site'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-mono font-medium text-gray-900">₹{booking.totalPrice}</td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border
                                            ${booking.status === 'confirmed' ? 'bg-black text-white border-black' :
                                                booking.status === 'pending' ? 'bg-white text-gray-900 border-gray-200' : 'bg-gray-100 text-gray-400 border-transparent'}
                                        `}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {booking.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                                                    className="bg-black text-white px-3 py-1.5 rounded text-xs font-semibold hover:opacity-80 transition-opacity flex items-center gap-1"
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                                                    className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-50 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
