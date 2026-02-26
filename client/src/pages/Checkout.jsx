import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle } from 'lucide-react';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const roomId = queryParams.get('roomId');
    const checkIn = queryParams.get('checkIn');
    const checkOut = queryParams.get('checkOut');
    const adults = queryParams.get('adults') || queryParams.get('guests') || 1;
    const children = queryParams.get('children') || 0;
    const mealPlan = queryParams.get('mealPlan') || 'CP';
    const extraBeds = queryParams.get('extraBeds') || 0;

    const [room, setRoom] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    useEffect(() => {
        if (roomId) {
            api.get(`/rooms/${roomId}`)
                .then(res => setRoom(res.data.data))
                .catch(err => console.error(err));
        }
    }, [roomId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!termsAccepted) {
            setError('Please agree to the Terms & Conditions to proceed.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await api.post('/bookings', {
                roomId,
                checkIn,
                checkOut,
                guests: {
                    adults: Number(adults),
                    children: Number(children),
                    extraBeds: Number(extraBeds)
                },
                guest: formData,
                mealPlan,
                totalAmount: 0 // Calculated on backend
            });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 md:p-12 shadow-2xl max-w-lg text-center border-t-4 border-primary">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl text-secondary mb-4">Request Received</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Thank you, {formData.name}. We have received your booking request for <strong>{room?.name}</strong>.
                        <br /><br />
                        We have sent a <strong>receipt email</strong> to {formData.email}.
                        <br />
                        Please note: Your booking is <strong>PENDING</strong>. You will receive a separate confirmation email once our Admin approves your stay.
                    </p>
                    <button onClick={() => navigate('/')} className="btn-outline text-secondary border-secondary hover:bg-secondary hover:text-white">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen bg-slate-50">
            <div className="container-custom max-w-4xl mx-auto">
                <h1 className="text-3xl text-secondary mb-8">Confirm Your Stay</h1>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Form */}
                    <div className="md:col-span-3 bg-white p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl mb-6 ">Guest Information</h2>
                        {error && <div className="bg-red-50 text-red-600 p-4 mb-6 text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 p-3 focus:outline-none focus:border-primary transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 p-3 focus:outline-none focus:border-primary transition-colors"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 p-3 focus:outline-none focus:border-primary transition-colors"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                                    I agree to the <a href="/terms" target="_blank" className="text-primary underline hover:text-secondary">Terms & Conditions</a>, Cancellation Policy, and Important Notes.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !termsAccepted}
                                className="w-full btn-primary py-4 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-2">
                        <div className="bg-secondary text-white p-8 sticky top-32">
                            <h3 className="text-xl mb-6 text-primary">Booking Summary</h3>
                            {room && (
                                <>
                                    <div className="mb-4">
                                        <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Room</div>
                                        <div className="text-lg font-medium">{room.name}</div>
                                    </div>
                                    <div className="mb-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Check In</span>
                                            <span>{checkIn}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Check Out</span>
                                            <span>{checkOut}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Guests</span>
                                            <span>{Number(adults) + Number(children)} Guests</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Meal Plan</span>
                                            <span>{mealPlan}</span>
                                        </div>
                                        {Number(extraBeds) > 0 && (
                                            <div className="flex justify-between text-sm text-primary">
                                                <span className="text-gray-400">Extra Bed</span>
                                                <span>{extraBeds} (+₹{room.priceExtraBed})</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-white/10 pt-4 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Total Estimate</span>
                                            {/* Logic duplicated for visual display - ideally helper */}
                                            <span className="text-2xl font-serif text-primary">
                                                ₹{(() => {
                                                    const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0;
                                                    let price = room.price;
                                                    if (mealPlan === 'EP') price = room.priceEP || room.price;
                                                    if (mealPlan === 'MAP') price = room.priceMAP || room.price;

                                                    let total = nights * Number(price);
                                                    if (Number(extraBeds) > 0 && room.priceExtraBed) {
                                                        total += (Number(extraBeds) * Number(room.priceExtraBed) * nights);
                                                    }
                                                    return total;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
