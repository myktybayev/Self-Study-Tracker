'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getGoalById, createTask, getGoalTasks, updateTask, updateGoal } from '@/lib/goals';
import { Goal, Task } from '@/types/goal';
import { useEffect, useState, useRef } from 'react';
import { notFound } from 'next/navigation';
import NotificationDialog from '@/components/NotificationDialog';

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
    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState<'work' | 'break' | 'longBreak'>('work');
    const [showGitHubInput, setShowGitHubInput] = useState<string | null>(null);
    const [gitHubUrl, setGitHubUrl] = useState('');
    const [isUpdatingGitHub, setIsUpdatingGitHub] = useState(false);

    // Timer states
    const [timer, setTimer] = useState<TimerData>({
        mode: 'work',
        state: 'idle',
        timeLeft: 25, // 25 seconds (test)
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

    // Timer constants (test mode - shortened times)
    const WORK_TIME = 25; // 25 seconds (test)
    const BREAK_TIME = 5; // 5 seconds (test)
    const LONG_BREAK_TIME = 15; // 15 seconds (test)
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
            const workMinutes = WORK_TIME / 60; // Convert seconds to minutes (25/60 = 0.416 minutes)
            console.log(`Work session completed: ${WORK_TIME} seconds = ${workMinutes} minutes`);
            setTimer(prev => ({
                ...prev,
                totalWorkTime: prev.totalWorkTime + workMinutes,
                cycles: prev.cycles + 1,
            }));

            // Update task actual minutes
            if (activeTaskId && user?.userId && goal) {
                try {
                    const activeTask = tasks.find(t => t.id === activeTaskId);
                    if (activeTask) {
                        const currentActualMinutes = activeTask.actualMinutes || 0;
                        const newActualMinutes = currentActualMinutes + workMinutes;
                        console.log(`Updating task actual minutes: ${currentActualMinutes} + ${workMinutes} = ${newActualMinutes}`);

                        await updateTask(user.userId, goal.id, activeTaskId, {
                            actualMinutes: newActualMinutes,
                        });

                        // Update local state
                        setTasks(prev => prev.map(task =>
                            task.id === activeTaskId
                                ? { ...task, actualMinutes: newActualMinutes }
                                : task
                        ));

                        // Update goal progress after timer completion
                        setTimeout(() => updateGoalProgress(), 100);
                    }
                } catch (err) {
                    console.error('Error updating task actual minutes:', err);
                }
            }

            // Check if it's time for long break
            const nextCycles = timer.cycles + 1;
            console.log(`Current cycles: ${timer.cycles}, Next cycles: ${nextCycles}, Long break at: ${CYCLES_BEFORE_LONG_BREAK}`);

            if (nextCycles % CYCLES_BEFORE_LONG_BREAK === 0) {
                console.log('Starting long break!');
                // Show long break notification before starting long break
                setNotificationType('longBreak');
                setShowNotification(true);

                setTimer({
                    mode: 'longBreak',
                    state: 'idle', // Wait for user to continue
                    timeLeft: LONG_BREAK_TIME,
                    cycles: nextCycles,
                    totalWorkTime: timer.totalWorkTime + workMinutes,
                });
            } else {
                console.log('Starting regular break!');
                // Show notification for work completion
                setNotificationType('work');
                setShowNotification(true);

                setTimer({
                    mode: 'break',
                    state: 'idle', // Wait for user to continue
                    timeLeft: BREAK_TIME,
                    cycles: nextCycles,
                    totalWorkTime: timer.totalWorkTime + workMinutes,
                });
            }
        } else {
            // Break completed, start work session without notification
            setTimer({
                mode: 'work',
                state: 'idle', // Wait for user to continue
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

    const continueTimer = () => {
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

    const getTimerProgress = (): number => {
        const totalTime = timer.mode === 'work' ? WORK_TIME :
            timer.mode === 'break' ? BREAK_TIME : LONG_BREAK_TIME;
        const elapsed = totalTime - timer.timeLeft;
        return (elapsed / totalTime) * 100;
    };

    const getTimerProgressClipPath = (): string => {
        const progress = getTimerProgress();
        if (progress === 0) return 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)';

        // Convert percentage to degrees (0-360)
        const degrees = (progress / 100) * 360;

        // Calculate points for the clip path
        const centerX = 50;
        const centerY = 50;
        const radius = 50;

        if (degrees <= 90) {
            const endX = centerX + radius * Math.cos((degrees - 90) * Math.PI / 180);
            const endY = centerY + radius * Math.sin((degrees - 90) * Math.PI / 180);
            return `polygon(${centerX}% ${centerY}%, ${centerX}% 0%, ${endX}% 0%, ${endX}% ${endY}%)`;
        } else if (degrees <= 180) {
            const endX = centerX + radius * Math.cos((degrees - 90) * Math.PI / 180);
            const endY = centerY + radius * Math.sin((degrees - 90) * Math.PI / 180);
            return `polygon(${centerX}% ${centerY}%, ${centerX}% 0%, 100% 0%, 100% 100%, ${endX}% ${endY}%)`;
        } else if (degrees <= 270) {
            const endX = centerX + radius * Math.cos((degrees - 90) * Math.PI / 180);
            const endY = centerY + radius * Math.sin((degrees - 90) * Math.PI / 180);
            return `polygon(${centerX}% ${centerY}%, ${centerX}% 0%, 100% 0%, 100% 100%, 0% 100%, ${endX}% ${endY}%)`;
        } else {
            const endX = centerX + radius * Math.cos((degrees - 90) * Math.PI / 180);
            const endY = centerY + radius * Math.sin((degrees - 90) * Math.PI / 180);
            return `polygon(${centerX}% ${centerY}%, ${centerX}% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${endX}% ${endY}%)`;
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

            // Update goal progress after adding new task
            setTimeout(() => updateGoalProgress(), 100);

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
            // Get current task status before update
            const currentTask = tasks.find(task => task.id === taskId);
            const oldStatus = currentTask?.status;

            await updateTask(user.userId, goal.id, taskId, { status: newStatus });

            // Update local state
            setTasks(prev => prev.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ));

            // Calculate progress change
            const totalTasks = tasks.length;
            const taskPercentage = 100 / totalTasks;

            if (oldStatus === 'completed' && newStatus !== 'completed') {
                // Task was completed, now it's not - decrease progress
                console.log(`Task ${taskId} status changed from completed to ${newStatus} - decreasing progress by ${taskPercentage.toFixed(2)}%`);
            } else if (oldStatus !== 'completed' && newStatus === 'completed') {
                // Task was not completed, now it is - increase progress
                console.log(`Task ${taskId} status changed to completed - increasing progress by ${taskPercentage.toFixed(2)}%`);
            }

            // Update goal progress after task status change
            setTimeout(() => updateGoalProgress(), 100);
        } catch (err) {
            console.error('Error updating task status:', err);
            setError('Failed to update task status.');
        }
    };

    const handleGitHubPush = async (taskId: string) => {
        if (!user?.userId || !goal) return;

        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // If already pushed, open the repository URL
        if (task.githubPushed && task.githubRepoUrl) {
            window.open(task.githubRepoUrl, '_blank');
            return;
        }

        // Show GitHub URL input widget
        setShowGitHubInput(taskId);
        setGitHubUrl('');
        setError(null);
    };

    const handleGitHubUrlSubmit = async (taskId: string) => {
        if (!user?.userId || !goal || !gitHubUrl.trim()) {
            alert('GitHub Repository URL енгізіңіз!');
            return;
        }

        // Validate GitHub URL
        const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+(?:\/)?$/;
        if (!githubUrlPattern.test(gitHubUrl.trim())) {
            alert('Дұрыс GitHub Repository URL енгізіңіз!\n\nМысалы:\nhttps://github.com/username/repo\nhttps://github.com/username/project-name');
            return;
        }

        try {
            setIsUpdatingGitHub(true);
            setError(null);

            // Update task with GitHub push info
            await updateTask(user.userId, goal.id, taskId, {
                githubPushed: true,
                githubRepoUrl: gitHubUrl.trim(),
            });

            // Update local state
            setTasks(prev => prev.map(task =>
                task.id === taskId
                    ? { ...task, githubPushed: true, githubRepoUrl: gitHubUrl.trim() }
                    : task
            ));

            // Reset form
            setShowGitHubInput(null);
            setGitHubUrl('');

            // Show success message
            setError(null);
            alert('✅ GitHub Repository URL сәтті сақталды!');
            console.log('GitHub repository URL saved successfully!');
        } catch (err) {
            console.error('Error updating GitHub push status:', err);
            alert('❌ GitHub repository URL сақтау кезінде қате орын алды. Қайталап көріңіз.');
        } finally {
            setIsUpdatingGitHub(false);
        }
    };

    const handleGitHubUrlCancel = () => {
        setShowGitHubInput(null);
        setGitHubUrl('');
        setError(null);
        console.log('GitHub URL input cancelled');
    };

    // Calculate and update goal progress based on individual task completion
    const updateGoalProgress = async () => {
        if (!user?.userId || !goal) return;

        try {
            const totalTasks = tasks.length;

            if (totalTasks === 0) return;

            // Calculate individual task percentage contribution
            const taskPercentage = 100 / totalTasks;

            // Count completed tasks
            const completedTasks = tasks.filter(task => task.status === 'completed').length;

            // Calculate total progress
            const progressPercentage = Math.round(completedTasks * taskPercentage);

            console.log(`Goal progress update: ${completedTasks} completed tasks × ${taskPercentage.toFixed(2)}% each = ${progressPercentage}% total`);

            // Update goal progress in Firebase
            await updateGoal(user.userId, goal.id, {
                progress: progressPercentage,
                actualHours: tasks.reduce((total, task) => total + (task.actualMinutes || 0), 0) / 60, // Convert minutes to hours
            });

            // Update local goal state immediately
            setGoal(prev => {
                if (!prev) return null;
                const updatedGoal = {
                    ...prev,
                    progress: progressPercentage,
                    actualHours: tasks.reduce((total, task) => total + (task.actualMinutes || 0), 0) / 60,
                };
                console.log('Updated goal state:', updatedGoal);
                return updatedGoal;
            });

        } catch (err) {
            console.error('Error updating goal progress:', err);
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
        <>
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>⏰</span>
                                    <span>Жалпы жоспар: {goal.estimatedHours} сағат</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>✅</span>
                                    <span>Тапсырмалар: {tasks.filter(t => t.status === 'completed').length} Done / {tasks.length} жалпы (әр task = {(100 / Math.max(tasks.length, 1)).toFixed(1)}%)</span>
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
                                    }`} style={{ width: `${goal.progress || 0}%` }}></div>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                Жалпы прогресс: {goal.progress || 0}%
                                {goal.progress === undefined && <span className="text-orange-500 ml-2">(есептелуде...)</span>}
                            </div>
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
                                            {/* Progress ring */}
                                            <div
                                                className="absolute inset-0 rounded-full border-8 border-yellow-500 transition-all duration-1000 ease-linear"
                                                style={{
                                                    clipPath: getTimerProgressClipPath()
                                                }}
                                            ></div>
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
                                                        <button
                                                            className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 transition ${task.githubPushed
                                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                                                }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleGitHubPush(task.id);
                                                            }}
                                                        >
                                                            <span>📤</span>
                                                            {task.githubPushed ? 'Pushed' : 'Push'}
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm">
                                                        {task.githubRepoUrl && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-600">🔗</span>
                                                                <a
                                                                    href={task.githubRepoUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-violet-600 underline hover:text-violet-800 flex items-center gap-1"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <span>GitHub Repo</span>
                                                                    <span className="text-xs">↗</span>
                                                                </a>
                                                            </div>
                                                        )}

                                                        {task.feedback && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-600">💬</span>
                                                                <span className="text-gray-800">{task.feedback.text}</span>
                                                                <span className="text-violet-600">🏅 {task.feedback.score}/10</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* GitHub URL Input Widget */}
                                                    {showGitHubInput === task.id && (
                                                        <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="text-violet-600">📤</span>
                                                                <span className="text-sm font-medium text-gray-700">GitHub Repository URL енгізіңіз:</span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="url"
                                                                    value={gitHubUrl}
                                                                    onChange={(e) => setGitHubUrl(e.target.value)}
                                                                    placeholder="https://github.com/username/repo"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            handleGitHubUrlSubmit(task.id);
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleGitHubUrlSubmit(task.id);
                                                                        }}
                                                                        disabled={isUpdatingGitHub || !gitHubUrl.trim()}
                                                                        className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                                                                    >
                                                                        {isUpdatingGitHub ? '💾 Сақталуда...' : '💾 Сақтау'}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleGitHubUrlCancel();
                                                                        }}
                                                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition"
                                                                    >
                                                                        Бас тарту
                                                                    </button>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Мысалы: https://github.com/username/project-name
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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

            {/* Notification Dialog */}
            <NotificationDialog
                isOpen={showNotification}
                onClose={() => setShowNotification(false)}
                type={notificationType}
                onContinue={continueTimer}
            />
        </>
    );
}
