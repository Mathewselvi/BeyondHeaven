import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BedDouble, LogOut, Home, ClipboardList, Image, Mail, CalendarCheck, Menu, X } from 'lucide-react';
import useAuthStore from '../store/authStore';

const AdminLayout = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/bookings', label: 'Bookings', icon: <CalendarDays size={20} /> },
        { path: '/admin/register', label: 'Register', icon: <ClipboardList size={20} /> },
        // { path: '/admin/properties', label: 'Properties', icon: <Home size={20} /> }, // Hidden for Single Resort Mode
        { path: '/admin/rooms', label: 'Inventory', icon: <BedDouble size={20} /> },
        { path: '/admin/content', label: 'Site Content', icon: <Image size={20} /> },
        { path: '/admin/messages', label: 'Messages', icon: <Mail size={20} /> },
        { path: '/admin/availability', label: 'Availability', icon: <CalendarCheck size={20} /> },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Mobile Header */}
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-secondary text-white z-50 flex items-center justify-between p-4 shadow-md">
                <span className="font-serif font-bold text-lg tracking-wide text-primary">BEYOND MANAGER</span>
                <button onClick={toggleSidebar} className="text-white hover:text-primary transition-colors">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 w-72 bg-secondary text-white transform transition-transform duration-300 ease-in-out border-r border-white/5
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 flex flex-col h-full shadow-2xl
            `}>
                <div className="p-8 hidden md:block border-b border-white/5">
                    <h2 className="text-3xl font-serif font-bold tracking-widest text-primary">BEYOND</h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-2 ml-1">MANAGER INTERFACE</p>
                </div>

                <div className="mt-8 flex-1 overflow-y-auto px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    group flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all duration-300 rounded-lg relative overflow-hidden
                                    ${isActive
                                        ? 'text-primary bg-white/5 shadow-inner'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                )}
                                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className="tracking-wide">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-6 py-4 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all duration-300 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="tracking-wide">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden pt-16 md:pt-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
