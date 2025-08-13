'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getGoalById } from '@/lib/goals';
import { Goal } from '@/types/goal';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

export default function GoalDetailPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadGoal = async () => {
            if (!user?.userId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const goalData = await getGoalById(user.userId, params.id);
                setGoal(goalData);
            } catch (err) {
                console.error('Error loading goal:', err);
                setError('Failed to load goal. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadGoal();
    }, [user?.userId, params.id]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#fffbe9]">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error || !goal) {
        notFound();
    }

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

    const getStatusColor = (status: Goal['status']) => {
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

    return (
        <div className="flex min-h-screen bg-[#fffbe9]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-8">
                    {/* Goal Overview Section */}
                    <div className="bg-white rounded-2xl shadow p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                                <h1 className="text-2xl font-bold text-gray-800">{goal.title}</h1>
                            </div>
                            <span className={`px-3 py-1 text-white text-sm rounded-full font-medium ${getStatusColor(goal.status)}`}>
                                {getStatusText(goal.status)}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>⏰</span>
                                <span>Жалпы жоспар: {goal.estimatedHours} сағат ({goal.tasks.length} тапсырма)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>📅</span>
                                <span>Уақыты: {goal.targetDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>🎯</span>
                                <span>Priority: {goal.priority}</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className={`h-3 rounded-full ${goal.status === 'completed' ? 'bg-green-500' : 'bg-violet-600'
                                }`} style={{ width: `${goal.progress}%` }}></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">Жалпы прогресс: {goal.progress}%</div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Pomodoro Module */}
                        <div className="lg:col-span-1">
                            <div className="bg-yellow-300 rounded-2xl shadow p-6 h-full flex flex-col">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <span className="text-xl">⏰</span>
                                    <h2 className="font-semibold text-lg">Pomodoro Module</h2>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-80 h-80 rounded-full border-8 border-violet-600 flex items-center justify-center mb-6 relative">
                                        <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 25%, 50% 25%)' }}></div>
                                        <span className="text-5xl font-bold text-gray-800">25:00</span>
                                    </div>
                                    <button className="w-80 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                                        <span>▶️</span>
                                        Start Timer
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Task List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="font-semibold text-lg mb-4">Сабақ / Task тізімі</h2>

                                {goal.tasks.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">📝</div>
                                        <p className="text-gray-600">No tasks yet. Add your first task to get started!</p>
                                    </div>
                                ) : (
                                    goal.tasks.map((task) => (
                                        <div key={task.id} className="border border-gray-200 rounded-xl p-4 mb-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-medium text-gray-800">{task.title}</h3>
                                                <span className="text-sm text-gray-600">{task.estimatedMinutes} мин</span>
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                            )}
                                            <div className="flex gap-2 mb-3">
                                                <button className={`px-3 py-1 text-white text-sm rounded-lg ${task.completed ? 'bg-green-500' : 'bg-violet-600'}`}>
                                                    {task.completed ? 'Completed' : 'Mark Complete'}
                                                </button>
                                                <button className="px-3 py-1 border border-gray-400 text-gray-600 text-sm rounded-lg">
                                                    Edit Task
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* GitHub Push Logs and Feedback */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* GitHub Push Logs */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="font-semibold text-lg mb-4">GitHub Push Логтері</h2>
                            {goal.githubPushes.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📊</div>
                                    <p className="text-gray-600">No GitHub pushes yet. Start coding to see your progress!</p>
                                </div>
                            ) : (
                                goal.githubPushes.map((push) => (
                                    <div key={push.id} className="border border-gray-200 rounded-xl p-4 mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-800">{push.commitMessage}</span>
                                            <span className="text-xs text-gray-500">{push.timestamp.toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Repository: {push.repositoryName}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Teacher Feedback */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="font-semibold text-lg mb-4">Мұғалім фидбэкі</h2>
                            <div className="text-center py-8">
                                <div className="text-4xl mb-2">👨‍🏫</div>
                                <p className="text-gray-600">No feedback yet. Your teacher will review your progress soon!</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
