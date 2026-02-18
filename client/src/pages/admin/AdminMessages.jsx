import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Trash2, Reply } from 'lucide-react';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5001/api/messages', config);
                setMessages(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const [deleteId, setDeleteId] = useState(null);

    const confirmDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5001/api/messages/${id}`, config);
            setMessages(messages.filter(m => m._id !== id));
            setDeleteId(null);
        } catch (err) {
            console.error(err);
            alert('Failed to delete message');
        }
    };

    if (loading) return <div className="p-8">Loading Messages...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Inbox</h1>

            <div className="card p-0 overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                            <th className="p-5 w-48">Date</th>
                            <th className="p-5 w-64">From</th>
                            <th className="p-5">Message</th>
                            <th className="p-5 w-32 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {messages.map((msg) => (
                            <tr key={msg._id} className="hover:bg-gray-50 transition-colors bg-white group">
                                <td className="p-5 text-gray-400 text-xs font-mono">
                                    {format(new Date(msg.createdAt), 'MMM d, yyyy HH:mm')}
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-gray-900">{msg.name}</div>
                                    <div className="text-xs text-gray-500">{msg.email}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{msg.phone}</div>
                                </td>
                                <td className="p-5 text-gray-600 leading-relaxed">
                                    {msg.message}
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-3 text-xs font-medium items-center">
                                        <a href={`mailto:${msg.email}`} className="text-gray-900 hover:text-black hover:underline flex items-center gap-1">
                                            Reply
                                        </a>
                                        {deleteId === msg._id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-red-600 font-bold">Delete?</span>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); confirmDelete(msg._id); }} className="text-red-600 hover:underline font-bold">Yes</button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteId(null); }} className="text-gray-400 hover:text-gray-600">No</button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setDeleteId(msg._id); }}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {messages.length === 0 && (
                    <div className="p-16 text-center text-gray-400">
                        <p>No messages in inbox.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
