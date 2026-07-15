'use client';

export interface MockUser {
    email: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    name: string;
    id: string;
    // Add fields expected by Redux state for a more complete mock user
    xpPoints?: number;
    currentStreak?: number;
    profilePhoto?: string;
}

const AUTH_STORAGE_KEY = 'mock_auth_user';

/**
 * Mock login for showcase/demo purposes.
 * Accepts any email + role, no real credential verification.
 * DO NOT use this pattern in a production build with real user data.
 */
export function login(email: string, role: MockUser['role'] = 'STUDENT'): MockUser {
    // Create a more comprehensive mock user object
    const user: MockUser = {
        email,
        role,
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        id: `mock-${Date.now()}`,
        xpPoints: 100, // Dummy value
        currentStreak: 1, // Dummy value
        profilePhoto: `https://api.dicebear.com/8.x/initials/svg?seed=${email.split('@')[0]}`, // Dummy avatar
    };

    // The Redux setCredentials expects an object with 'token' and 'user'
    // We'll return this structure directly from the mock login function.
    const mockAuthResponse = {
        token: `mock_jwt_${user.id}_${Date.now()}`, // Dummy token
        user: user,
    };

    // Store only the user object for the getCurrentUser/isLoggedIn functions
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockAuthResponse.user));
    }

    return mockAuthResponse;
}

export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
}

export function getCurrentUser(): MockUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null; // This will now return the full mockAuthResponse.user
    try {
        return JSON.parse(raw) as MockUser;
    } catch {
        return null;
    }
}

export function isLoggedIn(): boolean {
    return getCurrentUser() !== null;
}