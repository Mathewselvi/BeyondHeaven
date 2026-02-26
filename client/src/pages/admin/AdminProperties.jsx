import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../utils/api';
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProperties = async () => {
        try {
            const res = await api.get('/properties');
            setProperties(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const [deleteId, setDeleteId] = useState(null);

    const confirmDelete = async (id) => {
        try {
            await api.delete(`/properties/${id}`);
            setProperties(properties.filter(p => p._id !== id));
            setDeleteId(null);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to delete property';
            alert(`Error: ${msg}`);
        }
    };

    if (loading) return <div className="p-8">Loading Properties...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Properties</h1>
                <Link to="/admin/properties/add" className="btn-primary flex items-center gap-2 px-6 rounded-full">
                    <Plus size={18} /> Add Property
                </Link>
            </div>

            <div className="card p-0 overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contacts</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {properties.map((property) => (
                                <tr key={property._id} className="hover:bg-gray-50 transition-colors bg-white">
                                    <td className="px-6 py-4 w-28">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {property.images?.[0] ?
                                                <img src={getImageUrl(property.images[0])} alt="" className="w-full h-full object-cover" /> :
                                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 text-base">{property.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin size={16} className="text-black" />
                                            {property.location || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                                            {property.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {property.phone}</div>}
                                            {property.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {property.email}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {deleteId === property._id ? (
                                            <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded-full border border-red-100 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wide">Confirm?</span>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); confirmDelete(property._id); }} className="text-red-600 hover:text-red-700 font-bold text-xs underline">Yes</button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteId(null); }} className="text-gray-400 hover:text-gray-600 text-xs">No</button>
                                            </div>
                                        ) : (
                                            <>
                                                <Link to={`/admin/properties/edit/${property._id}`} onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"><Edit size={18} /></Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setDeleteId(property._id); }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {properties.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400">
                                        No properties found. Add your first resort or villa.
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

export default AdminProperties;
