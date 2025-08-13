'use client';

import Sidebar from '@/components/Sidebar';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

type Portfolio = {
    id: string;
    title: string;
    subtitle?: string;
    tag: 'MOBILE' | 'WEB' | 'UI/UX' | 'GRAPHIC' | '3D';
    team: string;
    date: string; // dd.mm.yyyy
    likes: number;
    comments: number;
    status: 'PUBLISHED' | 'DRAFT' | 'IN_REVIEW';
    description: string;
    features: string[];
    technologies: string;
    githubUrl?: string;
    liveUrl?: string;
    figmaUrl?: string;
    screenshots: string[];
    teamMembers: {
        name: string;
        role: string;
        contact: string;
        contactType: 'github' | 'email' | 'phone';
    }[];
    commentList: {
        id: string;
        author: string;
        text: string;
        date: string;
    }[];
};

const mock: Portfolio[] = [
    {
        id: '1',
        title: 'Self Study Tracker App',
        tag: 'MOBILE',
        team: 'Team Phoenix',
        date: '06.08.2025',
        likes: 42,
        comments: 12,
        status: 'PUBLISHED',
        description: 'The Self Study Tracker App is designed to help students manage their study habits, set goals, and track progress in a gamified environment. The app features a clean, intuitive interface with daily quests, reward systems, and a comprehensive dashboard to visualize study analytics.',
        features: [
            'Personalized study goal setting',
            'Pomodoro timer integration',
            'Progress tracking and visualization',
            'Gamified rewards and achievements',
            'Community and leaderboard features'
        ],
        technologies: 'Developed using Flutter for cross-platform compatibility, ensuring smooth performance on both iOS and Android devices. The backend is powered by Firebase, providing real-time data synchronization and user authentication.',
        githubUrl: 'github.com/team-phoenix/study-tracker',
        liveUrl: 'studytracker.web.app',
        figmaUrl: 'figma.com/team-phoenix/study-tracker',
        screenshots: [
            'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Mobile+App',
            'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Dashboard',
            'https://via.placeholder.com/400x300/1F2937/FFFFFF?text=Dark+Theme'
        ],
        teamMembers: [
            {
                name: 'Alibek',
                role: 'Flutter Developer',
                contact: '@alibek_dev',
                contactType: 'github'
            },
            {
                name: 'Aruzhan',
                role: 'UI/UX Designer',
                contact: 'aruzhen@email.com',
                contactType: 'email'
            },
            {
                name: 'Daniyar',
                role: 'Project Manager',
                contact: '+7 701 XXX XX XX',
                contactType: 'phone'
            }
        ],
        commentList: [
            {
                id: '1',
                author: 'Sarah K.',
                text: 'This is an amazing project! The gamification aspect is really well done and keeps me motivated. Great job, team!',
                date: '2 days ago'
            },
            {
                id: '2',
                author: 'Professor Lee',
                text: 'Excellent work on the UI/UX. The app is very user-friendly and visually appealing. Keep up the good work!',
                date: '1 day ago'
            }
        ]
    },
    {
        id: '2',
        title: 'E-commerce Dashboard',
        tag: 'WEB',
        team: 'Code Wizards',
        date: '01.07.2025',
        likes: 58,
        comments: 24,
        status: 'PUBLISHED',
        description: 'A comprehensive e-commerce management dashboard with advanced analytics and inventory management.',
        features: [
            'Real-time sales analytics',
            'Inventory management',
            'Customer relationship management',
            'Order processing automation',
            'Multi-store support'
        ],
        technologies: 'Built with React.js and Node.js, featuring a responsive design and real-time data updates.',
        githubUrl: 'github.com/code-wizards/ecommerce-dashboard',
        liveUrl: 'ecommerce-dashboard.web.app',
        figmaUrl: 'figma.com/code-wizards/ecommerce',
        screenshots: [
            'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Dashboard',
            'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Analytics',
            'https://via.placeholder.com/400x300/1F2937/FFFFFF?text=Orders'
        ],
        teamMembers: [
            {
                name: 'Alex',
                role: 'Frontend Developer',
                contact: '@alex_dev',
                contactType: 'github'
            },
            {
                name: 'Maria',
                role: 'Backend Developer',
                contact: 'maria@email.com',
                contactType: 'email'
            }
        ],
        commentList: [
            {
                id: '1',
                author: 'John D.',
                text: 'Great dashboard! The analytics are very comprehensive.',
                date: '1 week ago'
            }
        ]
    }
];

