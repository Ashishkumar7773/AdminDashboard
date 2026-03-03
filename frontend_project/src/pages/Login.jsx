import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post("/auth/login", form);
            localStorage.setItem("token", res.data.token);
            navigate("/admin");
        } catch (err) {
            alert("Invalid Login Credentials!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold">Welcome Back</h2>
                    <p className="text-slate-500 mt-2">Login to your admin dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="admin@example.com"
                            required
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <Link to="/forgot-password" title="Forget Password?" className="text-xs text-primary hover:underline">Forgot password?</Link>
                        </div>
                        <input
                            className="input-field"
                            type="password"
                            placeholder="••••••••"
                            required
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex justify-center items-center py-3"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-slate-600">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
