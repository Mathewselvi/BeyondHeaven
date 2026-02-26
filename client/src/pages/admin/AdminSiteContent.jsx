import { useState, useEffect } from 'react';
import api, { getServerUrl } from "../../utils/api";
import { Save, Upload, Video, Image as ImageIcon, Trash2, Plus, Layout, Type } from 'lucide-react';
import AdminLayout from "../../components/AdminLayout";

// Configuration for available sections per page
const SECTIONS_CONFIG = {
    home: [
        { id: 'hero', label: 'Main Hero', allowedTypes: ['video', 'slideshow'], description: 'The main landing visual.' }
    ],
    about: [
        { id: 'hero', label: 'Hero Section', allowedTypes: ['image', 'video'], description: 'Top banner image/video.' },
        { id: 'story', label: 'Origin Story', allowedTypes: ['image'], description: 'Side image for the story section.' },
        { id: 'gallery', label: 'Visual Journey', allowedTypes: ['slideshow'], description: 'Gallery grid images for About page (max 5 recommended).' },
        { id: 'cta', label: 'Location Background', allowedTypes: ['image'], description: 'Background for the "Find Your Way" section.' }
    ],
    rooms: [
        { id: 'hero', label: 'Hero Section', allowedTypes: ['image', 'video'], description: 'Top banner for the Search/Rooms page.' }
    ],
    gallery: [
        { id: 'main', label: 'Main Gallery', allowedTypes: ['slideshow'], description: 'Global photo gallery content (Unlimited).' }
    ]
};

