import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api, { getServerUrl } from '../utils/api';

const Hero = () => {
    const [content, setContent] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const serverUrl = getServerUrl();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await api.get('/content/home');
                const heroData = res.data.data.find(c => c.section === 'hero');
                if (heroData) {
                    setContent(heroData);
                }
            } catch (err) {
                console.error("Failed to load hero content", err);
            }
        };
        fetchContent();
    }, []);

    // Slideshow logic
    useEffect(() => {
        if (content?.type === 'slideshow' && content.images?.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % content.images.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [content]);

    // Fallback if no content loaded yet or error
    if (!content) return (
        <div className="relative h-screen w-full bg-secondary flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src="/royal-villa.jpg" alt="Hero" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
        </div>
    );

    return (
        <div className="relative h-screen w-full overflow-hidden bg-secondary">
            {/* Background Content */}
            <div className="absolute inset-0 bg-secondary">
                {content.type === 'video' && content.videoUrl ? (
                    <video
                        src={`${serverUrl}${content.videoUrl}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-center opacity-70"
                    />
                ) : (
                    <AnimatePresence mode='wait'>
                        <motion.img
                            key={currentSlide}
                            src={content.images && content.images.length > 0 ? `${serverUrl}${content.images[currentSlide]}` : '/royal-villa.jpg'}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/royal-villa.jpg';
                            }}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                opacity: { duration: 1.5 },
                                scale: { duration: 7, ease: "linear" }
                            }}
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
                        />
                    </AnimatePresence>
                )}
                <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Content Overlay */}
            <div className="relative h-full container-custom flex flex-col justify-center items-center text-center text-white pt-20">
                <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4">
                    {content.subtitle || "Welcome to Beyond Heaven"}
                </span>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium mb-6 leading-tight">
                    {content.title ? (
                        <span dangerouslySetInnerHTML={{ __html: content.title.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <>Experience <br /> <span className="italic">Ethereal</span> Luxury</>
                    )}
                </h1>

                <p className="text-gray-300 max-w-xl text-lg md:text-xl font-light leading-relaxed mb-10">
                    {content.description || "Discover a sanctuary where nature meets architecture. Unwind in our exclusive villas designed for the seeking soul."}
                </p>

                <div className="animate-bounce absolute bottom-10">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-white/50 mx-auto" />
                </div>
            </div>
        </div>
    );
};

export default Hero;
