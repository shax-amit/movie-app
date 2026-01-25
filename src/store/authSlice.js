import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        authSuccess: (state, action) => {
            const { user, token } = action.payload;
            state.loading = false;
            state.isAuthenticated = true;
            state.user = user;
            state.token = token;
            state.error = null;
            if (token) localStorage.setItem('token', token);
        },
        authFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('token');
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        }
    },
});

export const { authStart, authSuccess, authFail, logout, setUser } = authSlice.actions;

export default authSlice.reducer;
