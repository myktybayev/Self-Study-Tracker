'use client';

import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { goalsData } from '@/types/goal';
import { useState, useMemo } from 'react';

export default function GoalsPage() {
    const [activeFilter, setActiveFilter] = useState<'all' | 'not_started' | 'in_progress' | 'done'>('all');
    const [activeSort, setActiveSort] = useState<'time' | 'deadline' | 'progress'>('time');

    // Filter және Sort функциялары
    const filteredAndSortedGoals = useMemo(() => {
        let filteredGoals = goalsData;

        // Filter
        if (activeFilter !== 'all') {
            filteredGoals = goalsData.filter(goal => goal.status === activeFilter);
        }

        // Sort
        switch (activeSort) {
            case 'time':
                filteredGoals = [...filteredGoals].sort((a, b) => a.totalHours - b.totalHours);
                break;
            case 'deadline':
                filteredGoals = [...filteredGoals].sort((a, b) => {
                    const dateA = new Date(a.endDate.split('.').reverse().join('-'));
                    const dateB = new Date(b.endDate.split('.').reverse().join('-'));
                    return dateA.getTime() - dateB.getTime();
                });
                break;
            case 'progress':
                filteredGoals = [...filteredGoals].sort((a, b) => b.progress - a.progress);
                break;
        }

        return filteredGoals;
    }, [activeFilter, activeSort]);

    return (
        <div className="flex min-h-screen bg-[#fffbe9]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-8">
                    {/* Filter және Sort бөлімі */}
                    <div className="mb-6">
                        {/* Filter */}
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm text-gray-700 font-medium">Filter:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'all'
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    All Goals
                                </button>
                                <button
                                    onClick={() => setActiveFilter('not_started')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'not_started'
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Not Started
                                </button>
                                <button
                                    onClick={() => setActiveFilter('in_progress')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'in_progress'
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => setActiveFilter('done')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'done'
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                        {/* Sort */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-700 font-medium">Sort by:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveSort('time')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeSort === 'time'
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Time
                                </button>
                                <button
                                    onClick={() => setActiveSort('deadline')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeSort === 'deadline'
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Deadline
                                </button>
                                <button
                                    onClick={() => setActiveSort('progress')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeSort === 'progress'
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Progress
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Most Active Goal Banner */}
                    <div className="bg-yellow-300 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <span className="text-xl">🔥</span>
                        <span className="text-sm text-gray-700 font-medium">Most Active Goal: Firebase Auth (last 7 days)</span>
                    </div>

                    {/* Goals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Add New Goal Card */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-violet-400 hover:bg-violet-50 transition cursor-pointer">
                            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-3">
                                <span className="text-2xl text-violet-600">+</span>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">Add New Goal</span>
                        </div>

                        {filteredAndSortedGoals.map((goal) => (
                            <div key={goal.id} className={`rounded-xl p-6 border ${goal.status === 'done' ? 'bg-green-100 border-green-200' :
                                goal.status === 'in_progress' ? 'bg-yellow-100 border-yellow-200' :
                                    'bg-gray-100 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">{goal.icon}</span>
                                    <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">{goal.startDate} - {goal.endDate}</div>
                                <div className="text-sm text-gray-600 mb-3">{goal.totalHours} сағат</div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-1 text-white text-xs rounded-full ${goal.status === 'done' ? 'bg-green-500' :
                                        goal.status === 'in_progress' ? 'bg-yellow-500' :
                                            'bg-gray-400'
                                        }`}>
                                        {goal.status === 'done' ? 'Done' :
                                            goal.status === 'in_progress' ? 'In Progress' :
                                                'Not Started'}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                                    <div className={`h-2 rounded-full ${goal.status === 'done' ? 'bg-green-500' : 'bg-violet-600'
                                        }`} style={{ width: `${goal.progress}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-600 mb-4">{goal.completedTasks}/{goal.totalTasks} tasks completed</div>
                                <Link href={`/goals/${goal.id}`} className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition block text-center">
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}