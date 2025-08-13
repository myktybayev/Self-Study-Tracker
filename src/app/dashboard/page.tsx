import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-[#fffbe9]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-8">
                    {/* Бірінші row: Profile + My Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-stretch">
                        {/* Profile - 2 баған */}
                        <div className="md:col-span-2 h-full">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-center h-full">
                                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Avatar" className="w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-8 border-4 border-violet-200" />
                                <div className="flex flex-col items-center md:items-start w-full">
                                    <div className="text-lg font-semibold mb-1">Алибек М.</div>
                                    <div className="text-gray-500 mb-4">Flutter Developer</div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium text-sm transition w-full md:w-auto">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.43 12.98l-1.43-1.43a1 1 0 00-1.41 0l-1.13 1.13-2.12-2.12 1.13-1.13a1 1 0 000-1.41l-1.43-1.43a1 1 0 00-1.41 0l-7.07 7.07a1 1 0 000 1.41l1.43 1.43a1 1 0 001.41 0l1.13-1.13 2.12 2.12-1.13 1.13a1 1 0 000 1.41l1.43 1.43a1 1 0 001.41 0l7.07-7.07a1 1 0 000-1.41z" fill="currentColor" />
                                        </svg>
                                        Customize Avatar
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* My Progress - 1 баған */}
                        <div className="md:col-span-1 h-full">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start justify-start h-full">
                                <div className="flex items-center gap-2 mb-2 text-gray-400">
                                    <span>⏳</span>
                                    <span className="text-sm font-bold text-black">My Progress</span>
                                </div>
                                <div className="text-4xl font-bold text-violet-600">125 сағат</div>
                            </div>
                        </div>
                    </div>

                    {/* Екінші row: Level Progression + Recent Goals + Unlocked Badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-stretch">
                        {/* Level Progression */}
                        <div className="h-full">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-violet-500 text-xl">↗️</span>
                                        <span className="font-semibold text-lg">Level Progression</span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-2">Intern → Junior-ға дейін 75 сағат қалды</div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full mb-2">
                                        <div className="h-3 bg-violet-500 rounded-full" style={{ width: '60%' }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-yellow-600 mt-2">
                                    <span>🔥 3 күн қатар progress</span>
                                    <span className="ml-2">+10 бонус</span>
                                </div>
                            </div>
                        </div>
                        {/* Recent Goals */}
                        <div className="h-full">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-violet-500 text-xl">🎯</span>
                                        <span className="font-semibold text-lg">Recent Goals</span>
                                    </div>
                                    <ul className="flex flex-col divide-y divide-gray-100">
                                        <li className="flex items-center justify-between py-2">
                                            <span className="text-sm text-gray-700">Login Page</span>
                                            <span className="px-2 py-0.5 rounded bg-green-500 text-white text-xs font-semibold">DONE</span>
                                        </li>
                                        <li className="flex items-center justify-between py-2">
                                            <span className="text-sm text-gray-700">Firebase Auth</span>
                                            <span className="px-2 py-0.5 rounded bg-yellow-400 text-white text-xs font-semibold">IN PROGRESS</span>
                                        </li>
                                        <li className="flex items-center justify-between py-2">
                                            <span className="text-sm text-gray-700">UI Refactoring</span>
                                            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-500 text-xs font-semibold">NOT STARTED</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/* Unlocked Badges */}
                        <div className="h-full">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-start h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-violet-500 text-xl">🏅</span>
                                    <span className="font-semibold text-lg">Unlocked Badges</span>
                                </div>
                                <div className="flex flex-col gap-1 mt-2 items-start">
                                    <div className="flex items-center gap-2 text-yellow-500">
                                        <span className="text-xl">🥇</span>
                                        <span className="text-sm text-gray-700">Team Challenger</span>
                                        <span className="ml-auto text-xs text-gray-400">100 сағат</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-yellow-500">
                                        <span className="text-xl">🚀</span>
                                        <span className="text-sm text-gray-700">Mentor Path</span>
                                        <span className="ml-auto text-xs text-gray-400">200 сағат</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Үшінші row: Daily Quests + Daily Reward */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-stretch">
                        {/* Daily Quests - 2 баған */}
                        <div className="md:col-span-2 h-full">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-violet-500"><span>📅</span> <span className="font-semibold">Daily Quests</span></div>
                                    <div className="text-gray-700 text-sm mb-2">
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-700">Pomodoro 1 цикл жасау</span>
                                            <span className="font-bold text-violet-600">+5</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-700">1 сабақ аяқтау</span>
                                            <span className="font-bold text-violet-600">+10</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-700">GitHub push жасау</span>
                                            <span className="font-bold text-violet-600">+15</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-700">Мұғалімнен фидбэк алу</span>
                                            <span className="font-bold text-violet-600">+20</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Daily Reward - 1 баған */}
                        <div className="md:col-span-1 h-full">
                            <div className="bg-yellow-300 rounded-2xl shadow p-6 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-2 text-yellow-900 font-semibold"><span>🎁</span> <span>Daily Reward</span></div>
                                <div className="text-sm text-gray-700 mb-2">Pomodoro жасап болдың – Шоколад жинадың</div>
                                <button className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition">Collect reward</button>
                            </div>
                        </div>
                    </div>

                    {/* Төртінші row: қалған карточкалар grid-те */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {/* General Statistics */}
                        <div className="h-full">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-start h-full">
                                <div className="font-semibold text-violet-500 mb-2">General Statistics</div>
                                <div className="flex flex-col gap-1 text-gray-700 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span>Барлық push саны:</span>
                                        <span className="font-bold text-violet-600">173</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Барлық мақсат:</span>
                                        <span className="font-bold text-violet-600">23</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Орташа күндік сағат:</span>
                                        <span className="font-bold text-violet-600">1.5h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Leaderboard Preview */}
                        <div className="md:col-span-2 h-full">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between h-full">
                                <div>
                                    <div className="font-semibold text-violet-500 mb-2">Leaderboard Preview</div>
                                    <ol className="text-gray-700 text-sm mb-2">
                                        <li className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-700">1. Алибек</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">125 сағат</span>
                                                <span className="text-violet-500 font-bold">JUNIOR</span>
                                            </div>
                                        </li>
                                        <li className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-700">2. Аружан</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">90 сағат</span>
                                                <span className="text-violet-500 font-bold">INTERN</span>
                                            </div>
                                        </li>
                                        <li className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-700">3. Нұрбек</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">210 сағат</span>
                                                <span className="text-violet-500 font-bold">MIDDLE</span>
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                                <button className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition">Толық Leaderboard</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
