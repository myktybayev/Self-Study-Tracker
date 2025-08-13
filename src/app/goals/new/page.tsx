'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createGoal } from '@/lib/goals';
import { Goal } from '@/types/goal';
import Sidebar from '@/components/Sidebar';

export default function AddNewGoalPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'WEB' as Goal['category'],
        status: 'active' as Goal['status'],
        estimatedHours: 1,
        targetDate: new Date().toISOString().split('T')[0], // Today's date
        priority: 'medium' as 'low' | 'medium' | 'high',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'estimatedHours' ? parseInt(value) || 1 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.userId) {
            setError('User not authenticated');
            return;
        }

        if (!formData.title.trim()) {
            setError('Goal title is required');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const newGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
                userId: user.userId,
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                status: formData.status,
                estimatedHours: formData.estimatedHours,
                actualHours: 0,
                targetDate: new Date(formData.targetDate),
                priority: formData.priority,
                progress: 0,
                tasks: [],
                githubPushes: [],
            };

            await createGoal(newGoal);

            // Show success message
            setSuccess(true);

            // Redirect to goals page after 2 seconds
            setTimeout(() => {
                router.push('/goals');
            }, 2000);
        } catch (err) {
            console.error('Error creating goal:', err);
            setError('Failed to create goal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { value: 'WEB', label: '🌐 Web Development', icon: '🌐' },
        { value: 'MOBILE', label: '📱 Mobile Development', icon: '📱' },
        { value: 'UI/UX', label: '🎨 UI/UX Design', icon: '🎨' },
        { value: 'GRAPHIC', label: '🖼️ Graphic Design', icon: '🖼️' },
        { value: '3D', label: '🎭 3D Design', icon: '🎭' },
    ];

    const priorities = [
        { value: 'low', label: 'Low Priority', color: 'text-green-600' },
        { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
        { value: 'high', label: 'High Priority', color: 'text-red-600' },
    ];

    // Success state
    if (success) {
        return (
            <div className="flex min-h-screen bg-[#fffbe9]">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-8">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">✅</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Goal Created Successfully!</h3>
                                <p className="text-gray-600 mb-6">Your new goal "{formData.title}" has been saved to Firebase.</p>
                                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-sm text-gray-500">Redirecting to Goals page...</p>
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
                    <div className="max-w-2xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    ← Back
                                </button>
                                <h1 className="text-2xl font-bold text-gray-800">Add New Goal</h1>
                            </div>
                            <p className="text-gray-600">Create a new goal to track your learning progress</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Goal Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Goal Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Build a React Todo App"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe what you want to achieve..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>

                            {/* Category and Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category */}
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    >
                                        {categories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    >
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Estimated Hours and Target Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Estimated Hours */}
                                <div>
                                    <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Hours
                                    </label>
                                    <input
                                        type="number"
                                        id="estimatedHours"
                                        name="estimatedHours"
                                        value={formData.estimatedHours}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="1000"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Target Date */}
                                <div>
                                    <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Date
                                    </label>
                                    <input
                                        type="date"
                                        id="targetDate"
                                        name="targetDate"
                                        value={formData.targetDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                >
                                    {priorities.map(priority => (
                                        <option key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Goal'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
