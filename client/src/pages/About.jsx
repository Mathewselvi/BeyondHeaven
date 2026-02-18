import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, Compass, Heart, MapPin, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
    const [content, setContent] = useState({
        hero: null,
        story: null,
        gallery: null,
        cta: null
    });
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/content/about');
                const data = res.data.data;

                const contentMap = {
                    hero: data.find(c => c.section === 'hero'),
                    story: data.find(c => c.section === 'story'),
                    gallery: data.find(c => c.section === 'gallery'),
                    cta: data.find(c => c.section === 'cta')
                };
                setContent(contentMap);
            } catch (err) {
                console.error("Failed to load about content", err);
            }
        };
        fetchContent();
    }, []);

    // Helper for image URLs
    const getImg = (section, index = 0, defaultImg) => {
        const config = content[section];
        if (config?.images && config.images[index]) {
            return `http://localhost:5001${config.images[index]}`;
        }
        return defaultImg;
    };

    // Helper for text
    const getText = (section, field, defaultText) => {
        return content[section]?.[field] || defaultText;
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="bg-white min-h-screen">
            <Navbar />

            {/* 1. Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={getImg('hero', 0, '/royal-villa.jpg')}
                        alt="Beyond Heaven Hero"
                        loading="eager" /* Hero image should be eager */
                        className="w-full h-full object-cover scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.span
                        initial={{ opacity: 0, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.5em" }}
                        transition={{ duration: 1.5 }}
                        className="text-xs md:text-sm uppercase font-bold tracking-[0.5em] mb-4 block"
                    >
                        {getText('hero', 'subtitle', 'Welcome to')}
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-5xl md:text-8xl font-serif mb-6"
                    >
                        {getText('hero', 'title', 'Beyond Heaven')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-lg md:text-2xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed"
                    >
                        {getText('hero', 'description', 'A sanctuary for the soul, where the horizon has no end and time stands still.')}
                    </motion.p>
                </div>
            </section>

            {/* 2. Our Origin Story */}
            <section className="py-24 md:py-32 container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="space-y-8"
                    >
                        <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                            <span className="w-12 h-[1px] bg-secondary"></span> Our Story
                        </span>
                        <h2 className="text-4xl md:text-6xl text-secondary font-serif leading-tight">
                            {getText('story', 'title') ? (
                                <span dangerouslySetInnerHTML={{ __html: getText('story', 'title') }} />
                            ) : (
                                <>Born from the <span className="italic text-primary">Silence</span> of Nature.</>
                            )}
                        </h2>
                        <p className="text-gray-500 text-lg leading-loose font-light">
                            {getText('story', 'description', 'Beyond Heaven began not as a resort, but as a discovery. A hidden peak overlooking the vast ocean, where the wind whispered ancient stories and the sun painted new masterpieces every evening.')}
                        </p>
                        <div className="pt-4">
                            <img src="/about/signature.png" alt="" className="h-12 opacity-60" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -top-8 -left-8 w-full h-full border-2 border-primary/20 rounded-full rounded-br-none z-0" />
                        <img
                            src={getImg('story', 0, '/about/story.jpg')}
                            alt="Founding Vision"
                            className="relative z-10 rounded-tr-[100px] w-full shadow-2xl"
                        />
                    </motion.div>
                </div>
            </section>

            {/* 3. Core Philosophy */}
            <section className="bg-secondary text-white py-24">
                <div className="container-custom">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <span className="text-primary/80 uppercase tracking-widest text-xs font-bold mb-4 block">Our Values</span>
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">Designed for the Soul</h2>
                        <p className="text-white/60 text-lg font-light">We believe true luxury lies in the absence of excess and the presence of meaning.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Leaf,
                                title: "Sustainability",
                                text: "We coexist with the land, using renewable energy and locally sourced materials to leave a lighter footprint."
                            },
                            {
                                icon: Compass,
                                title: "Seclusion",
                                text: "Privacy is our highest promise. Each residence is a standalone world, shielded from prying eyes."
                            },
                            {
                                icon: Heart,
                                title: "Mindfulness",
                                text: "Every corner is curated to slow you down, inviting you to breathe deeply and reconnect with yourself."
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-center p-8 border border-white/10 hover:border-primary/50 transition-colors duration-500 bg-white/5 rounded-sm"
                            >
                                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-2xl font-serif mb-4">{item.title}</h3>
                                <p className="text-white/60 leading-relaxed font-light">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Visual Journey (Gallery) */}
            <section className="py-24 container-custom">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-xl">
                        <span className="text-primary uppercase tracking-widest text-xs font-bold mb-2 block">Visual Journey</span>
                        <h2 className="text-4xl md:text-5xl text-secondary font-serif">
                            {getText('gallery', 'title', 'Glimpses of Paradise')}
                        </h2>
                    </div>
                    <div className="flex flex-col items-end gap-4 mt-4 md:mt-0">
                        <p className="text-gray-400 max-w-sm text-sm text-right">
                            {getText('gallery', 'description', 'From sunrise to starlight, Beyond Heaven transforms with the hours.')}
                        </p>
                        <a href="/gallery" className="btn-outline border-secondary text-secondary hover:bg-secondary hover:text-white text-xs py-2 px-4 shadow-none">
                            View Full Gallery
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[600px]">
                    {/* Large Main Item */}
                    <div className="md:col-span-8 md:row-span-2 relative overflow-hidden group rounded-lg">
                        <img src={getImg('gallery', 0, '/about/nature.jpg')} alt="Nature" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* Side Items */}
                    <div className="md:col-span-4 relative overflow-hidden group rounded-lg h-64 md:h-auto">
                        <img src={getImg('gallery', 1, '/about/gallery1.jpg')} alt="Interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="md:col-span-4 relative overflow-hidden group rounded-lg h-64 md:h-auto">
                        <img src={getImg('gallery', 2, '/about/gallery2.jpg')} alt="Pool" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                </div>

                {/* Secondary Gallery Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="h-48 overflow-hidden rounded-lg group">
                        <img src={getImg('gallery', 3, '/about/gallery3.jpg')} alt="Detail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="h-48 overflow-hidden rounded-lg group">
                        <img src={getImg('gallery', 4, '/royal-villa.jpg')} alt="Detail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="h-48 bg-gray-100 flex items-center justify-center text-secondary/30 italic font-serif">
                        Serenity
                    </div>
                    <div className="h-48 bg-primary/10 flex items-center justify-center text-primary italic font-serif">
                        Luxury
                    </div>
                </div>
            </section>

            {/* 5. CTA Location */}
            <section className="relative py-32 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={getImg('cta', 0, '/about/nature.jpg')}
                        alt="Location"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <MapPin className="mx-auto mb-6 text-primary animate-bounce" size={40} />
                    <h2 className="text-4xl md:text-6xl font-serif mb-8">Find Your Way Home</h2>
                    <p className="max-w-2xl mx-auto text-xl font-light mb-12 opacity-90">
                        Located on the pristine cliffs of the Southern Coast, just a 40-minute scenic drive from the International Airport.
                    </p>
                    <button
                        onClick={() => setShowMap(true)}
                        className="btn-primary transform hover:scale-105 transition-transform mx-auto w-fit"
                    >
                        Get Directions
                    </button>
                </div>
            </section>

            {/* Map Modal */}
            {showMap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowMap(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowMap(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-black transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2221.837815236457!2d77.07447621881154!3d10.035514395651774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b079900362b165f%3A0x30e057c298947197!2sBEYOND%20HEAVEN!5e1!3m2!1sen!2sin!4v1770604499926!5m2!1sen!2sin"
                            width="100%"
                            height="500"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </motion.div>
                </div>
            )}

        </div>
    );
};

export default About;
