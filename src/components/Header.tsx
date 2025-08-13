'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const handleAvatarClick = () => {
        if (user) {
            // Егер пайдаланушы кірген болса, account settings бетіне өту
            router.push('/account');
        } else {
            // Егер кірмеген болса, login page-ге өту
            router.push('/login');
        }
    };

    return (
        <header className="w-full flex items-center justify-between px-8 py-3 bg-[#fffbe9] border-b border-gray-200">
            {/* Logo & Name */}
            <div className="flex items-center gap-2 text-violet-600 font-bold text-xl">
                <span className="text-2xl">{/* Star icon */}
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 3.25c.41 0 .77.26.91.64l2.14 5.89 6.13.09c.97.01 1.37 1.25.6 1.81l-4.89 3.6 1.84 5.98c.28.92-.75 1.67-1.54 1.13L12 18.13l-5.19 3.02c-.79.54-1.82-.21-1.54-1.13l1.84-5.98-4.89-3.6c-.77-.56-.37-1.8.6-1.81l6.13-.09 2.14-5.89c.14-.38.5-.64.91-.64z" fill="currentColor" /></svg>
                </span>
                DreamTracker
            </div>
            {/* Right side */}
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-1 text-violet-600 font-medium">
                    <span className="text-xl"><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 10-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 006 19h12a1 1 0 00.71-1.71L18 16z" fill="currentColor" /></svg></span>
                    <span className="hidden md:inline text-gray-600">Activity</span>
                </div>
                <div className="flex items-center gap-1 text-violet-600 font-medium">
                    <span className="text-xl"><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z" fill="currentColor" /></svg></span>
                    <span className="hidden md:inline text-gray-600">1250 Points</span>
                </div>

                {/* User Avatar */}
                <div
                    onClick={handleAvatarClick}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-violet-500 hover:border-violet-600 transition-colors cursor-pointer relative"
                >
                    {isLoading ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : user ? (
                        <img
                            src={user.image || "/default-avatar.svg"}
                            alt={user.name || "User Avatar"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src="/default-avatar.svg"
                            alt="Default Avatar"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Online indicator */}
                    {user && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                </div>
            </div>
        </header>
    );
}
