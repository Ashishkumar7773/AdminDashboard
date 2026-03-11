import React, { memo, useCallback } from "react";
import { toast } from "react-toastify";
import apiService from "../services/apiService";

const UserTable = memo(({ users, refresh, onEdit, onSort, sortConfig, currentUserRole }) => {
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await apiService.deleteUser(id);
            toast.success("User deleted successfully!");
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error deleting user!");
        }
    }, [refresh]);

    const getRoleColor = (role) => {
        const r = role?.toLowerCase();
        const colors = {
            superadmin: "bg-red-50 text-red-700 border-red-200",
            admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
            editor: "bg-amber-50 text-amber-700 border-amber-200",
            user: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
        return colors[r] || "bg-slate-50 text-slate-500 border-slate-200";
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <SortHeader label="User Info" sortKey="name" onSort={onSort} sortConfig={sortConfig} />
                            <SortHeader label="Email" sortKey="email" onSort={onSort} sortConfig={sortConfig} />
                            <SortHeader label="Role" sortKey="role" onSort={onSort} sortConfig={sortConfig} />
                            <SortHeader label="Joined Date" sortKey="createdAt" onSort={onSort} sortConfig={sortConfig} />
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onEdit={onEdit}
                                    onDelete={handleDelete}
                                    currentUserRole={currentUserRole}
                                    getRoleColor={getRoleColor}
                                />
                            ))
                        ) : (
                            <EmptyState />
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

const SortHeader = ({ label, sortKey, onSort, sortConfig }) => {
    const isActive = sortConfig?.key === sortKey;
    return (
        <th
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center space-x-1">
                <span>{label}</span>
                {isActive ? (
                    sortConfig.direction === 'ASC' ? (
                        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                    ) : (
                        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    )
                ) : (
                    <svg className="w-3 h-3 text-slate-300 opacity-20 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                )}
            </div>
        </th>
    );
};

const UserRow = ({ user, onEdit, onDelete, currentUserRole, getRoleColor }) => {
    const canEdit = currentUserRole === "SuperAdmin" || (currentUserRole === "Admin" && user.role === "user");
    const canDelete = currentUserRole === "SuperAdmin";

    return (
        <tr className="group hover:bg-slate-50/80 transition-all duration-200 select-none">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform">
                        {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                        <div className="font-bold text-slate-900 leading-none mb-1">{user.name}</div>
                        <div className="text-xs text-slate-400">ID: #{user.id.toString().slice(-4)}</div>
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
            <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                        <button
                            onClick={() => onEdit(user)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                            title="Edit User"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => onDelete(user.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete User"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

const EmptyState = () => (
    <tr>
        <td colSpan="5" className="px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-4.915" /></svg>
                <h4 className="text-slate-900 font-semibold text-lg text-center">No users found.</h4>
            </div>
        </td>
    </tr>
);

export default UserTable;
