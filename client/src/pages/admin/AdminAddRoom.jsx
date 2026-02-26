import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api, { getImageUrl } from '../../utils/api';
import { X, UploadCloud, Trash2, Star } from 'lucide-react';

const AdminAddRoom = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        propertyId: '',
        name: '',
        type: 'Standard', // Default
        price: '',
        priceEP: '',
        priceMAP: '',
        priceExtraBed: '',
        quantity: 1,
        maxGuests: 2,
        description: '',
        amenities: '',
        image: [] // Changed to array for multiple images
    });

    useEffect(() => {
        // Fetch properties for auto-assignment
        const fetchProperties = async () => {
            try {
                const res = await api.get('/properties');
                setProperties(res.data.data);

                // Auto-select the first property (Main Resort)
                if (res.data.data.length > 0) {
                    if (!isEditMode) {
                        setFormData(prev => ({ ...prev, propertyId: res.data.data[0]._id }));
                    }
                } else {
                    setError("Warning: No 'Property' found in database. Rooms require a parent property.");
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchProperties();

        // Fetch room details if in edit mode
        if (isEditMode) {
            const fetchRoom = async () => {
                try {
                    const res = await api.get(`/rooms/${id}`);
                    const data = res.data.data;
                    setFormData({
                        propertyId: data.propertyId?._id || data.propertyId || '',
                        name: data.name || '',
                        type: data.type || 'Standard',
                        price: data.price || '',
                        priceEP: data.priceEP || '',
                        priceMAP: data.priceMAP || '',
                        priceExtraBed: data.priceExtraBed || '',
                        quantity: data.quantity || 1,
                        maxGuests: data.maxGuests || 2,
                        description: data.description || '',
                        amenities: data.features ? data.features.join(', ') : '',
                        image: data.images || [] // Ensure array
                    });
                } catch (err) {
                    console.error(err);
                    setError('Failed to fetch room details');
                }
            };
            fetchRoom();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const uploadData = new FormData();
        files.forEach(file => {
            uploadData.append('images', file);
        });

        try {
            setLoading(true);
            const res = await api.post('/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Append new URLs to existing images
            setFormData(prev => ({
                ...prev,
                image: [...prev.image, ...res.data.data]
            }));
        } catch (err) {
            console.error(err);
            alert('Image upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                features: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
                images: formData.image // Already an array of URLs
            };

            if (isEditMode) {
                await api.put(`/rooms/${id}`, payload);
            } else {
                await api.post('/rooms', payload);
            }
            navigate('/admin/rooms');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} room`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center px-6 md:px-8 py-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Room' : 'Add New Room Type'}</h2>
                        <p className="text-xs text-gray-500 mt-1">{isEditMode ? 'Update room inventory and details' : 'Configure inventory and pricing'}</p>
                    </div>
                    <Link to="/admin/rooms" className="text-gray-400 hover:text-black transition-colors bg-white p-2 rounded-full border border-gray-200">
                        <X size={20} />
                    </Link>
                </div>

                <div className="p-6 md:p-8">
                    {error && <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-lg text-sm border border-red-100">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Room Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. Superior Room" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">CP Price (Base) (₹)</label>
                                <input name="price" type="number" value={formData.price} onChange={handleChange} className="input-field" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">EP Price (Room Only) (₹)</label>
                                <input name="priceEP" type="number" value={formData.priceEP} onChange={handleChange} className="input-field" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">MAP Price (Breakfast+Meal) (₹)</label>
                                <input name="priceMAP" type="number" value={formData.priceMAP} onChange={handleChange} className="input-field" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Extra Bed Price (₹)</label>
                                <input name="priceExtraBed" type="number" value={formData.priceExtraBed} onChange={handleChange} className="input-field" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Quantity</label>
                                <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="input-field" placeholder="1" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Capacity (Persons)</label>
                            <input name="maxGuests" type="number" value={formData.maxGuests} onChange={handleChange} className="input-field" placeholder="2" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Description</label>
                            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="input-field resize-none" placeholder="Room details and view..." />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Amenities</label>
                            <input name="amenities" placeholder="WiFi, AC, TV (Comma separated)" value={formData.amenities} onChange={handleChange} className="input-field" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Room Images</label>

                            {/* Image Previews */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {Array.isArray(formData.image) && formData.image.map((imgUrl, index) => (
                                    <div key={index} className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border ${index === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                                        <img src={getImageUrl(imgUrl)} alt={`Room ${index + 1}`} className="w-full h-full object-cover" />

                                        {/* Cover Badge */}
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                                                Cover
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = formData.image.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, image: newImages });
                                                }}
                                                className="bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-red-50 shadow-sm transition-transform hover:scale-110"
                                                title="Delete Image"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            {index !== 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const imageToMove = formData.image[index];
                                                        const newImages = [imageToMove, ...formData.image.filter((_, i) => i !== index)];
                                                        setFormData({ ...formData, image: newImages });
                                                    }}
                                                    className="bg-white/90 p-1.5 rounded-full text-yellow-500 hover:bg-yellow-50 shadow-sm transition-transform hover:scale-110"
                                                    title="Set as Cover"
                                                >
                                                    <Star size={14} fill="currentColor" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Upload Button */}
                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50 transition-colors group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                                        <UploadCloud size={24} className="text-gray-400 group-hover:text-black mb-2 transition-colors" />
                                        <p className="text-[10px] text-gray-500 font-medium">Click to upload</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                            <p className="text-[10px] text-gray-400">Supported formats: JPG, PNG, WebP. No size limit.</p>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-gray-50 mt-6">
                            <Link to="/admin/rooms" className="px-6 py-2.5 text-gray-500 font-medium hover:text-black transition-colors">Cancel</Link>
                            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 rounded-lg shadow-lg shadow-black/20">
                                {loading ? 'Saving...' : (isEditMode ? 'Update Room' : 'Save Room')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAddRoom;
