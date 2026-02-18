import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, MapPin, X, ChevronLeft, ChevronRight, Calendar, Users, AlertCircle } from 'lucide-react';

const RoomDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    // Initial state from URL or defaults
    const [checkInDate, setCheckInDate] = useState(queryParams.get('checkIn') || '');
    const [checkOutDate, setCheckOutDate] = useState(queryParams.get('checkOut') || '');
    const [guestCount, setGuestCount] = useState(queryParams.get('guests') || 2);
    const [mealPlan, setMealPlan] = useState('CP'); // Default to CP: Continental Plan
    const [extraBeds, setExtraBeds] = useState(0);

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    // Availability State
    const [isAvailable, setIsAvailable] = useState(null); // null = unknown, true = yes, false = no
    const [checkingAuth, setCheckingAuth] = useState(false);
    const [recommendations, setRecommendations] = useState([]);

    // Fetch Room Details
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/rooms/${id}`);
                setRoom(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id]);

    // Check Availability when dates change
    useEffect(() => {
        const checkAvailability = async () => {
            if (!checkInDate || !checkOutDate) return;

            setCheckingAuth(true);
            setIsAvailable(null);
            setRecommendations([]);

            try {
                const res = await axios.post('http://localhost:5001/api/bookings/check-availability', {
                    roomId: id,
                    checkIn: checkInDate,
                    checkOut: checkOutDate
                });

                if (res.data.available) {
                    setIsAvailable(true);
                } else {
                    setIsAvailable(false);
                    fetchRecommendations();
                }
            } catch (err) {
                console.error("Availability check failed", err);
                // Treat 400 (Overlap) as unavailable
                setIsAvailable(false);
                fetchRecommendations();
            } finally {
                setCheckingAuth(false);
            }
        };

        // Debounce slightly or just run
        if (checkInDate && checkOutDate) {
            checkAvailability();
        }
    }, [checkInDate, checkOutDate, id]);

    const fetchRecommendations = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/rooms', {
                params: {
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    guests: guestCount
                }
            });
            // Filter out current room
            const others = res.data.data.filter(r => r._id !== id);
            setRecommendations(others.slice(0, 3));
        } catch (err) {
            console.error("Failed to fetch recommendations", err);
        }
    };

    // Keyboard Navigation
    useEffect(() => {
        if (selectedImageIndex === null) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext(e);
            if (e.key === 'ArrowLeft') handlePrev(e);
            if (e.key === 'Escape') setSelectedImageIndex(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, room]);

    const handleNext = (e) => {
        e?.stopPropagation();
        if (room?.images) {
            setSelectedImageIndex((prev) => (prev + 1) % room.images.length);
        }
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        if (room?.images) {
            setSelectedImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-primary font-serif italic text-xl">Loading Experience...</div>;
    if (!room) return <div className="h-screen flex items-center justify-center text-red-500">Room not found</div>;

    // Calculate nights and total
    const nights = checkInDate && checkOutDate ? Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)) : 0;

    // Determine price based on meal plan
    let pricePerNight = room.price; // Default CP
    if (mealPlan === 'EP') pricePerNight = room.priceEP || room.price;
    if (mealPlan === 'MAP') pricePerNight = room.priceMAP || room.price;

    let total = nights > 0 ? nights * pricePerNight : 0;

    // Add Extra Bed cost
    if (extraBeds > 0 && room.priceExtraBed) {
        total += (Number(extraBeds) * Number(room.priceExtraBed) * nights);
    }

    const isValidDates = nights > 0;

    return (
        <div className="pt-24 pb-20 min-h-screen">
            {/* Image Gallery */}
            <div className="h-[60vh] w-full grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-1 container-custom pt-8">
                {/* Main Hero Image */}
                <div onClick={() => setSelectedImageIndex(0)} className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-l-xl group cursor-zoom-in">
                    <img
                        src={room.images?.[0] || 'https://via.placeholder.com/800'}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />
                    <div className="absolute bottom-6 left-6 text-white z-10 pointer-events-none">
                        <Link to={`/search${location.search}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-white/80 hover:text-white mb-2 text-xs uppercase tracking-widest bg-black/30 backdrop-blur-md px-3 py-1 rounded-full w-fit pointer-events-auto"><ArrowLeft size={12} /> Back</Link>
                        <h1 className="text-3xl md:text-5xl leading-tight">{room.name}</h1>
                        <p className="flex items-center gap-2 text-sm text-white/90 mt-2"><MapPin size={14} /> {room.propertyId?.location || 'Beyond Heaven Resort'}</p>
                    </div>
                </div>

                {/* Secondary Images (Grid) */}
                {room.images?.slice(1, 5).map((img, idx) => (
                    <div key={idx} onClick={() => setSelectedImageIndex(idx + 1)} className="relative overflow-hidden hidden md:block group cursor-zoom-in">
                        <img src={img} alt={`View ${idx + 2}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>
                ))}

                {/* View All Button */}
                {room.images?.length > 5 && (
                    <div className="md:hidden absolute bottom-4 right-4 bg-white/90 text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg pointer-events-none">
                        +{room.images.length - 1} Photos
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImageIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm select-none" onClick={() => setSelectedImageIndex(null)}>
                    <button onClick={() => setSelectedImageIndex(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50">
                        <X size={32} />
                    </button>
                    {room.images?.length > 1 && (
                        <>
                            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all z-50">
                                <ChevronLeft size={40} />
                            </button>
                            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all z-50">
                                <ChevronRight size={40} />
                            </button>
                        </>
                    )}
                    <img
                        src={room.images[selectedImageIndex]}
                        alt={`Preview ${selectedImageIndex + 1}`}
                        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-6 text-white/50 text-sm tracking-widest font-mono">
                        {selectedImageIndex + 1} / {room.images.length}
                    </div>
                </div>
            )}

            <div className="container-custom py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Details */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl text-secondary mb-6">Description</h2>
                        <p className="text-gray-500 leading-loose font-light text-lg">{room.description || 'No description available for this suite.'}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl text-secondary mb-6">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {room.features?.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-sm">
                                    <Check size={18} className="text-primary" />
                                    <span className="text-sm tracking-wide">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recommendations Section */}
                    {isAvailable === false && recommendations.length > 0 && (
                        <section className="bg-red-50 p-8 rounded-xl border border-red-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 text-red-700 mb-6">
                                <AlertCircle />
                                <h3 className="text-xl font-medium">This room is unavailable for your dates.</h3>
                            </div>
                            <p className="text-gray-600 mb-6">However, we found these similar rooms available for <strong>{new Date(checkInDate).toLocaleDateString()} - {new Date(checkOutDate).toLocaleDateString()}</strong>:</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recommendations.map(rec => (
                                    <Link key={rec._id} to={`/rooms/${rec._id}?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guestCount}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                        <div className="h-40 overflow-hidden">
                                            <img src={rec.images?.[0]} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-serif text-lg text-secondary mb-1">{rec.name}</h4>
                                            <p className="text-primary font-medium">₹{rec.price} <span className="text-xs text-gray-400">/ night</span></p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Booking Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-32 glass p-8 shadow-2xl border-t-4 border-primary">
                        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-6">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Price per night ({mealPlan})</span>
                                <span className="text-3xl font-serif text-primary">₹{pricePerNight}</span>
                            </div>
                        </div>

                        {/* Meal Plan Selection */}
                        <div className="mb-6 space-y-3">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Select Meal Plan</label>
                            <div className="flex flex-col gap-2">
                                <label className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${mealPlan === 'EP' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" name="mealPlan" value="EP" checked={mealPlan === 'EP'} onChange={() => setMealPlan('EP')} className="accent-primary" />
                                        <span className="text-sm font-medium">EP (Room Only)</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">₹{room.priceEP || 'N/A'}</span>
                                </label>
                                <label className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${mealPlan === 'CP' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" name="mealPlan" value="CP" checked={mealPlan === 'CP'} onChange={() => setMealPlan('CP')} className="accent-primary" />
                                        <span className="text-sm font-medium">CP (Breakfast)</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">₹{room.price}</span>
                                </label>
                                <label className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${mealPlan === 'MAP' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" name="mealPlan" value="MAP" checked={mealPlan === 'MAP'} onChange={() => setMealPlan('MAP')} className="accent-primary" />
                                        <span className="text-sm font-medium">MAP (Breakfast + Meal)</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">₹{room.priceMAP || 'N/A'}</span>
                                </label>
                            </div>
                        </div>

                        {/* Date Selection Inputs */}
                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Check In</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={checkInDate}
                                            onChange={(e) => setCheckInDate(e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary pl-9"
                                        />
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Check Out</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={checkOutDate}
                                            onChange={(e) => setCheckOutDate(e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary pl-9"
                                        />
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Guests</label>
                                <div className="relative">
                                    <select
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(Number(e.target.value))}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary appearance-none pl-9"
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(g => (
                                            <option key={g} value={g}>{g} Guest{g > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Extra Bed Selection */}
                        {room?.priceExtraBed > 0 && (
                            <div className="mb-6 space-y-3">
                                <label className="flex items-center justify-between p-3 border border-gray-200 rounded cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={extraBeds > 0}
                                            onChange={(e) => setExtraBeds(e.target.checked ? 1 : 0)}
                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <div className="text-sm">
                                            <span className="font-medium block">Need Extra Bed?</span>
                                            <span className="text-xs text-gray-500">For additional guest</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">+₹{room.priceExtraBed}</span>
                                </label>
                            </div>
                        )}

                        {/* Availability Status Messages */}
                        {isValidDates && (
                            <div className="mb-6">
                                {checkingAuth ? (
                                    <div className="text-gray-500 text-sm flex items-center gap-2">
                                        <span className="animate-spin">⏳</span> Checking availability...
                                    </div>
                                ) : isAvailable === true ? (
                                    <div className="text-green-600 text-sm flex items-center gap-2 bg-green-50 p-3 rounded">
                                        <Check size={16} /> Room is available!
                                    </div>
                                ) : isAvailable === false ? (
                                    <div className="text-red-500 text-sm flex items-center gap-2 bg-red-50 p-3 rounded">
                                        <X size={16} /> Unavailable for these dates
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {isValidDates && isAvailable && (
                            <div className="space-y-4 mb-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                                <div className="flex justify-between text-lg font-serif text-secondary font-bold">
                                    <span>Total Estimate</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="text-xs text-gray-400 text-right">
                                    For {nights} Night{nights > 1 ? 's' : ''}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => navigate(`/checkout?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guestCount}&roomId=${id}&mealPlan=${mealPlan}&extraBeds=${extraBeds}`)}
                            disabled={!isValidDates || !isAvailable || checkingAuth}
                            className={`w-full block text-center py-4 rounded transition-all duration-300 ${!isValidDates || !isAvailable || checkingAuth
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'btn-primary shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {!checkInDate || !checkOutDate ? 'Select Dates' : isAvailable ? 'Book Now' : 'Unavailable'}
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            {isAvailable === false ? 'Try changing dates or see recommendations' : "You won't be charged yet"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;
