import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
            login(res.data.user);
            // Save token to localStorage manually if not handled by cookie entirely or needed for headers
            // My Auth middleware checks header first, so let's save token too if store doesn't
            // But store only saved user info. Let's update store to save token if needed or just rely on cookie?
            // Middleware commented out cookie check. So we NEED token in header.
            // Let's save token to localStorage as well or inside user object in store.
            localStorage.setItem('token', res.data.token);

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-black/20">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
                    <p className="text-gray-500 text-sm mt-1">Please sign in to continue</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-lg text-sm text-center border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-700 mb-1.5 tracking-wide">Email</label>
                        <input
                            type="email"
                            className="input-field w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@beyondheaven.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-700 mb-1.5 tracking-wide">Password</label>
                        <input
                            type="password"
                            className="input-field w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-all uppercase text-sm font-bold tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
