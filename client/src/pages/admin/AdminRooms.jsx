import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Edit, X } from 'lucide-react';

const AdminRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRooms = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/rooms');
            setRooms(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const [deleteId, setDeleteId] = useState(null);

    const confirmDelete = async (id) => {
        try {
            // Retrieve token manually
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.delete(`http://localhost:5001/api/rooms/${id}`, config);
            // Refresh list
            setRooms(rooms.filter(room => room._id !== id));
            setDeleteId(null);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to delete room';
            alert(`Error: ${msg}`);
        }
    };

    if (loading) return <div className="p-8">Loading Rooms...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Room Inventory</h1>
                <Link to="/admin/rooms/add" className="btn-primary rounded-full px-6 flex items-center gap-2">
                    <Plus size={18} /> Add New Room
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <div key={room._id} className="card p-0 group overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                        {/* Image Header */}
                        <div className="relative h-56 bg-gray-200 overflow-hidden">
                            {room.images?.length > 0 ? (
                                <>
                                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                        📷 {room.images.length}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">🛏️ No Image</div>
                            )}
                            {/* Badges */}
                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                {room.propertyId?.name || 'Resort'}
                            </div>
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                Qty: {room.quantity || 1}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{room.name}</h3>
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 h-8">{room.description || 'No description provided.'}</p>

                            <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                                <div className="flex flex-col text-right">
                                    <div className="text-black font-bold text-xl font-mono">
                                        ₹{room.price?.toLocaleString('en-IN')} <span className="text-[10px] items-center text-gray-400 font-sans tracking-wide uppercase">CP</span>
                                    </div>
                                    {room.priceEP && <div className="text-xs text-gray-500">₹{room.priceEP} <span className="text-[8px] uppercase">EP</span></div>}
                                    {room.priceMAP && <div className="text-xs text-gray-500">₹{room.priceMAP} <span className="text-[8px] uppercase">MAP</span></div>}
                                    {room.priceExtraBed > 0 && <div className="text-xs text-blue-500">₹{room.priceExtraBed} <span className="text-[8px] uppercase">Ex. Bed</span></div>}
                                </div>
                                <div className="flex gap-1 items-center">
                                    {deleteId === room._id ? (
                                        <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded-full border border-red-100 animate-in fade-in zoom-in duration-200">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); confirmDelete(room._id); }} className="text-red-600 font-bold text-xs hover:underline">Confirm</button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteId(null); }} className="text-gray-400 text-xs hover:text-gray-600"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <Link to={`/admin/rooms/edit/${room._id}`} onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors"><Edit size={18} /></Link>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setDeleteId(room._id); }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-full transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {rooms.length === 0 && (
                    <div className="col-span-full p-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="mb-4 text-6xl opacity-20">🛏️</div>
                        <p className="text-lg font-medium text-gray-900">No rooms found</p>
                        <p className="text-sm">Get started by adding your first suite.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRooms;
