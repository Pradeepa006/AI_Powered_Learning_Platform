import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    currentStreak?: number;
    xpPoints?: number;
    profilePhoto?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: AuthUser | null;
}

const AUTH_STORAGE_KEY = 'mock_auth_user';

function loadInitialUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}

const initialUser = loadInitialUser();

const initialState: AuthState = {
    isAuthenticated: !!initialUser,
    user: initialUser,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthUser>) => {
            state.isAuthenticated = true;
            state.user = action.payload;
            if (typeof window !== 'undefined') {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(action.payload));
            }
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;