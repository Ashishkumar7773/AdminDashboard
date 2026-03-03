import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";

const ResetPassword = () => {
    const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.password !== passwords.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await API.post(`/auth/reset-password/${token}`, { password: passwords.password });
            setMessage("Password reset successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Reset failed. Link may be invalid or expired.");
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
                    <h2 className="text-3xl font-bold">New Password</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        Enter your new strong password below.
                    </p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-medium animate-in fade-in">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium animate-in fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            className="input-field"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={passwords.password}
                            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                        <input
                            className="input-field"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex justify-center">
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : "Reset Password"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <Link to="/login" className="text-sm text-primary font-semibold hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
