'use client';

import Sidebar from '@/components/Sidebar';
import { useState, useMemo } from 'react';
import Link from 'next/link';

const categories = ['All', 'Mobile', 'Web', 'UI/UX', 'Graphic', '3D'];
const sorters = ['New', 'Popular', 'Recommended'] as const;

type Sorter = typeof sorters[number];

type Portfolio = {
    id: string;
    title: string;
    subtitle?: string;
    tag: 'MOBILE' | 'WEB' | 'UI/UX' | 'GRAPHIC' | '3D';
    team: string;
    date: string; // dd.mm.yyyy
    likes: number;
    comments: number;
};

const mock: Portfolio[] = [
    { id: '1', title: 'Study Tracker App', tag: 'MOBILE', team: 'Team Phoenix', date: '06.08.2025', likes: 36, comments: 12 },
    { id: '2', title: 'E-commerce Dashboard', tag: 'WEB', team: 'Code Wizards', date: '01.07.2025', likes: 58, comments: 24 },
    { id: '3', title: 'Fitness App UI Kit', tag: 'UI/UX', team: 'Design Innovators', date: '15.06.2025', likes: 45, comments: 18 },
    { id: '4', title: 'Abstract Art Series', tag: 'GRAPHIC', team: 'Creative Minds', date: '20.05.2025', likes: 29, comments: 8 },
    { id: '5', title: 'Sci‑Fi Game Environment', tag: '3D', team: 'Digital Sculptors', date: '10.04.2025', likes: 62, comments: 30 },
    { id: '6', title: 'Recipe Sharing Platform', tag: 'WEB', team: 'Foodie Devs', date: '25.03.2025', likes: 40, comments: 15 },
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

export default function PortfoliosPage() {
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeSort, setActiveSort] = useState<Sorter>('New');

    // Filter және Sort функциялары
    const filteredAndSortedPortfolios = useMemo(() => {
        let filteredPortfolios = mock;

        // Category Filter
        if (activeCategory !== 'All') {
            const categoryMap: { [key: string]: Portfolio['tag'] } = {
                'Mobile': 'MOBILE',
                'Web': 'WEB',
                'UI/UX': 'UI/UX',
                'Graphic': 'GRAPHIC',
                '3D': '3D'
            };
            filteredPortfolios = mock.filter(portfolio => portfolio.tag === categoryMap[activeCategory]);
        }

        // Sort
        switch (activeSort) {
            case 'New':
                filteredPortfolios = [...filteredPortfolios].sort((a, b) => {
                    const dateA = new Date(a.date.split('.').reverse().join('-'));
                    const dateB = new Date(b.date.split('.').reverse().join('-'));
                    return dateB.getTime() - dateA.getTime(); // Newest first
                });
                break;
            case 'Popular':
                filteredPortfolios = [...filteredPortfolios].sort((a, b) => b.likes - a.likes);
                break;
            case 'Recommended':
                filteredPortfolios = [...filteredPortfolios].sort((a, b) => b.comments - a.comments);
                break;
        }

        return filteredPortfolios;
    }, [activeCategory, activeSort]);

    return (
        <div className="flex min-h-screen bg-[#fffbe9]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-8">
                    {/* Top filters */}
                    <div className="mb-6">
                        {/* Left-aligned Category group with Add Project pushed right */}
                        <div className="flex items-center mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-sm text-gray-600 mr-1">Category:</span>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${activeCategory === category
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-violet-50'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 ml-auto">
                                <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">
                                    <span>➕</span>
                                    Add Project
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600">Sort by:</span>
                            {sorters.map((sorter) => (
                                <button
                                    key={sorter}
                                    onClick={() => setActiveSort(sorter)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${activeSort === sorter
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-violet-50'
                                        }`}
                                >
                                    {sorter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedPortfolios.map((p) => (
                            <article key={p.id} className="rounded-2xl overflow-hidden bg-white shadow border border-gray-100">
                                {/* Cover */}
                                <div className="h-40 bg-gray-900 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-xl bg-cyan-300/20 border border-cyan-300/30 flex items-center justify-center text-4xl text-cyan-200 font-bold">
                                        G
                                    </div>
                                </div>
                                {/* Body */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800 line-clamp-2">{p.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getCategoryColor(p.tag)}`}>
                                            {p.tag}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                        <span>👥 {p.team}</span>
                                        <span>📅 {p.date}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        <span>❤️ {p.likes}</span>
                                        <span>💬 {p.comments}</span>
                                    </div>
                                    <Link href={`/portfolios/${p.id}`}>
                                        <button className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm">View Details</button>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
