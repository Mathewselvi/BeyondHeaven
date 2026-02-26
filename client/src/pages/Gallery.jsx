import { useState, useEffect } from 'react';
import api, { getServerUrl } from '../utils/api';
import { motion } from 'framer-motion';
import { ArrowLeft, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const serverUrl = getServerUrl();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await api.get('/content/gallery');
                const galleryData = res.data.data.find(c => c.section === 'main');
                if (galleryData && galleryData.images) {
                    setImages(galleryData.images);
                }
            } catch (err) {
                console.error("Failed to load gallery content", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-12">
                <SEO
                    title="Gallery"
                    description="Explore the breathtaking views and luxurious interiors of Beyond Heaven."
                />
                <div className="absolute inset-0">
                    <img
                        src="/about/nature.jpg"
                        alt="Gallery Hero"
                        className="w-full h-full object-cover animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <Link to="/about" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors uppercase tracking-widest text-xs font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20">
                        <ArrowLeft size={14} className="mr-2" /> Back to About
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1 }}
                        className="text-5xl md:text-7xl font-serif mb-4"
                    >
                        Visual Journey
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed"
                    >
                        Explore the intricate details and sweeping vistas that make Beyond Heaven a sanctuary for the senses.
                    </motion.p>
                </div>
            </div>

            <div className="container-custom pb-20">
                {/* Gallery Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse">Loading gallery...</div>
                ) : images.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No images found in the gallery.</div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {images.map((img, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="break-inside-avoid relative group rounded-lg overflow-hidden cursor-zoom-in"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img
                                    src={`${serverUrl}${img}`}
                                    alt={`Gallery ${idx + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <ZoomIn className="text-white drop-shadow-lg" size={32} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        Close
                    </button>
                    <img
                        src={`${serverUrl}${selectedImage}`}
                        alt="Full View"
                        className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm"
                    />
                </div>
            )}
        </div>
    );
};

export default Gallery;
