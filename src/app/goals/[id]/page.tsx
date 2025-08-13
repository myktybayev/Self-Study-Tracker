import Sidebar from '@/components/Sidebar';
import { goalsData } from '@/types/goal';
import { notFound } from 'next/navigation';

export default function GoalDetailPage({ params }: { params: { id: string } }) {
    const goal = goalsData.find(g => g.id === params.id);

    if (!goal) {
        notFound();
    }

    return (
        <div className="flex min-h-screen bg-[#fffbe9]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-8">
                    {/* Goal Overview Section */}
                    <div className="bg-white rounded-2xl shadow p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{goal.icon}</span>
                                <h1 className="text-2xl font-bold text-gray-800">{goal.title}</h1>
                            </div>
                            <span className={`px-3 py-1 text-white text-sm rounded-full font-medium ${goal.status === 'done' ? 'bg-green-500' :
                                goal.status === 'in_progress' ? 'bg-yellow-500' :
                                    'bg-gray-400'
                                }`}>
                                {goal.status === 'done' ? 'Done' :
                                    goal.status === 'in_progress' ? 'In Progress' :
                                        'Not Started'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>⏰</span>
                                <span>Жалпы жоспар: {goal.totalHours} сағат ({goal.totalTasks} тапсырма)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>📅</span>
                                <span>Уақыты: {goal.startDate} - {goal.endDate}</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className={`h-3 rounded-full ${goal.status === 'done' ? 'bg-green-500' : 'bg-violet-600'
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

                                {goal.tasks.map((task) => (
                                    <div key={task.id} className="border border-gray-200 rounded-xl p-4 mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-800">{task.title}</h3>
                                            <span className="text-sm text-gray-600">{task.duration} мин</span>
                                        </div>
                                        {task.link && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-sm text-violet-600">🔗</span>
                                                <span className="text-sm text-violet-600 underline">{task.link}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-2 mb-3">
                                            <button className={`px-3 py-1 text-white text-sm rounded-lg ${task.status === 'done' ? 'bg-green-500' :
                                                task.status === 'in_progress' ? 'bg-violet-600' :
                                                    'bg-gray-400'
                                                }`}>
                                                {task.status === 'done' ? 'Done' :
                                                    task.status === 'in_progress' ? 'In Progress' :
                                                        'Start Task'}
                                            </button>
                                            <button className={`px-3 py-1 border text-sm rounded-lg flex items-center gap-1 ${task.status === 'done' ? 'border-green-500 text-green-600' :
                                                task.status === 'in_progress' ? 'border-violet-600 text-violet-600' :
                                                    'border-gray-400 text-gray-600'
                                                }`}>
                                                <span>⏰</span>
                                                Start Timer
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-sm text-gray-600">Push жасалды ма?</span>
                                            <span className={task.pushDone ? "text-green-500" : "text-red-500"}>
                                                {task.pushDone ? "✅" : "❌"}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm">💬</span>
                                                <span className="text-sm font-medium">Мұғалім фидбэкі</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">
                                                {task.teacherFeedback || 'Күтілуде...'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">🏆</span>
                                                <span className={`text-sm font-medium ${task.score ? 'text-violet-600' : 'text-gray-500'
                                                    }`}>
                                                    Баға: {task.score ? `${task.score}/10` : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Subtask Button */}
                                <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-600 hover:border-violet-400 hover:text-violet-600 transition">
                                    + Add Subtask
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: GitHub Push Log & Teacher Feedback */}
                    <div className="mt-6 space-y-6">
                        {/* GitHub Push Log */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="font-semibold text-lg mb-4">GitHub Push Логтері</h2>
                            <div className="space-y-4">
                                {goal.githubPushes.length > 0 ? (
                                    goal.githubPushes.map((push) => (
                                        <div key={push.id} className="border-l-4 border-violet-500 pl-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-800">{push.date}</span>
                                                <span className="text-xs text-violet-600">+{push.progressAdded} минут прогреске қосылды</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{push.message}</p>
                                            <a href={push.url} className="text-sm text-violet-600 underline">View on GitHub</a>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">GitHub push логтері жоқ</p>
                                )}
                            </div>
                        </div>

                        {/* Teacher Feedback */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="font-semibold text-lg mb-4">Мұғалім фидбэкі</h2>
                            <div className="space-y-4">
                                {goal.teacherFeedback ? (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700 mb-3">{goal.teacherFeedback}</p>
                                        {goal.overallScore && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-sm">🏆</span>
                                                <span className="text-sm font-medium text-violet-600">Балл: {goal.overallScore} / 10</span>
                                            </div>
                                        )}
                                        <a href="#" className="text-sm text-violet-600 underline">Ресурс ұсыну (link)</a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Мұғалім фидбэкі әлі жоқ</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
