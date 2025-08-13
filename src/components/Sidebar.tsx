'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
    { label: 'DashboardScreen', href: '/dashboard', icon: '🏠' },
    { label: 'GoalsScreen', href: '/goals', icon: '🎯' },
    { label: 'PortfoliosScreen', href: '/portfolios', icon: '🗂️' },
    { label: 'HackathonScreen', href: '/hackathon', icon: '🚀' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    return (
        <aside className="bg-[#faf6e7] min-h-screen w-64 p-6 flex flex-col gap-2 border-r border-gray-200">
            <nav className="flex flex-col gap-1">
                {menu.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition text-base hover:bg-violet-50 ${pathname === item.href ? 'bg-white shadow text-violet-700' : 'text-gray-700'}`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
