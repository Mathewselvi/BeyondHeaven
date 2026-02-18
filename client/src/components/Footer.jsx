import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-secondary text-white pt-16 pb-8">
            <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="md:col-span-1">
                    <h3 className="text-2xl font-bold tracking-widest text-primary mb-4">
                        BEYOND<span className="text-white">HEAVEN</span>
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Experience the ethereal luxury in the heart of nature.
                        Your perfect escape awaits.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-4 text-primary">Explore</h4>
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Suites & Villas</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Dining</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Wellness</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-4 text-primary">Contact</h4>
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li>123 Luxury Lane, Paradise City</li>
                        <li>+1 (555) 123-4567</li>
                        <li>reservations@beyondheaven.com</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-4 text-primary">Follow Us</h4>
                    <div className="flex space-x-4">
                        <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                            <Facebook size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                            <Twitter size={18} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="container-custom border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                <p>&copy; 2026 BeyondHeaven Resorts. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <Link to="/terms" className="hover:text-white">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