const AdminSiteContent = () => {
    const [activePage, setActivePage] = useState('home');
    const [activeSection, setActiveSection] = useState(SECTIONS_CONFIG['home'][0].id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const serverUrl = getServerUrl();

    // Content State
    const [contentData, setContentData] = useState({
        type: 'image',
        videoUrl: '',
        images: [],
        title: '',
        subtitle: '',
        description: ''
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        // Reset section when page changes
        setActiveSection(SECTIONS_CONFIG[activePage][0].id);
    }, [activePage]);

    useEffect(() => {
        fetchContent();
    }, [activePage, activeSection]);

    const fetchContent = async () => {
        const config = SECTIONS_CONFIG[activePage].find(s => s.id === activeSection);
        if (!config) return; // Wait for section to update

        setLoading(true);
        try {
            // Fetch all content for the page
            const res = await api.get(`/content/${activePage}`);
            const sectionData = res.data.data.find(c => c.section === activeSection);

            if (sectionData) {
                // Force type to be one of the allowed types if mismatch exists
                if (!config.allowedTypes.includes(sectionData.type)) {
                    sectionData.type = config.allowedTypes[0];
                }
                setContentData(sectionData);
            } else {
                // Reset to default if no data exists yet
                setContentData({
                    type: config.allowedTypes[0],
                    videoUrl: '',
                    images: [],
                    title: '',
                    subtitle: '',
                    description: ''
                });
            }
            // Clear files
            setSelectedFiles([]);
            setPreviewUrls([]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        if (contentData.type === 'slideshow') {
            setSelectedFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        } else {
            // Single image/video: replace
            setSelectedFiles(files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(newPreviews);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('type', contentData.type);
        formData.append('title', contentData.title || '');
        formData.append('subtitle', contentData.subtitle || '');
        formData.append('description', contentData.description || ''); // Added description support
        formData.append('existingImages', JSON.stringify(contentData.images));

        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            await api.put(
                `/content/${activePage}/${activeSection}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            alert('Content Updated Successfully');
            fetchContent();
        } catch (error) {
            console.error(error);
            alert('Failed to update content');
        } finally {
            setSaving(false);
        }
    };

    // Helper to check if type is allowed for current section
    const currentSectionConfig = SECTIONS_CONFIG[activePage].find(s => s.id === activeSection);
    const isTypeAllowed = (type) => currentSectionConfig?.allowedTypes.includes(type);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-secondary">Site Content Management</h1>

            {/* Page Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200 pb-1">
                {Object.keys(SECTIONS_CONFIG).map(page => (
                    <button
                        key={page}
                        onClick={() => setActivePage(page)}
                        className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activePage === page
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {page} Page
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar: Section List */}
                <div className="space-y-2">
                    {SECTIONS_CONFIG[activePage].map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left p-4 rounded-lg flex flex-col transition-all ${activeSection === section.id
                                ? 'bg-white shadow-md border-l-4 border-primary'
                                : 'hover:bg-white hover:shadow-sm text-gray-500'
                                }`}
                        >
                            <span className={`font-bold ${activeSection === section.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                {section.label}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">{section.description}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-primary block rounded-full"></span>
                            Edit: <span className="text-primary">{currentSectionConfig?.label}</span>
                        </h2>

                        {loading ? (
                            <div className="p-10 text-center text-gray-400">Loading content...</div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Type Selector (Only show if multiple types allowed) */}
                                {currentSectionConfig?.allowedTypes.length > 1 && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Content Format</label>
                                        <div className="flex gap-4">
                                            {isTypeAllowed('video') && (
                                                <button
                                                    type="button"
                                                    onClick={() => setContentData({ ...contentData, type: 'video' })}
                                                    className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${contentData.type === 'video'
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <Video size={18} /> Video
                                                </button>
                                            )}
                                            {isTypeAllowed('slideshow') && (
                                                <button
                                                    type="button"
                                                    onClick={() => setContentData({ ...contentData, type: 'slideshow' })}
                                                    className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${contentData.type === 'slideshow'
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <ImageIcon size={18} /> Slideshow
                                                </button>
                                            )}
                                            {isTypeAllowed('image') && (
                                                <button
                                                    type="button"
                                                    onClick={() => setContentData({ ...contentData, type: 'image' })}
                                                    className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${contentData.type === 'image'
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <ImageIcon size={18} /> Single Image
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Media Input */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Media Assets</label>

                                    {contentData.type === 'video' ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-white transition-colors">
                                            <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" id="asset-upload" />
                                            <label htmlFor="asset-upload" className="cursor-pointer flex flex-col items-center">
                                                <Upload size={32} className="text-gray-400 mb-2" />
                                                <span className="text-primary font-medium">Click to upload video (Max 50MB)</span>
                                            </label>

                                            {/* Preview Existing Video */}
                                            {contentData.videoUrl && !selectedFiles.length && (
                                                <div className="mt-4 max-w-md mx-auto">
                                                    <video src={`${serverUrl}${contentData.videoUrl}`} className="w-full rounded-lg shadow-sm" controls />
                                                    <p className="text-xs text-gray-400 mt-2">Current Video</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Image Grid */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                {/* Existing Images */}
                                                {contentData.images && contentData.images.map((img, idx) => (
                                                    <div key={idx} className="relative group rounded-lg overflow-hidden h-32 bg-gray-100">
                                                        <img src={`${serverUrl}${img}`} alt="" loading="lazy" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setContentData({ ...contentData, images: contentData.images.filter((_, i) => i !== idx) })}
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {/* New Previews */}
                                                {previewUrls.map((url, idx) => (
                                                    <div key={'preview-' + idx} className="relative rounded-lg overflow-hidden h-32 border-2 border-primary">
                                                        <img src={url} alt="" className="w-full h-full object-cover opacity-80" />
                                                    </div>
                                                ))}

                                                {/* Upload Button */}
                                                {(contentData.type === 'slideshow' || (contentData.type === 'image' && (!contentData.images?.length && !previewUrls.length))) && (
                                                    <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                                                        <Plus size={24} className="text-gray-400 mb-1" />
                                                        <span className="text-xs text-gray-500">
                                                            {contentData.type === 'slideshow' ? 'Add Images' : 'Upload Image'}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            multiple={contentData.type === 'slideshow'}
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            {contentData.type === 'image' && contentData.images?.length > 0 && selectedFiles.length > 0 && (
                                                <p className="text-xs text-amber-500">Note: Uploading a new image will replace the existing one.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Text Content */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <Type size={16} /> Text Content (Optional)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Title / Headline</label>
                                            <input
                                                type="text"
                                                value={contentData.title || ''}
                                                onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="e.g. Welcome to Paradise"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle / Tagline</label>
                                            <input
                                                type="text"
                                                value={contentData.subtitle || ''}
                                                onChange={(e) => setContentData({ ...contentData, subtitle: e.target.value })}
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="e.g. Experience Luxury"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Description / Body Text</label>
                                        <textarea
                                            value={contentData.description || ''}
                                            onChange={(e) => setContentData({ ...contentData, description: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-24 resize-none"
                                            placeholder="Enter descriptive text..."
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={saving}
                                    className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg"
                                >
                                    {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSiteContent;
