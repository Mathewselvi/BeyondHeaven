import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await axios.post('http://localhost:5001/api/messages', formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error.response?.data?.message || error.response?.data?.error || 'Failed to send message. Please try again.');
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden bg-secondary">
                <div className="absolute inset-0 bg-secondary">
                    <img
                        src="/royal-villa.jpg"
                        alt="Contact Us"
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative h-full container-custom flex flex-col justify-center items-center text-center text-white pt-20">
                    <h1 className="text-5xl md:text-7xl font-serif font-medium mb-4">Contact Us</h1>
                    <p className="text-lg md:text-xl font-light text-gray-200 max-w-2xl">
                        We are here to assist you. Reach out to us for any inquiries or to plan your perfect stay.
                    </p>
                </div>
            </div>

            <div className="container-custom py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-serif text-secondary mb-8">Get in Touch</h2>

                        <div className="space-y-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-secondary mb-1">Our Location</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Beyond Heaven Resort<br />
                                        123 Paradise Road<br />
                                        Munnar, Kerala 685612
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-secondary mb-1">Phone Number</h3>
                                    <p className="text-gray-600">+91 98765 43210</p>
                                    <p className="text-gray-600">+91 12345 67890</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-secondary mb-1">Email Address</h3>
                                    <p className="text-gray-600">contact@beyondheaven.com</p>
                                    <p className="text-gray-600">reservations@beyondheaven.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Google Map */}
                        <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15764.09346580951!2d77.05952477145749!3d10.088920199066668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0799794d099a6d%3A0x63250e5553b0e0a1!2sMunnar%2C%20Kerala!5e0!3m2!1sen!2sin!4v1652796451234!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Beyond Heaven Location"
                            ></iframe>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-8 md:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                    >
                        <h2 className="text-2xl font-serif text-secondary mb-6">Send us a Message</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="Inquiry about..."
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors flex justify-center items-center shadow-lg shadow-primary/30"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2" size={20} />
                                        Send Message
                                    </>
                                )}
                            </button>

                            {status === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-green-50 text-green-700 rounded-lg text-sm text-center font-medium border border-green-200"
                                >
                                    Message sent successfully! We will get back to you soon.
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium border border-red-200"
                                >
                                    {errorMessage}
                                </motion.div>
                            )}
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
