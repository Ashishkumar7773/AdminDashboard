import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://admindashboard-0cnx.onrender.com/api";

const API = axios.create({
    baseURL: BASE_URL,
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export { BASE_URL };
export default API;