// Category түстері
const getCategoryColor = (tag: Portfolio['tag']) => {
    switch (tag) {
        case 'MOBILE':
            return 'bg-violet-100 text-violet-700';
        case 'WEB':
            return 'bg-green-100 text-green-700';
        case 'UI/UX':
            return 'bg-orange-100 text-orange-700';
        case 'GRAPHIC':
            return 'bg-yellow-100 text-yellow-700';
        case '3D':
            return 'bg-emerald-100 text-emerald-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

// Contact button түстері
const getContactButtonColor = (contactType: string) => {
    switch (contactType) {
        case 'github':
            return 'bg-violet-600 hover:bg-violet-700';
        case 'email':
            return 'bg-yellow-500 hover:bg-yellow-600';
        case 'phone':
            return 'bg-emerald-500 hover:bg-emerald-600';
        default:
            return 'bg-gray-600 hover:bg-gray-700';
    }
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    const project = mock.find(p => p.id === params.id);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!project) {
        notFound();
    }

    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setIsGalleryOpen(true);
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === project.screenshots.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? project.screenshots.length - 1 : prev - 1
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    };

    return (
        <div className="flex min-h-screen bg-[#fffbe9]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-8">
                    {/* Project Overview Card */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                        {/* Hero Image */}
                        <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <span className="text-6xl text-white font-bold">📱</span>
                            </div>
                        </div>

                        {/* Project Info */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.title}</h1>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(project.tag)}`}>
                                            {project.tag}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                                            {project.status}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
                                        <div className="h-2 bg-violet-600 rounded-full" style={{ width: '85%' }}></div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                        <span>Published: {project.date}</span>
                                        <span>❤️ {project.likes} Likes</span>
                                        <span>💬 {project.comments} Comments</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    {project.githubUrl && (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition">
                                            <span>🐙</span>
                                            Visit GitHub
                                        </button>
                                    )}
                                    {project.liveUrl && (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition">
                                            <span>🌐</span>
                                            View Live
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Project Description */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Project Description</h2>
                                <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>

                                <h3 className="font-semibold text-gray-800 mb-2">Key Features:</h3>
                                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                                    {project.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>

                                <p className="text-gray-600 leading-relaxed">{project.technologies}</p>
                            </div>

                            {/* Screenshots */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Screenshots</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {project.screenshots.map((screenshot, index) => (
                                        <div
                                            key={index}
                                            className="rounded-lg overflow-hidden cursor-pointer group"
                                            onClick={() => openGallery(index)}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={screenshot}
                                                    alt={`Screenshot ${index + 1}`}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <span className="text-white text-2xl">🔍</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Comments</h2>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition">
                                        ❤️ {project.likes} Likes
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {project.commentList.map((comment) => (
                                        <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-gray-800">{comment.author}</span>
                                                <span className="text-sm text-gray-500">{comment.date}</span>
                                            </div>
                                            <p className="text-gray-600">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Add your comment..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                    <button className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition">
                                        Submit Comment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* Team Members */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Team Members</h2>
                                <div className="space-y-4">
                                    {project.teamMembers.map((member, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-lg font-semibold text-gray-600">
                                                    {member.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{member.name}</h3>
                                                <p className="text-sm text-gray-600">{member.role}</p>
                                            </div>
                                            <button className={`px-3 py-1 rounded-lg text-white text-xs font-medium transition ${getContactButtonColor(member.contactType)}`}>
                                                {member.contact}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* External Links */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">External Links</h2>
                                <div className="space-y-3">
                                    {project.githubUrl && (
                                        <a href={`https://${project.githubUrl}`} className="block text-violet-600 hover:text-violet-700 text-sm">
                                            GitHub Repository
                                        </a>
                                    )}
                                    {project.figmaUrl && (
                                        <a href={`https://${project.figmaUrl}`} className="block text-violet-600 hover:text-violet-700 text-sm">
                                            Figma Design File
                                        </a>
                                    )}
                                    {project.liveUrl && (
                                        <a href={`https://${project.liveUrl}`} className="block text-violet-600 hover:text-violet-700 text-sm">
                                            Live Site
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Related Projects */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Related {project.tag} Projects</h2>
                                <div className="space-y-4">
                                    {mock.filter(p => p.tag === project.tag && p.id !== project.id).slice(0, 2).map((relatedProject) => (
                                        <div key={relatedProject.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="w-full h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                                                <span className="text-2xl text-white">📱</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-800 mb-2">{relatedProject.title}</h3>
                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                                <span>👥 {relatedProject.team}</span>
                                                <span>📅 {relatedProject.date}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                                <span>❤️ {relatedProject.likes}</span>
                                                <span>💬 {relatedProject.comments}</span>
                                            </div>
                                            <Link
                                                href={`/portfolios/${relatedProject.id}`}
                                                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition block text-center"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href="/portfolios"
                                    className="block text-center text-violet-600 hover:text-violet-700 text-sm mt-4"
                                >
                                    Explore more {project.tag} Projects
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Modal */}
                    {isGalleryOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                            onClick={closeGallery}
                            onKeyDown={handleKeyDown}
                            tabIndex={0}
                        >
                            <div className="relative max-w-4xl max-h-[90vh] mx-4">
                                {/* Close Button */}
                                <button
                                    onClick={closeGallery}
                                    className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
                                >
                                    ✕
                                </button>

                                {/* Navigation Buttons */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                                >
                                    ‹
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                                >
                                    ›
                                </button>

                                {/* Image */}
                                <div onClick={(e) => e.stopPropagation()}>
                                    <img
                                        src={project.screenshots[currentImageIndex]}
                                        alt={`Screenshot ${currentImageIndex + 1}`}
                                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                    />
                                </div>

                                {/* Image Counter */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm">
                                    {currentImageIndex + 1} / {project.screenshots.length}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
