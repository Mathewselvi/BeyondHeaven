import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
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
                        <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li><Link to="/rooms" className="hover:text-white transition-colors">Suites & Villas</Link></li>
                        <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-4 text-primary">Contact</h4>
                    <ul className="space-y-3 text-gray-400 text-sm">
                        <li className="flex items-center gap-2">
                            <MapPin size={16} className="text-primary" />
                            <span>Ottamaram, Munnar - Bison Valley Road, Munnar, Kerala 685565</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone size={16} className="text-primary" />
                            <a href="tel:+919946182774" className="hover:text-white transition-colors">+91 99461 82774</a>
                        </li>
                        <li className="flex items-center gap-3 ml-6">
                            <a href="tel:+916282097720" className="hover:text-white transition-colors">+91 62820 97720</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail size={16} className="text-primary" />
                            <a href="mailto:thebeyondheaven@gmail.com" className="hover:text-white transition-colors">thebeyondheaven@gmail.com</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-4 text-primary">Follow Us</h4>
                    <div className="flex space-x-4">
                        <a
                            href="https://www.instagram.com/__beyond.heaven__?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"
                        >
                            <Instagram size={18} />
                        </a>
                        <a
                            href="https://wa.me/919946182774"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-green-600 hover:border-green-600 transition-all"
                        >
                            <MessageCircle size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                            <Facebook size={18} />
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
