import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Printer, Plus, Filter, RotateCcw, Calendar, Edit, X } from 'lucide-react';

const AdminReservationRegister = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, advance: 0, balance: 0 });
    const [showModal, setShowModal] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('');
    const [search, setSearch] = useState('');

    // Manual Booking Form State
    const [formData, setFormData] = useState({
        guestName: '', email: '', phone: '',
        roomId: '', checkIn: '', checkOut: '',
        adults: 2, children: 0, extraBeds: 0, mealPlan: 'CP',
        totalAmount: 0, advanceAmount: 0,
        source: 'walk-in'
    });
    const [properties, setProperties] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [editBookingId, setEditBookingId] = useState(null);

    useEffect(() => {
        fetchBookings();
        fetchManualData();
    }, [startDate, endDate, sourceFilter, search, propertyFilter]);

    // Auto-calculate Total Price
    useEffect(() => {
        if (formData.roomId && formData.checkIn && formData.checkOut) {
            const room = rooms.find(r => r._id === formData.roomId);
            if (room) {
                const start = new Date(formData.checkIn);
                const end = new Date(formData.checkOut);

                if (!isNaN(start) && !isNaN(end) && end > start) {
                    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

                    // Base Price based on Meal Plan
                    let nightlyRate = room.price; // Default CP
                    if (formData.mealPlan === 'EP') nightlyRate = room.priceEP || room.price;
                    if (formData.mealPlan === 'MAP') nightlyRate = room.priceMAP || room.price;

                    let calculatedTotal = nightlyRate * nights;

                    // Extra Beds
                    if (formData.extraBeds > 0) {
                        calculatedTotal += (Number(room.priceExtraBed || 0) * Number(formData.extraBeds) * nights);
                    }

                    setFormData(prev => ({ ...prev, totalAmount: calculatedTotal }));
                }
            }
        }
    }, [formData.roomId, formData.checkIn, formData.checkOut, formData.mealPlan, formData.extraBeds, rooms]);


    const calculateStats = (data) => {
        const totals = data.reduce((acc, curr) => {
            const total = curr.totalPrice;
            const advance = curr.advanceAmount || 0;
            const balance = total - advance;
            return {
                total: acc.total + total,
                advance: acc.advance + advance,
                balance: acc.balance + balance
            };
        }, { total: 0, advance: 0, balance: 0 });
        setStats(totals);
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            let query = `?sort=-dates.checkIn`;
            if (startDate) query += `&checkIn[gte]=${startDate}`;
            if (endDate) query += `&checkOut[lte]=${endDate}`;
            if (sourceFilter) query += `&source=${sourceFilter}`;
            if (search) query += `&guest.name[regex]=${search}&guest.name[options]=i`;
            if (propertyFilter) query += `&room.propertyId=${propertyFilter}`;

            const res = await api.get(`/bookings${query}`);
            const data = res.data.data.map((b, index) => {
                const total = b.totalPrice;
                const advance = b.advanceAmount || 0;
                const balance = total - advance;

                return {
                    ...b,
                    index: index + 1,
                    propertyName: b.room?.propertyId?.name || 'Manual Entry',
                    roomType: b.room?.type || 'Deluxe',
                    pax: `${b.guests.adults + (b.guests.children || 0)}`,
                    days: Math.ceil((new Date(b.dates.checkOut) - new Date(b.dates.checkIn)) / (1000 * 60 * 60 * 24)),
                    advance,
                    balance
                };
            });

            setBookings(data);
            calculateStats(data); // Extracted helper reused

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchManualData = async () => {
        try {
            const [propRes, roomRes] = await Promise.all([
                api.get('/properties'),
                api.get('/rooms')
            ]);
            setProperties(propRes.data.data);
            setRooms(roomRes.data.data);
        } catch (err) {
            console.error('Error fetching manual data:', err);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [startDate, endDate, sourceFilter]);

    useEffect(() => {
        if (showModal) fetchManualData();
    }, [showModal]);

    const handlePrint = () => {
        window.print();
    };

    const setFilterPreset = (type) => {
        const now = new Date();
        let from, to;
        if (type === 'week') {
            from = new Date(now.setDate(now.getDate() - now.getDay()));
            to = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        } else if (type === 'month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        setStartDate(format(from, 'yyyy-MM-dd'));
        setEndDate(format(to, 'yyyy-MM-dd'));
    };

    const handleEdit = (booking) => {
        setEditBookingId(booking._id);
        setFormData({
            guestName: booking.guest.name,
            email: booking.guest.email,
            phone: booking.guest.phone,
            roomId: booking.room?._id || '',
            checkIn: format(new Date(booking.dates.checkIn), 'yyyy-MM-dd'),
            checkOut: format(new Date(booking.dates.checkOut), 'yyyy-MM-dd'),
            adults: booking.guests.adults,
            children: booking.guests.children,
            extraBeds: booking.guests.extraBeds || 0,
            mealPlan: booking.mealPlan || 'CP',
            totalAmount: booking.totalPrice,
            advanceAmount: booking.advanceAmount,
            source: booking.source || 'walk-in'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this reservation?')) return;
        try {
            await api.delete(`/bookings/${id}`);
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting booking');
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                roomId: formData.roomId,
                checkIn: formData.checkIn,
                checkOut: formData.checkOut,
                guests: {
                    adults: formData.adults,
                    children: formData.children,
                    extraBeds: formData.extraBeds
                },
                guest: {
                    name: formData.guestName,
                    email: formData.email,
                    phone: formData.phone
                },
                mealPlan: formData.mealPlan,
                totalAmount: formData.totalAmount,
                advanceAmount: formData.advanceAmount,
                source: formData.source
            };

            if (editBookingId) {
                // Update
                await api.put(`/bookings/${editBookingId}`, payload);
            } else {
                // Create
                await api.post('/bookings', payload);
            }

            setShowModal(false);
            setEditBookingId(null);
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving booking');
        }
    };

    if (loading) return <div className="p-8">Loading Register...</div>;

    return (
        <div className="flex flex-col h-full print:bg-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reservation Register</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setEditBookingId(null);
                            setFormData({
                                guestName: '', email: '', phone: '',
                                roomId: '', checkIn: '', checkOut: '',
                                adults: 2, children: 0, extraBeds: 0, mealPlan: 'CP',
                                totalAmount: 0, advanceAmount: 0,
                                source: 'walk-in'
                            });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 text-sm font-medium transition-colors"
                    >
                        <Plus size={16} /> Manual Booking
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        <Printer size={16} /> Print Register
                    </button>
                </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 mb-4 print:hidden">
                <button onClick={() => setFilterPreset('week')} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 font-medium">Weekly View</button>
                <button onClick={() => setFilterPreset('month')} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 font-medium">Monthly View</button>
            </div>

            {/* Filters Bar */}
            <div className="card p-4 mb-6 flex flex-wrap gap-4 items-end bg-white border border-gray-100 shadow-sm rounded-xl print:hidden">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Property</label>
                    <div className="relative">
                        <select
                            value={propertyFilter}
                            onChange={(e) => setPropertyFilter(e.target.value)}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
                        >
                            <option value="">All Properties</option>
                            {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none">
                            <Filter size={14} className="text-gray-400" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Source</label>
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                    >
                        <option value="">All Sources</option>
                        <option value="site">Website</option>
                        <option value="walk-in">Walk-in</option>
                        <option value="phone">Phone</option>
                        <option value="booking.com">Booking.com</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Search Guest</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Guest Name..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                </div>
                <div className="w-[150px]">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">From</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                </div>
                <div className="w-[150px]">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">To</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchBookings}
                        className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all flex items-center gap-2 shadow-md shadow-black/10"
                    >
                        <Filter size={14} /> Filter
                    </button>
                    <button
                        onClick={() => { setStartDate(''); setEndDate(''); setSourceFilter(''); setPropertyFilter(''); setSearch(''); }}
                        className="px-3 py-2.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-black transition-colors"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Register Table (Screen View) */}
            <div className="card p-0 overflow-hidden border border-gray-100 rounded-xl shadow-sm print:hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="p-4">#</th>
                                <th className="p-4">Check In</th>
                                <th className="p-4">Check Out</th>
                                <th className="p-4">Guest Name</th>
                                <th className="p-4">Stay</th>
                                <th className="p-4">Source</th>
                                <th className="p-4 text-center">Pax</th>
                                <th className="p-4 text-center">Days</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-right">Adv</th>
                                <th className="p-4 text-right">Bal</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                            {bookings.map((b) => (
                                <tr key={b._id} className="hover:bg-gray-50 transition-colors bg-white">
                                    <td className="p-4 text-gray-400">{b.index}</td>
                                    <td className="p-4 font-mono text-gray-600">{format(new Date(b.dates.checkIn), 'dd-MM-yyyy')}</td>
                                    <td className="p-4 font-mono text-gray-600">{format(new Date(b.dates.checkOut), 'dd-MM-yyyy')}</td>
                                    <td className="p-4 font-bold text-gray-900">{b.guest.name}</td>
                                    <td className="p-4 text-gray-500 truncate max-w-[150px]" title={b.propertyName}>{b.propertyName}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${b.source === 'site' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {b.source || 'site'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">{b.pax}</td>
                                    <td className="p-4 text-center">{b.days}</td>
                                    <td className="p-4 text-right font-mono text-gray-900">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                                    <td className="p-4 text-right font-mono text-gray-500">₹{b.advance.toLocaleString('en-IN')}</td>
                                    <td className="p-4 text-right font-mono font-bold text-gray-900">₹{b.balance.toLocaleString('en-IN')}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={() => handleEdit(b)}
                                                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(b._id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr><td colSpan="12" className="p-8 text-center text-gray-400">No bookings found.</td></tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-900 text-white text-xs font-bold uppercase">
                            <tr>
                                <td colSpan="8" className="p-4 text-right tracking-wider opacity-70">Monthly Totals:</td>
                                <td className="p-4 text-right font-mono text-sm">₹{stats.total.toLocaleString('en-IN')}</td>
                                <td className="p-4 text-right font-mono text-gray-400 text-sm">₹{stats.advance.toLocaleString('en-IN')}</td>
                                <td className="p-4 text-right font-mono text-white text-sm">₹{stats.balance.toLocaleString('en-IN')}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Premium Print Layout (Hidden on Screen) */}
            <div className="hidden print:block font-serif text-black p-8">
                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">Beyond Heaven</h1>
                    <p className="text-sm uppercase tracking-widest text-gray-600">Luxury Resort & Stays</p>
                    <div className="mt-6 flex justify-between items-end">
                        <div className="text-left">
                            <h2 className="text-xl font-bold uppercase">Reservation Register</h2>
                            <p className="text-xs mt-1">Report Generated: {format(new Date(), 'dd MMM yyyy, HH:mm')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold">Period: <span className="font-normal">{startDate ? format(new Date(startDate), 'dd MMM yyyy') : 'Start'} - {endDate ? format(new Date(endDate), 'dd MMM yyyy') : 'Current'}</span></p>
                            <p className="text-sm font-bold">Filter: <span className="font-normal uppercase">{sourceFilter || 'All Sources'}</span></p>
                        </div>
                    </div>
                </div>

                {/* Print Table */}
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-2 font-bold uppercase">#</th>
                            <th className="py-2 font-bold uppercase">Guest Details</th>
                            <th className="py-2 font-bold uppercase">Room & Dates</th>
                            <th className="py-2 font-bold uppercase text-center">Source</th>
                            <th className="py-2 font-bold uppercase text-center">Pax</th>
                            <th className="py-2 font-bold uppercase text-right">Total</th>
                            <th className="py-2 font-bold uppercase text-right">Paid</th>
                            <th className="py-2 font-bold uppercase text-right">Due</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {bookings.map((b, i) => (
                            <tr key={b._id} className="break-inside-avoid">
                                <td className="py-3 align-top">{i + 1}</td>
                                <td className="py-3 align-top">
                                    <div className="font-bold text-sm">{b.guest.name}</div>
                                    <div className="text-gray-600">{b.guest.phone}</div>
                                    <div className="text-gray-500 italic text-[10px]">{b.guest.email}</div>
                                </td>
                                <td className="py-3 align-top">
                                    <div className="font-bold">{b.propertyName}</div>
                                    <div className="text-xs">{b.roomType}</div>
                                    <div className="mt-1 font-mono text-[10px]">
                                        {format(new Date(b.dates.checkIn), 'dd MMM')} - {format(new Date(b.dates.checkOut), 'dd MMM yyyy')}
                                        <span className="ml-1 font-sans text-gray-500">({b.days}N)</span>
                                    </div>
                                </td>
                                <td className="py-3 align-top text-center uppercase text-[10px] font-bold tracking-wider">
                                    {b.source || 'SITE'}
                                </td>
                                <td className="py-3 align-top text-center">{b.pax}</td>
                                <td className="py-3 align-top text-right font-mono font-medium">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                                <td className="py-3 align-top text-right font-mono text-gray-600">₹{b.advance.toLocaleString('en-IN')}</td>
                                <td className="py-3 align-top text-right font-mono font-bold">₹{b.balance.toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-black font-bold text-sm">
                            <td colSpan="5" className="py-4 text-right pr-4 uppercase">Totals</td>
                            <td className="py-4 text-right">₹{stats.total.toLocaleString('en-IN')}</td>
                            <td className="py-4 text-right">₹{stats.advance.toLocaleString('en-IN')}</td>
                            <td className="py-4 text-right">₹{stats.balance.toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer */}
                <div className="mt-16 flex justify-between items-top text-xs uppercase tracking-widest pt-8 border-t border-gray-200">
                    <div>
                        <p className="mb-8">Prepared By: ______________________</p>
                    </div>
                    <div>
                        <p className="mb-8">Authorized Signatory: ______________________</p>
                    </div>
                </div>
            </div>

            {/* Manual Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold">{editBookingId ? 'Edit Reservation' : 'New Manual Booking'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleManualSubmit} className="p-6 space-y-6">
                            {/* Guest Details */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Guest Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.guestName}
                                            onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Stay Details */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Stay Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Select Room</label>
                                        <select
                                            required
                                            value={formData.roomId}
                                            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                        >
                                            <option value="">-- Choose Room --</option>
                                            {rooms.map(room => (
                                                <option key={room._id} value={room._id}>
                                                    {room.name} ({room.propertyId?.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                                        <select
                                            value={formData.source}
                                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                        >
                                            <option value="walk-in">Walk-in</option>
                                            <option value="phone">Phone Call</option>
                                            <option value="booking.com">Booking.com</option>
                                            <option value="airbnb">Airbnb</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Check In</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.checkIn}
                                            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Check Out</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.checkOut}
                                            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                        />
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Adults</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.adults}
                                                onChange={(e) => setFormData({ ...formData, adults: Number(e.target.value) })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Children</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.children}
                                                onChange={(e) => setFormData({ ...formData, children: Number(e.target.value) })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Extra Beds</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.extraBeds}
                                                onChange={(e) => setFormData({ ...formData, extraBeds: Number(e.target.value) })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Meal Plan</label>
                                            <select
                                                value={formData.mealPlan}
                                                onChange={(e) => setFormData({ ...formData, mealPlan: e.target.value })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            >
                                                <option value="CP">CP (Breakfast)</option>
                                                <option value="MAP">MAP (Breakfast + Dinner)</option>
                                                <option value="EP">EP (No Meals)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Payment */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Payment Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            value={formData.totalAmount}
                                            onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Advance Paid (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.advanceAmount}
                                            onChange={(e) => setFormData({ ...formData, advanceAmount: Number(e.target.value) })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono"
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/20"
                                >
                                    {editBookingId ? 'Update Reservation' : 'Create Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    @page { margin: 0.5cm; size: A4 portrait; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    /* Hide everything by default */
                    body > * { display: none !important; }
                    /* Show only our print container */
                    #root, .print\\:block { display: block !important; width: 100% !important; height: auto !important; position: static !important; overflow: visible !important; }
                    /* Hide non-print children of root if necessary, but simpler is to rely on Tailwind's print:hidden on the main container if possible, 
                       or just ensure the print container covers everything. 
                       Actually, the best way in React is to wrap the screen content in print:hidden 
                       and the print content in print:block. */
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminReservationRegister;
