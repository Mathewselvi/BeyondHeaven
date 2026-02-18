import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords }) => {
    return (
        <Helmet>
            <title>{title ? `${title} | Beyond Heaven` : 'Beyond Heaven - Luxury Resort'}</title>
            <meta name="description" content={description || "Experience the ultimate luxury at Beyond Heaven Resort."} />
            <meta name="keywords" content={keywords || "luxury resort, vacation, villa, infinity pool, travel"} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title || "Beyond Heaven - Luxury Resort"} />
            <meta property="og:description" content={description || "Experience the ultimate luxury at Beyond Heaven Resort."} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || "Beyond Heaven - Luxury Resort"} />
            <meta name="twitter:description" content={description || "Experience the ultimate luxury at Beyond Heaven Resort."} />
        </Helmet>
    );
};

export default SEO;
