import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Search as SearchIcon, Calendar, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const Search = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const checkIn = queryParams.get('checkIn');
    const checkOut = queryParams.get('checkOut');
    const guests = queryParams.get('guests');
    const adults = queryParams.get('adults') || 0;
    const children = queryParams.get('children') || 0;

    // Fallback for display
    const guestDisplay = guests ? `${guests} Guests` : `${adults} Adults, ${children} Children`;

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // Adjust API URL if needed (e.g., config file)
                const res = await axios.get(`http://localhost:5001/api/rooms${location.search}`);
                setRooms(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if ((checkIn && checkOut) || location.pathname === '/rooms') {
            fetchRooms();
        }
    }, [location.search, checkIn, checkOut, location.pathname]);

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/royal-villa.jpg"
                        alt="Our Rooms"
                        className="w-full h-full object-cover scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.span
                        initial={{ opacity: 0, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.5em" }}
                        transition={{ duration: 1.5 }}
                        className="text-xs md:text-sm uppercase font-bold tracking-[0.5em] mb-4 block text-primary"
                    >
                        Accommodations
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-5xl md:text-7xl font-serif mb-6"
                    >
                        Sanctuaries of Silence
                    </motion.h1>
                    <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
                        Find your perfect escape among our curated collection of private villas and suites.
                    </p>
                </div>
            </div>

            <div className="container-custom py-20">
                {/* Search Summary Header */}
                <div className="mb-12 glass p-6 rounded-sm flex flex-col md:flex-row justify-between items-center text-secondary">
                    <div>
                        {location.pathname === '/rooms' ? (
                            <>
                                <h1 className="text-3xl mb-2">Our Collection</h1>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                                    Browse our exclusive suites and villas
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl mb-2">Available Stays</h1>
                                <p className="text-gray-500 flex gap-4 text-sm font-medium uppercase tracking-wide">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {checkIn || 'Any dates'} - {checkOut || ''}</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> {guestDisplay}</span>
                                </p>
                            </>
                        )}
                    </div>
                    {location.pathname !== '/rooms' && (
                        <Link to="/" className="text-primary hover:text-primary-dark font-medium text-sm mt-4 md:mt-0 underline">Modify Search</Link>
                    )}
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse">Searching for paradise...</div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-serif mb-4">No rooms available</h2>
                        <p className="text-gray-500 mb-8">All our suites are booked for these dates. Please try flexible dates.</p>
                        <Link to="/" className="btn-primary">Search Again</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room) => (
                            <div key={room._id} className="bg-white group hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
                                {/* Image Slider Placeholder */}
                                <div className="h-64 overflow-hidden relative bg-gray-200">
                                    {room.images && room.images.length > 0 ? (
                                        <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-widest text-secondary">
                                        {room.type}
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl text-secondary mb-1">{room.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{room.propertyId?.location || 'Location'}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 font-light">{room.description || 'Experience luxury in this exquisite room.'}</p>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-end justify-between">
                                        <div>
                                            <span className="text-2xl font-serif text-primary">₹{room.price}</span>
                                            <span className="text-gray-400 text-xs ml-1">/ night</span>
                                        </div>
                                        <Link
                                            to={`/rooms/${room._id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`}
                                            className="group-hover:translate-x-1 transition-transform flex items-center gap-1 text-secondary font-medium text-sm hover:text-primary"
                                        >
                                            View Details <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
