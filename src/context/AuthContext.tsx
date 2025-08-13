'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithGitHub: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') {
            setIsLoading(true);
            return;
        }

        if (session?.user) {
            setUser({
                id: session.user.id || '',
                name: session.user.name || '',
                email: session.user.email || '',
                image: session.user.image || '',
            });
        } else {
            setUser(null);
        }

        setIsLoading(false);
    }, [session, status]);

    const signInWithGitHub = async () => {
        try {
            await signIn('github', { callbackUrl: '/dashboard' });
        } catch (error) {
            console.error('GitHub sign in error:', error);
        }
    };

    const logout = async () => {
        try {
            await signOut({ callbackUrl: '/login' });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signInWithGitHub, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
