import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, X } from 'lucide-react';

const AdminAddProperty = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        phone: '',
        email: '',
        description: '',
        amenities: '', // Comma separated
        image: ''
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchProperty = async () => {
                try {
                    const res = await axios.get(`http://localhost:5001/api/properties/${id}`);
                    const data = res.data.data;
                    setFormData({
                        name: data.name || '',
                        location: data.location || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        description: data.description || '',
                        amenities: data.amenities ? data.amenities.join(', ') : '',
                        image: data.images?.[0] || ''
                    });
                } catch (err) {
                    console.error(err);
                    setError('Failed to fetch property details');
                }
            };
            fetchProperty();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
                images: formData.image ? [formData.image] : []
            };

            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (isEditMode) {
                await axios.put(`http://localhost:5001/api/properties/${id}`, payload, config);
            } else {
                await axios.post('http://localhost:5001/api/properties', payload, config);
            }
            navigate('/admin/properties');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} property`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all my-8 overflow-hidden">
                <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Property' : 'Add Property'}</h2>
                        <p className="text-xs text-gray-500 mt-1">{isEditMode ? 'Update existing resort details' : 'Create a new resort or villa location'}</p>
                    </div>
                    <Link to="/admin/properties" className="text-gray-400 hover:text-black transition-colors bg-white p-2 rounded-full border border-gray-200">
                        <X size={20} />
                    </Link>
                </div>

                <div className="p-8">
                    {error && <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-lg text-sm border border-red-100">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Property Name</label>
                                <input name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. Merry Woods Resort" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Location</label>
                                <input name="location" required value={formData.location} onChange={handleChange} className="input-field" placeholder="e.g. Wayanad, Kerala" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Phone</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+91..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="contact@..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Description</label>
                            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="input-field resize-none" placeholder="Brief description of the property..." />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Amenities</label>
                            <input name="amenities" placeholder="e.g. WiFi, Pool, Spa (Comma separated)" value={formData.amenities} onChange={handleChange} className="input-field" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Main Image URL</label>
                            <div className="flex gap-2">
                                <input name="image" placeholder="https://..." value={formData.image} onChange={handleChange} className="input-field" />
                                <button type="button" className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors">Browse</button>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-gray-50 mt-6">
                            <Link to="/admin/properties" className="px-6 py-2.5 text-gray-500 font-medium hover:text-black transition-colors">Cancel</Link>
                            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 rounded-lg shadow-lg shadow-black/20">
                                {loading ? 'Saving...' : (isEditMode ? 'Update Property' : 'Create Property')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAddProperty;
