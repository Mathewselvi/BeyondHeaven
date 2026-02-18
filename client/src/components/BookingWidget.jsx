import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Search } from 'lucide-react';


const BookingWidget = () => {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (checkIn && checkOut) {
            navigate(`/search?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`);
        }
    };

    return (
        <div
            className="w-full max-w-5xl mx-auto -mt-16 relative z-30 px-4"
        >
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-sm shadow-2xl flex flex-col md:flex-row gap-6 items-end">

                {/* Check In */}
                <div className="flex-1 w-full space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Check In</label>
                    <div className="relative group">
                        <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 text-primary group-hover:text-primary-dark transition-colors" size={20} />
                        <input
                            type="date"
                            className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 focus:outline-none focus:border-primary transition-colors text-secondary font-medium tracking-wide"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                    </div>
                </div>

                {/* Check Out */}
                <div className="flex-1 w-full space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Check Out</label>
                    <div className="relative group">
                        <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 text-primary group-hover:text-primary-dark transition-colors" size={20} />
                        <input
                            type="date"
                            className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 focus:outline-none focus:border-primary transition-colors text-secondary font-medium tracking-wide"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                        />
                    </div>
                </div>

                {/* Guests */}
                {/* Adults */}
                <div className="flex-1 w-full space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Adults</label>
                    <div className="relative group">
                        <Users className="absolute left-0 top-1/2 -translate-y-1/2 text-primary group-hover:text-primary-dark transition-colors" size={20} />
                        <select
                            className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 focus:outline-none focus:border-primary transition-colors text-secondary font-medium tracking-wide appearance-none"
                            value={adults}
                            onChange={(e) => setAdults(Number(e.target.value))}
                        >
                            <option value="1">1 Adult</option>
                            <option value="2">2 Adults</option>
                            <option value="3">3 Adults</option>
                            <option value="4">4 Adults</option>
                        </select>
                    </div>
                </div>

                {/* Children */}
                <div className="flex-1 w-full space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Children</label>
                    <div className="relative group">
                        <Users className="absolute left-0 top-1/2 -translate-y-1/2 text-primary group-hover:text-primary-dark transition-colors" size={20} />
                        <select
                            className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 focus:outline-none focus:border-primary transition-colors text-secondary font-medium tracking-wide appearance-none"
                            value={children}
                            onChange={(e) => setChildren(Number(e.target.value))}
                        >
                            <option value="0">0 Children</option>
                            <option value="1">1 Child</option>
                            <option value="2">2 Children</option>
                            <option value="3">3 Children</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="w-full md:w-auto space-y-2">
                    <label className="hidden md:block text-xs uppercase tracking-widest font-bold text-transparent select-none">Search</label>
                    <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 py-3 px-8 shadow-xl">
                        <Search size={18} />
                        <span>Check Availability</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingWidget;
