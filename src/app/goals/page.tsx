'use client';

import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserGoals, getGoalsByStatus } from '@/lib/goals';
import { Goal } from '@/types/goal';

export default function GoalsPage() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
    const [activeSort, setActiveSort] = useState<'time' | 'deadline' | 'progress'>('time');

    // Load goals function
    const loadGoals = useCallback(async () => {
        if (!user?.userId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            let goalsData: Goal[];
            if (activeFilter === 'all') {
                goalsData = await getUserGoals(user.userId);
            } else {
                goalsData = await getGoalsByStatus(user.userId, activeFilter);
            }

            setGoals(goalsData);
        } catch (err) {
            console.error('Error loading goals:', err);
            setError('Failed to load goals. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId, activeFilter]);

    // Load goals from Firebase using user's GitHub-based ID
    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    // Refresh goals when page becomes visible (returning from Add New Goal)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user?.userId) {
                loadGoals();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [loadGoals, user?.userId]);

    // Filter және Sort функциялары
    const filteredAndSortedGoals = useMemo(() => {
        let filteredGoals = goals;

        // Sort
        switch (activeSort) {
            case 'time':
                filteredGoals = [...filteredGoals].sort((a, b) => a.estimatedHours - b.estimatedHours);
                break;
            case 'deadline':
                filteredGoals = [...filteredGoals].sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
                break;
            case 'progress':
                filteredGoals = [...filteredGoals].sort((a, b) => b.progress - a.progress);
                break;
        }

        return filteredGoals;
    }, [goals, activeSort]);

    const getStatusColor = (status: Goal['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 border-green-200';
            case 'active':
                return 'bg-yellow-100 border-yellow-200';
            case 'paused':
                return 'bg-gray-100 border-gray-200';
            default:
                return 'bg-gray-100 border-gray-200';
        }
    };

    const getStatusText = (status: Goal['status']) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'active':
                return 'Active';
            case 'paused':
                return 'Paused';
            default:
                return 'Unknown';
        }
    };

    const getStatusBadgeColor = (status: Goal['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'active':
                return 'bg-yellow-500';
            case 'paused':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    const getCategoryIcon = (category: Goal['category']) => {
        switch (category) {
            case 'WEB':
                return '🌐';
            case 'MOBILE':
                return '📱';
            case 'UI/UX':
                return '🎨';
            case 'GRAPHIC':
                return '🖼️';
            case '3D':
                return '🎭';
            default:
                return '📋';
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#fffbe9]">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-8">
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-[#fffbe9]">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-8">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={loadGoals}
                                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#fffbe9]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-8">
                    {/* Header with refresh button */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Goals</h1>
                        <button
                            onClick={loadGoals}
                            disabled={isLoading}
                            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <span>🔄</span>
                                    Refresh
                                </>
                            )}
                        </button>
                    </div>

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
                                    onClick={() => setActiveFilter('active')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'active'
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setActiveFilter('completed')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'completed'
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Completed
                                </button>
                                <button
                                    onClick={() => setActiveFilter('paused')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'paused'
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Paused
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
                    {goals.length > 0 && (
                        <div className="bg-yellow-300 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <span className="text-xl">🔥</span>
                            <span className="text-sm text-gray-700 font-medium">
                                Most Active Goal: {goals[0]?.title} (last 7 days)
                            </span>
                        </div>
                    )}

                    {/* Goals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Add New Goal Card */}
                        <Link href="/goals/new" className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-violet-400 hover:bg-violet-50 transition cursor-pointer">
                            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-3">
                                <span className="text-2xl text-violet-600">+</span>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">Add New Goal</span>
                        </Link>

                        {filteredAndSortedGoals.map((goal) => (
                            <div key={goal.id} className={`rounded-xl p-6 border ${getStatusColor(goal.status)}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">{getCategoryIcon(goal.category)}</span>
                                    <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    {goal.targetDate.toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-600 mb-3">
                                    {goal.estimatedHours} сағат (estimated)
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-1 text-white text-xs rounded-full ${getStatusBadgeColor(goal.status)}`}>
                                        {getStatusText(goal.status)}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                                    <div className={`h-2 rounded-full ${goal.status === 'completed' ? 'bg-green-500' : 'bg-violet-600'
                                        }`} style={{ width: `${goal.progress}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-600 mb-4">
                                    {goal.tasks.filter(task => task.status === 'completed').length}/{goal.tasks.length} tasks completed
                                </div>
                                <Link href={`/goals/${goal.id}`} className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition block text-center">
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {goals.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No goals yet</h3>
                            <p className="text-gray-600 mb-6">Start by creating your first goal to track your progress!</p>
                            <Link href="/goals/new" className="inline-block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium transition">
                                Create Your First Goal
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}