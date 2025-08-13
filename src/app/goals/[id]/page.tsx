'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getGoalById, createTask, getGoalTasks, updateTask } from '@/lib/goals';
import { Goal, Task } from '@/types/goal';
import { useEffect, useState, useRef } from 'react';
import { notFound } from 'next/navigation';

type TimerMode = 'work' | 'break' | 'longBreak';
type TimerState = 'idle' | 'running' | 'paused';

interface TimerData {
    mode: TimerMode;
    state: TimerState;
    timeLeft: number; // seconds
    cycles: number;
    totalWorkTime: number; // minutes
}

export default function GoalDetailPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    // Timer states
    const [timer, setTimer] = useState<TimerData>({
        mode: 'work',
        state: 'idle',
        timeLeft: 25 * 60, // 25 minutes in seconds
        cycles: 0,
        totalWorkTime: 0,
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        estimatedMinutes: 30,
        resourceUrl: '',
    });

    // Timer constants
    const WORK_TIME = 25 * 60; // 25 minutes
    const BREAK_TIME = 5 * 60; // 5 minutes
    const LONG_BREAK_TIME = 15 * 60; // 15 minutes
    const CYCLES_BEFORE_LONG_BREAK = 3;

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

                // Load tasks separately
                if (goalData) {
                    const tasksData = await getGoalTasks(user.userId, params.id);
                    setTasks(tasksData);

                    // Set first in_progress task as active, or first task if none in progress
                    const inProgressTask = tasksData.find(task => task.status === 'in_progress');
                    if (inProgressTask) {
                        setActiveTaskId(inProgressTask.id);
                    } else if (tasksData.length > 0) {
                        setActiveTaskId(tasksData[0].id);
                    }
                }
            } catch (err) {
                console.error('Error loading goal:', err);
                setError('Failed to load goal. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadGoal();
    }, [user?.userId, params.id]);

    // Timer effect
    useEffect(() => {
        if (timer.state === 'running') {
            intervalRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev.timeLeft <= 1) {
                        // Timer finished
                        handleTimerComplete();
                        return prev;
                    }
                    return {
                        ...prev,
                        timeLeft: prev.timeLeft - 1,
                    };
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timer.state]);

    const handleTimerComplete = async () => {
        if (timer.mode === 'work') {
            // Work session completed
            const workMinutes = WORK_TIME / 60;
            setTimer(prev => ({
                ...prev,
                totalWorkTime: prev.totalWorkTime + workMinutes,
                cycles: prev.cycles + 1,
            }));

            // Update task actual hours
            if (activeTaskId && user?.userId && goal) {
                try {
                    const activeTask = tasks.find(t => t.id === activeTaskId);
                    if (activeTask) {
                        const currentActualMinutes = activeTask.actualMinutes || 0;
                        await updateTask(user.userId, goal.id, activeTaskId, {
                            actualMinutes: currentActualMinutes + workMinutes,
                        });

                        // Update local state
                        setTasks(prev => prev.map(task =>
                            task.id === activeTaskId
                                ? { ...task, actualMinutes: (task.actualMinutes || 0) + workMinutes }
                                : task
                        ));
                    }
                } catch (err) {
                    console.error('Error updating task actual minutes:', err);
                }
            }

            // Check if it's time for long break
            const nextCycles = timer.cycles + 1;
            if (nextCycles % CYCLES_BEFORE_LONG_BREAK === 0) {
                setTimer({
                    mode: 'longBreak',
                    state: 'running',
                    timeLeft: LONG_BREAK_TIME,
                    cycles: nextCycles,
                    totalWorkTime: timer.totalWorkTime + workMinutes,
                });
            } else {
                setTimer({
                    mode: 'break',
                    state: 'running',
                    timeLeft: BREAK_TIME,
                    cycles: nextCycles,
                    totalWorkTime: timer.totalWorkTime + workMinutes,
                });
            }
        } else {
            // Break completed, start work session
            setTimer({
                mode: 'work',
                state: 'running',
                timeLeft: WORK_TIME,
                cycles: timer.cycles,
                totalWorkTime: timer.totalWorkTime,
            });
        }
    };

    const startTimer = () => {
        if (!activeTaskId) return;

        setTimer(prev => ({
            ...prev,
            state: 'running',
        }));
    };

    const pauseTimer = () => {
        setTimer(prev => ({
            ...prev,
            state: 'paused',
        }));
    };

    const stopTimer = () => {
        setTimer({
            mode: 'work',
            state: 'idle',
            timeLeft: WORK_TIME,
            cycles: timer.cycles,
            totalWorkTime: timer.totalWorkTime,
        });
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerModeText = (): string => {
        switch (timer.mode) {
            case 'work':
                return 'Work Time';
            case 'break':
                return 'Break Time';
            case 'longBreak':
                return 'Long Break';
            default:
                return 'Work Time';
        }
    };

    const getTimerModeColor = (): string => {
        switch (timer.mode) {
            case 'work':
                return 'border-violet-600';
            case 'break':
                return 'border-green-500';
            case 'longBreak':
                return 'border-blue-500';
            default:
                return 'border-violet-600';
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.userId || !goal) return;

        if (!newTask.title.trim()) {
            setError('Task title is required');
            return;
        }

        try {
            setIsAddingTask(true);
            setError(null);

            const taskData = {
                title: newTask.title.trim(),
                description: newTask.description.trim(),
                estimatedMinutes: newTask.estimatedMinutes,
                resourceUrl: newTask.resourceUrl.trim() || undefined,
                status: 'not_started' as const,
                githubPushed: false,
            };

            await createTask(user.userId, goal.id, taskData);

            // Refresh tasks
            const updatedTasks = await getGoalTasks(user.userId, goal.id);
            setTasks(updatedTasks);

            // Reset form
            setNewTask({
                title: '',
                description: '',
                estimatedMinutes: 30,
                resourceUrl: '',
            });
            setShowAddTask(false);
        } catch (err) {
            console.error('Error creating task:', err);
            setError('Failed to create task. Please try again.');
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleTaskClick = async (taskId: string) => {
        if (!user?.userId || !goal) return;

        try {
            // Set as active task
            setActiveTaskId(taskId);

            // Update task status to in_progress if it's not_started
            const task = tasks.find(t => t.id === taskId);
            if (task && task.status === 'not_started') {
                await updateTask(user.userId, goal.id, taskId, { status: 'in_progress' });

                // Update local state
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, status: 'in_progress' } : t
                ));
            }
        } catch (err) {
            console.error('Error updating task status:', err);
            setError('Failed to update task status.');
        }
    };

    const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
        if (!user?.userId || !goal) return;

        try {
            await updateTask(user.userId, goal.id, taskId, { status: newStatus });

            // Update local state
            setTasks(prev => prev.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err) {
            console.error('Error updating task status:', err);
            setError('Failed to update task status.');
        }
    };

    const getStatusText = (status: Task['status']) => {
        switch (status) {
            case 'not_started':
                return 'Start Task';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Done';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'in_progress':
                return 'bg-violet-600';
            case 'not_started':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    const getNextStatus = (currentStatus: Task['status']): Task['status'] => {
        switch (currentStatus) {
            case 'not_started':
                return 'in_progress';
            case 'in_progress':
                return 'completed';
            case 'completed':
                return 'not_started';
            default:
                return 'not_started';
        }
    };

    const activeTask = tasks.find(task => task.id === activeTaskId);

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

    const getGoalStatusText = (status: Goal['status']) => {
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

    const getGoalStatusColor = (status: Goal['status']) => {
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
                            <span className={`px-3 py-1 text-white text-sm rounded-full font-medium ${getGoalStatusColor(goal.status)}`}>
                                {getGoalStatusText(goal.status)}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>⏰</span>
                                <span>Жалпы жоспар: {goal.estimatedHours} сағат ({tasks.length} тапсырма)</span>
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

                                {/* Timer Mode Display */}
                                <div className="text-center mb-4">
                                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${timer.mode === 'work' ? 'bg-violet-100 text-violet-800' :
                                        timer.mode === 'break' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {getTimerModeText()}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        Cycle {timer.cycles + 1} • Total Work: {timer.totalWorkTime}min
                                    </div>
                                </div>

                                {/* Active Task Display */}
                                {activeTask && (
                                    <div className="bg-white rounded-xl p-4 mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-gray-800">Active Task:</span>
                                            <span className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded">In Progress</span>
                                        </div>
                                        <h3 className="font-medium text-gray-800 text-sm mb-1">{activeTask.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <span>⏱ {activeTask.estimatedMinutes} мин</span>
                                            <span>✅ {(activeTask.actualMinutes || 0).toFixed(1)} мин</span>
                                            {activeTask.resourceUrl && (
                                                <span>🔗 Resource</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center">
                                    <div className={`w-80 h-80 rounded-full border-8 ${getTimerModeColor()} flex items-center justify-center mb-6 relative`}>
                                        <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 25%, 50% 25%)' }}></div>
                                        <span className="text-5xl font-bold text-gray-800">{formatTime(timer.timeLeft)}</span>
                                    </div>

                                    {/* Timer Controls */}
                                    <div className="w-80 space-y-2">
                                        {timer.state === 'idle' ? (
                                            <button
                                                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!activeTask}
                                                onClick={startTimer}
                                            >
                                                <span>▶️</span>
                                                {activeTask ? 'Start Timer' : 'Select a Task First'}
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                                    onClick={timer.state === 'running' ? pauseTimer : startTimer}
                                                >
                                                    <span>{timer.state === 'running' ? '⏸️' : '▶️'}</span>
                                                    {timer.state === 'running' ? 'Pause' : 'Resume'}
                                                </button>
                                                <button
                                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                                    onClick={stopTimer}
                                                >
                                                    <span>⏹️</span>
                                                    Stop
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Task List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-lg">Сабақ / Task тізімі</h2>
                                    <button
                                        onClick={() => setShowAddTask(!showAddTask)}
                                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                                    >
                                        {showAddTask ? 'Cancel' : '+ Add Task'}
                                    </button>
                                </div>

                                {/* Add Task Form */}
                                {showAddTask && (
                                    <form onSubmit={handleAddTask} className="border border-gray-200 rounded-xl p-4 mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Task Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newTask.title}
                                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                                    placeholder="e.g., UI дизайнын жасау"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Estimated Minutes
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newTask.estimatedMinutes}
                                                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 30 }))}
                                                    min="1"
                                                    max="480"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={newTask.description}
                                                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Describe what needs to be done..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Resource URL (optional)
                                            </label>
                                            <input
                                                type="url"
                                                value={newTask.resourceUrl}
                                                onChange={(e) => setNewTask(prev => ({ ...prev, resourceUrl: e.target.value }))}
                                                placeholder="https://youtube.com/... or https://docs.google.com/..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={isAddingTask}
                                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition"
                                            >
                                                {isAddingTask ? 'Adding...' : 'Add Task'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddTask(false)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Tasks List */}
                                {tasks.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">📝</div>
                                        <p className="text-gray-600">No tasks yet. Add your first task to get started!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${activeTaskId === task.id
                                                    ? 'border-violet-500 bg-violet-50 shadow-md'
                                                    : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleTaskClick(task.id)}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-medium text-gray-800">{task.title}</h3>
                                                        {activeTaskId === task.id && (
                                                            <span className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-gray-600">⏱ {task.estimatedMinutes} мин</span>
                                                </div>

                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                                )}

                                                {task.resourceUrl && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-sm text-violet-600">🔗</span>
                                                        <a
                                                            href={task.resourceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-violet-600 underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Resource Link
                                                        </a>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mb-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTaskStatusChange(task.id, getNextStatus(task.status));
                                                        }}
                                                        className={`px-3 py-1 text-white text-sm rounded-lg ${getStatusColor(task.status)} hover:opacity-80 transition`}
                                                    >
                                                        {getStatusText(task.status)}
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 border border-gray-400 text-gray-600 text-sm rounded-lg flex items-center gap-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (activeTaskId === task.id) {
                                                                startTimer();
                                                            } else {
                                                                handleTaskClick(task.id);
                                                                setTimeout(() => startTimer(), 100);
                                                            }
                                                        }}
                                                    >
                                                        <span>⏱</span>
                                                        Start Timer
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">📤 Push жасалды ма?</span>
                                                        <span className={task.githubPushed ? "text-green-500" : "text-red-500"}>
                                                            {task.githubPushed ? "✅ Иә" : "❌ Жоқ"}
                                                        </span>
                                                    </div>

                                                    {task.feedback && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-600">💬</span>
                                                            <span className="text-gray-800">{task.feedback.text}</span>
                                                            <span className="text-violet-600">🏅 {task.feedback.score}/10</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                                        <div className="text-xs text-gray-600 mb-2">
                                            Repository: {push.repositoryName}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-violet-600">⏱ +{push.progressAdded} минут прогреске қосылды</span>
                                            <a
                                                href={push.commitUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-violet-600 underline"
                                            >
                                                View on GitHub
                                            </a>
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
