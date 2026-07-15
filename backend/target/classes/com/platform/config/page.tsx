'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login as mockLogin } from '@/lib/auth'; // Renamed to avoid conflict with Redux action
import { useDispatch } from 'react-redux'; // Import useDispatch
import { login } from '@/redux/authSlice'; // Import login action from authSlice

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch(); // Initialize useDispatch

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        let authResponse;
        // --- TEMPORARY: Allow all users to log in for testing purposes ---
        if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
            console.warn("TEST_MODE enabled: Bypassing actual authentication for testing.");
            authResponse = {
                token: 'mock-jwt-token-for-testing',
                user: {
                    id: 'test-user-id',
                    name: email.split('@')[0] || 'Test User',
                    email: email || 'test@example.com',
                    role: 'STUDENT', // Or 'INSTRUCTOR' if needed for testing instructor features
                    xpPoints: 100, currentStreak: 5, profilePhoto: undefined,
                },
            };
        } else {
            // Perform mock login and get the mock auth response
            authResponse = login(email, 'STUDENT');
        }
        // --- END TEMPORARY BLOCK ---

        dispatch(setCredentials(authResponse)); // Dispatch credentials to Redux store

        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
        router.push(callbackUrl);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Sign in to continue your learning journey.</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                <div className="p-4 mt-6 text-center bg-indigo-50 border border-indigo-200 rounded-lg dark:bg-indigo-900/20 dark:border-indigo-800">
                    <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">Demo Account</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        Email: <span className="font-medium">demo@student.com</span>
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        Password: <span className="font-medium">demo123</span>
                    </p>
                </div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Not a member?{' '}
                    <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;