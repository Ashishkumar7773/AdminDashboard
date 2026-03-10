import React from "react";
import { useDispatch } from "react-redux";
import { fetchEmployees } from "../redux/slices/employeeSlice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import API, { BASE_URL } from "../services/api";

const EmployeeTable = ({ employees, refresh, onEdit, onSort, sortConfig, queryParams, loading, currentUserRole }) => {
    const dispatch = useDispatch();

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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return;
        try {
            await API.delete(`/employees/${id}`);
            // Trigger refresh via Redux
            dispatch(fetchEmployees(queryParams));
            if (refresh) refresh();
            toast.success("Employee deleted successfully!");
        } catch (err) {
            toast.error("Only Admin can delete!");
        }
    };

    const getDeptColor = (dept) => {
        const d = dept?.toUpperCase();
        const colors = {
            IT: "bg-blue-100 text-blue-700 border-blue-200",
            HR: "bg-purple-100 text-purple-700 border-purple-200",
            SALES: "bg-green-100 text-green-700 border-green-200",
            MARKETING: "bg-pink-100 text-pink-700 border-pink-200",
            FINANCE: "bg-amber-100 text-amber-700 border-amber-200",
            OPERATIONS: "bg-cyan-100 text-cyan-700 border-cyan-200",
            SUPPORT: "bg-teal-100 text-teal-700 border-teal-200",
            DESIGN: "bg-rose-100 text-rose-700 border-rose-200",
            ADMIN: "bg-indigo-600 text-white border-indigo-700 shadow-sm",
            USER: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
        return colors[d] || "bg-slate-100 text-slate-700 border-slate-200";
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <SortHeader label="Employee" sortKey="name" />
                            <SortHeader label="Email" sortKey="email" />
                            <SortHeader label="Department" sortKey="department" />
                            <SortHeader label="Salary" sortKey="salary" />
                            <SortHeader label="Status" sortKey="status" />
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><Skeleton height={40} width={150} /></td>
                                    <td className="px-6 py-4"><Skeleton height={20} width={200} /></td>
                                    <td className="px-6 py-4"><Skeleton height={25} width={100} /></td>
                                    <td className="px-6 py-4"><Skeleton height={20} width={80} /></td>
                                    <td className="px-6 py-4"><Skeleton height={25} width={80} /></td>
                                    <td className="px-6 py-4 text-right"><Skeleton height={30} width={80} /></td>
                                </tr>
                            ))
                        ) : employees.length > 0 ? (
                            employees.map((emp) => (
                                <tr key={emp.id} className="group hover:bg-slate-50/80 transition-all duration-200 cursor-pointer select-none">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {emp.photo ? (
                                                <img src={`${BASE_URL.replace("/api", "")}${emp.photo}`} alt={emp.name} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-primary/10 group-hover:scale-110 transition-transform" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
                                                    {emp.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="ml-4">
                                                <div className="font-bold text-slate-900 leading-none mb-1">{emp.name}</div>
                                                <div className="text-xs text-slate-400">ID: #{emp.id.toString().slice(-4)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{emp.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getDeptColor(emp.department)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50"></span>
                                            {emp.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-700">
                                            ${Number(emp.salary).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            emp.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => onEdit(emp)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit Employee"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            {currentUserRole === "SuperAdmin" && (
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Employee"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-4.915" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-slate-900 font-semibold italic text-lg opacity-40">No employees yet</h4>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeTable;