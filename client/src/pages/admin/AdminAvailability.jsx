import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Search } from 'lucide-react';

const AdminAvailability = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [roomsRes, bookingsRes, propsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/rooms'),
                    axios.get('http://localhost:5001/api/bookings', config),
                    axios.get('http://localhost:5001/api/properties')
                ]);

                setRooms(roomsRes.data.data);
                setBookings(bookingsRes.data.data);
                setProperties(propsRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Computation logic
    const dateObj = new Date(selectedDate);

    // 1. Filter Bookings for the selected date
    const todaysBookings = bookings.filter(b => {
        if (b.status === 'cancelled') return false;
        const start = startOfDay(parseISO(b.dates.checkIn));
        const end = endOfDay(parseISO(b.dates.checkOut));
        const target = startOfDay(dateObj);
        return isWithinInterval(target, { start, end });
    });

    // 2. Group Rooms by Property and Calculate Stats
    const availabilityData = properties.map(property => {
        const propertyRooms = rooms.filter(r => r.propertyId?._id === property._id || r.propertyId === property._id);

        const roomStats = propertyRooms.map(room => {
            // Count active bookings for this room type on this date
            // Note: If booking tracks specific room number, we count that. 
            // Here 'room' in booking is the Room Type ID.
            const bookedCount = todaysBookings.filter(b => b.room?._id === room._id).length;
            const total = room.quantity || 1;
            const available = Math.max(0, total - bookedCount);

            return {
                ...room,
                total,
                booked: bookedCount,
                available
            };
        });

        return {
            ...property,
            stats: roomStats
        };
    });

    if (loading) return <div className="p-8">Loading Availability...</div>;

    return (
        <div className="min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Availability Calendar</h1>

            {/* Date Picker Section */}
            <div className="card mb-8 flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Check Availability For:</span>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field w-auto py-2"
                />
                <button className="btn-primary px-6 rounded-lg">Search</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Room Availability Tables (Left Col) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-gray-900">Room Availability</h2>

                    {availabilityData.map(property => (
                        <div key={property._id} className="card p-0 overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900">
                                {property.name}
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-gray-400 uppercase font-semibold bg-white border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Room Type</th>
                                        <th className="px-6 py-4 text-center">Total</th>
                                        <th className="px-6 py-4 text-center text-gray-900">Booked</th>
                                        <th className="px-6 py-4 text-center text-black">Available</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {property.stats.map(stat => (
                                        <tr key={stat._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-700">{stat.name}</td>
                                            <td className="px-6 py-4 text-center text-gray-400">{stat.total}</td>
                                            <td className="px-6 py-4 text-center text-red-600 font-bold">{stat.booked}</td>
                                            <td className="px-6 py-4 text-center text-black font-bold text-lg">{stat.available}</td>
                                        </tr>
                                    ))}
                                    {property.stats.length === 0 && (
                                        <tr><td colSpan="4" className="text-center p-8 text-gray-400">No rooms configured.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* Bookings List (Right Col) */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Bookings for {format(dateObj, 'MMM d, yyyy')}</h2>
                    <div className="card p-0 overflow-hidden border border-gray-100 min-h-[200px]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Room</th>
                                    <th className="px-5 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {todaysBookings.map(b => (
                                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-bold text-gray-900">{b.guest.name}</td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{b.room?.name}</td>
                                        <td className="px-5 py-3 text-right">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${b.status === 'confirmed' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'
                                                }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {todaysBookings.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-gray-400">
                                            No bookings for this date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAvailability;
