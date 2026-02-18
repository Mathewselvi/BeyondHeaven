import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Determine if at top or scrolled style
            if (currentScrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Determine Scroll Direction for Visibility
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling DOWN -> Hide
                setIsVisible(false);
            } else {
                // Scrolling UP -> Show
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Check if we are on the home page for transparency effect
    const isHome = location.pathname === '/';

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${isScrolled || !isHome ? 'bg-secondary/90 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
            <div className="container-custom flex justify-between items-center text-white">
                {/* Logo */}
                <Link to="/" className="text-2xl font-serif font-bold tracking-widest text-primary">
                    BEYOND<span className="text-white">HEAVEN</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-8 items-center uppercase tracking-wider text-sm font-medium">
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'Suites', path: '/rooms' },
                        { name: 'Experience', path: '/about' },
                        { name: 'Gallery', path: '/gallery' },
                        { name: 'Terms', path: '/terms' },
                        { name: 'Contact', path: '/contact' },
                    ].map((link) => (
                        <motion.div
                            key={link.name}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link to={link.path} className="hover:text-primary transition-colors block">
                                {link.name}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-secondary border-t border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 space-y-4 uppercase tracking-wider text-sm font-medium text-white">
                            <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-primary">Home</Link>
                            <Link to="/rooms" onClick={() => setIsOpen(false)} className="hover:text-primary">Suites</Link>
                            <Link to="/experience" onClick={() => setIsOpen(false)} className="hover:text-primary">Experience</Link>
                            <Link to="/terms" onClick={() => setIsOpen(false)} className="hover:text-primary">Terms</Link>
                            <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-primary">Contact</Link>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
