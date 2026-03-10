import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

// Fetch employees with pagination and filters
export const fetchEmployees = createAsyncThunk(
    "employees/fetchAll",
    async (params, thunkAPI) => {
        try {
            const response = await API.get("/employees", {
                params,
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch employees");
        }
    }
);

const employeeSlice = createSlice({
    name: "employees",
    initialState: {
        list: [],
        total: 0,
        pages: 0,
        currentPage: 1,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.employees;
                state.total = action.payload.total;
                state.pages = action.payload.pages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default employeeSlice.reducer;
