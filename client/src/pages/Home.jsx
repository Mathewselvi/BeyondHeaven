import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Hero from '../components/Hero';
import BookingWidget from '../components/BookingWidget';
import SEO from '../components/SEO';
import { FEATURES } from '../utils/constants';



const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="min-w-[85vw] md:min-w-[400px] snap-center p-8 border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer h-full">
        <Icon className="text-primary mb-6 group-hover:scale-110 transition-transform duration-300" size={40} />
        <h3 className="text-2xl mb-4 text-secondary">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-light">{description}</p>
    </div>
);

const Home = () => {
    const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);

    return (
        <div className="pb-20">
            <SEO
                title="Home"
                description="Welcome to Beyond Heaven, a sanctuary where nature meets architecture. Book your luxury villa today."
                keywords="luxury villas, scenic resort, infinity pools, nature retreat"
            />
            <Hero />
            <BookingWidget />

            {/* Experience Section */}
            <section className="py-24 container-custom overflow-hidden">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-primary uppercase tracking-widest text-xs font-bold mb-2 block">The Experience</span>
                    <h2 className="text-4xl md:text-5xl text-secondary mb-6">Where the Sky Meets the Ocean</h2>
                    <p className="text-gray-500 text-lg font-light leading-relaxed">
                        Beyond Heaven is not just a resort; it is a viewpoint to the infinite. Perched on the edge of the world, our villas offer an uninterrupted dialogue with nature.
                    </p>
                </div>

                {/* Embla Carousel */}
                <div className="overflow-hidden no-scrollbar -mx-4 px-4 md:mx-0 md:px-0" ref={emblaRef}>
                    <div className="flex gap-8 pb-8">
                        {FEATURES.map((feature, idx) => (
                            <div key={idx} className="flex-[0_0_85vw] md:flex-[0_0_400px]">
                                <div>
                                    <FeatureCard
                                        icon={feature.icon}
                                        title={feature.title}
                                        description={feature.description}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Parallax / Featured Image Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/royal-villa.jpg" alt="Philosophy" loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 text-center text-white p-8 border border-white/30 backdrop-blur-sm max-w-2xl mx-4">
                    <h2 className="text-3xl md:text-5xl mb-6">Our Philosophy</h2>
                    <p className="mb-8 font-light text-lg">Discover the story behind Beyond Heaven—an escape designed for the soul, where luxury meets the infinite.</p>
                    <Link to="/about" className="btn-outline">About Us</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
