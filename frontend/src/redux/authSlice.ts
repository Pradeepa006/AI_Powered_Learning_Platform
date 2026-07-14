import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: number | null;
  name: string | null;
  email: string | null;
  role: string | null;
  xpPoints: number;
  currentStreak: number;
  bio?: string;
  title?: string;
  profilePhoto?: string;
  skills?: string;
}

interface AuthState {
  user: UserState | null;
  token: string | null;
  isAuthenticated: boolean;
}

const readStoredUser = (userJson: string | null): UserState | null => {
  if (!userJson || userJson === 'undefined' || userJson === 'null') {
    return null;
  }

  try {
    return JSON.parse(userJson) as UserState;
  } catch {
    return null;
  }
};

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const storedUser = readStoredUser(userJson);

    if (token && storedUser) {
      return {
        user: storedUser,
        token,
        isAuthenticated: true,
      };
    }

    if (userJson && !storedUser) {
      localStorage.removeItem('user');
    }

    if (!token) {
      localStorage.removeItem('token');
    }
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserState; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    updateXpAndStreak: (
      state,
      action: PayloadAction<{ xpPoints: number; currentStreak: number }>
    ) => {
      if (state.user) {
        state.user.xpPoints = action.payload.xpPoints;
        state.user.currentStreak = action.payload.currentStreak;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setCredentials, updateXpAndStreak, logout } = authSlice.actions;
export default authSlice.reducer;
