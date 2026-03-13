import API from "./api";

const apiService = {
    // Auth
    login: (data) => API.post("/auth/login", data),
    register: (data) => API.post("/auth/register", data),
    forgotPassword: (data) => API.post("/auth/forgot-password", data),
    resetPassword: (token, data) => API.post(`/auth/reset-password/${token}`, data),

    // Users (Admins/SuperAdmins)
    getUsers: (params) => API.get("/auth/users", { params }),
    updateUser: (id, data) => API.put(`/auth/users/${id}`, data),
    deleteUser: (id) => API.delete(`/auth/users/${id}`),

    // Employees
    getEmployees: (params) => API.get("/employees", { params }),
    createEmployee: (formData) => API.post("/employees", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    updateEmployee: (id, formData) => API.put(`/employees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    deleteEmployee: (id) => API.delete(`/employees/${id}`),

    // Stats
    getDashboardStats: () => API.get("/auth/stats"),
    getMe: () => API.get("/auth/me"),
};

export default apiService;
