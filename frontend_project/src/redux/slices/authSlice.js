import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = "http://localhost:5000/api/auth";
const API_URL = "https://admindashboard-0cnx.onrender.com/api/auth";

// Async thunks for actions
export const loginUser = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || "Login failed");
    }
});

export const registerUser = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || "Registration failed");
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: localStorage.getItem("token") || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
