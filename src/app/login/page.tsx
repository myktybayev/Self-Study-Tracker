'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function LoginPage() {
    const { signInWithGitHub } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGitHubSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithGitHub();
        } catch (error) {
            setError('GitHub кіру сәтсіз болды. Қайталап көріңіз.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg flex flex-col items-center">
                <div className="mb-6">
                    <span className="inline-block text-4xl text-indigo-500 mb-2">✨</span>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-center">Self Study Tracker</h1>
                <p className="text-gray-500 text-center mb-6">Track your goals. Push your progress.<br />Unlock your potential.</p>

                <button
                    onClick={handleGitHubSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 rounded-lg font-medium mb-4 hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                    )}
                    {isLoading ? 'Кіру жасалып жатыр...' : 'Sign in with GitHub'}
                </button>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}

                <div className="flex items-center w-full mb-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="mx-2 text-gray-400 text-sm">Or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <form className="w-full flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="your@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="********" />
                    </div>
                    <p className="text-red-500 text-xs mt-1">Invalid email or password</p>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-base transition">
                        <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 20 20">
                            <path d="M3 10a1 1 0 011-1h8.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L12.586 11H4a1 1 0 01-1-1z" />
                        </svg>
                        Login with Email
                    </button>
                </form>

                <div className="w-full flex justify-end mt-2">
                    <a href="#" className="text-indigo-500 text-sm hover:underline">Forgot password? Reset it here</a>
                </div>

                <div className="w-full border-t border-gray-200 my-6" />

                <div className="w-full flex flex-col items-center gap-2">
                    <p className="text-gray-500 text-sm">Don't have an account?</p>
                    <button className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium text-base transition">
                        <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 20 20">
                            <path d="M8 9a3 3 0 116 0 3 3 0 01-6 0zM2 16a6 6 0 1112 0H2z" />
                        </svg>
                        Create Account
                    </button>
                </div>
            </div>
        </main>
    );
}
