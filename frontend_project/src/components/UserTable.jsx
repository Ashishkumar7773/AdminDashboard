import React from "react";
import API from "../services/api";

const UserTable = ({ users, refresh, onEdit, onSort, sortConfig }) => {
    const SortHeader = ({ label, sortKey }) => {
        const isActive = sortConfig?.key === sortKey;
        return (
            <th
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors ${isActive ? 'text-primary' : 'text-slate-500'}`}
                onClick={() => onSort(sortKey)}
            >
                <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {isActive ? (
                        sortConfig.direction === 'ASC' ? (
                            <svg className="w-3 h-3 text-primary animate-in fade-in zoom-in duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3 text-primary animate-in fade-in zoom-in duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        )
                    ) : (
                        <svg className="w-3 h-3 text-slate-300 opacity-20 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    )}
                </div>
            </th>
        );
    };

    const getRoleColor = (role) => {
        const r = role?.toLowerCase();
        const colors = {
            superadmin: "bg-red-100 text-red-700 border-red-200",
            admin: "bg-indigo-100 text-indigo-700 border-indigo-200",
            editor: "bg-amber-100 text-amber-700 border-amber-200",
            user: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
        return colors[r] || "bg-slate-50 text-slate-500 border-slate-200";
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await API.delete(`/auth/users/${id}`);
            refresh();
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting user!");
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <SortHeader label="User Info" sortKey="name" />
                            <SortHeader label="Email" sortKey="email" />
                            <SortHeader label="Role" sortKey="role" />
                            <SortHeader label="Joined Date" sortKey="createdAt" />
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-50/80 transition-all duration-200 cursor-pointer select-none">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/20 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm border border-indigo-500/10 group-hover:scale-110 transition-transform">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-bold text-slate-900 leading-none mb-1">{user.name}</div>
                                                <div className="text-xs text-slate-400">ID: #{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border capitalize ${getRoleColor(user.role)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50"></span>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => onEdit(user)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit User"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete User"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-16 text-center text-slate-400 italic">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;
