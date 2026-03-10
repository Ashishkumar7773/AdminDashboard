import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees as fetchEmployeesAction } from "../redux/slices/employeeSlice";
import { logout } from "../redux/slices/authSlice";
import API from "../services/api";
import EmployeeTable from "../components/EmployeeTable";
import UserTable from "../components/UserTable";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { list: employees, total: totalRecords, pages: totalPages, currentPage: reduxPage, loading: employeesLoading } = useSelector(state => state.employees);
    const { user } = useSelector(state => state.auth);

    const [form, setForm] = useState({
        name: "",
        email: "",
        salary: "",
        department: "",
        role: "user", // Default for users
        password: "" // Optional for updates
    });
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("employees"); // 'employees' or 'admins'
    const [admins, setAdmins] = useState([]);
    const [editId, setEditId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "DESC" });
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalAdmins: 0,
        totalUsers: 0
    });
    const [localTotalRecords, setLocalTotalRecords] = useState(0);
    const [localTotalPages, setLocalTotalPages] = useState(1);

    const fetchStats = async () => {
        try {
            const res = await API.get("/auth/stats");
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats", err);
        }
    };
    const pageSize = 5;

    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const fetchEmployees = () => {
        dispatch(fetchEmployeesAction({
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
            department: selectedDept,
            status: selectedStatus
        }));
    };

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            // Map activeView to backend role filter
            const roleFilter = activeView === "admins" ? "Admin" : (activeView === "users" ? "user" : "");
            const res = await API.get(`/auth/users?page=${currentPage}&limit=${pageSize}&search=${searchTerm}&sortBy=${sortConfig.key}&order=${sortConfig.direction}&role=${roleFilter}`);
            setAdmins(res.data.users);
            setLocalTotalPages(res.data.pages);
            setLocalTotalRecords(res.data.total);
        } catch (err) {
            console.error("Error fetching admins", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        if (activeView === "employees") {
            fetchEmployees();
        } else {
            fetchAdmins();
        }
    }, [currentPage, searchTerm, activeView, sortConfig, selectedDept, selectedStatus]);

    const handleSort = (key) => {
        let direction = "ASC";
        if (sortConfig.key === key && sortConfig.direction === "ASC") {
            direction = "DESC";
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        const baseForm = {
            name: item.name,
            email: item.email,
        };

        if (activeView === "employees") {
            setForm({ ...baseForm, salary: item.salary, department: item.department, status: item.status || "Active", photo: null });
        } else {
            setForm({ ...baseForm, role: item.role, password: "" });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (activeView === "employees") {
                const formData = new FormData();
                formData.append("name", form.name);
                formData.append("email", form.email);
                formData.append("salary", form.salary);
                formData.append("department", form.department);
                formData.append("status", form.status);
                if (form.photo) {
                    formData.append("photo", form.photo);
                }

                if (editId) {
                    await API.put(`/employees/${editId}`, formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                    toast.success("Employee updated successfully!");
                } else {
                    await API.post("/employees", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                    toast.success("Employee added successfully!");
                }
                fetchEmployees();
                fetchStats();
            } else {
                if (editId) {
                    await API.put(`/auth/users/${editId}`, form);
                    toast.success("User updated successfully!");
                } else {
                    await API.post("/auth/register", form);
                    toast.success("User added successfully!");
                }
                fetchAdmins();
                fetchStats();
            }
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error processing request!");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowForm(false);
        setEditId(null);
        setForm({ name: "", email: "", salary: "", department: "", role: "user", password: "", status: "Active", photo: null });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-secondary text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        AdminPro
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => { setActiveView("employees"); closeModal(); }}
                        className={`flex items-center space-x-3 p-3 w-full rounded-lg transition-colors cursor-pointer ${activeView === "employees" ? "bg-primary/20 text-blue-400" : "hover:bg-white/5"}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-4.915" /></svg>
                        <span>Employees</span>
                    </button>
                    <button
                        onClick={() => { setActiveView("admins"); closeModal(); }}
                        className={`flex items-center space-x-3 p-3 w-full rounded-lg transition-colors cursor-pointer ${activeView === "admins" ? "bg-primary/20 text-blue-400" : "hover:bg-white/5"}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span>Admins</span>
                    </button>
                    <button
                        onClick={() => { setActiveView("users"); closeModal(); }}
                        className={`flex items-center space-x-3 p-3 w-full rounded-lg transition-colors cursor-pointer ${activeView === "users" ? "bg-primary/20 text-blue-400" : "hover:bg-white/5"}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>Users</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={handleLogout} className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-semibold text-slate-800">Overview</h2>
                            <p className="text-xs text-slate-500">Welcome, {user?.name || "Administrator"}</p>
                        </div>
                        <div className="flex-1 max-w-4xl mx-8 flex items-center space-x-4">
                            <div className="relative group flex-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder={`Search ${activeView}...`}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            {activeView === "employees" && (
                                <>
                                    <select
                                        className="h-10 pl-3 pr-8 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        value={selectedDept}
                                        onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="">All Departments</option>
                                        <option value="IT">IT</option>
                                        <option value="HR">HR</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                    <select
                                        className="h-10 pl-3 pr-8 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        value={selectedStatus}
                                        onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                </>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${showForm
                                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                                    : "bg-primary hover:bg-primary-dark text-white cursor-pointer"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showForm ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    )}
                                </svg>
                                <span>{showForm ? "Close Form" : `Add ${activeView === 'employees' ? 'Employee' : (activeView === 'admins' ? 'Admin' : 'User')}`}</span>
                            </button>
                            <span className="text-sm text-slate-500">Welcome, Administrator</span>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                            <h4 className="opacity-80 text-sm font-medium">Total Employees</h4>
                            <p className="text-4xl font-bold mt-2">{stats.totalEmployees}</p>
                        </div>
                        <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                            <h4 className="opacity-80 text-sm font-medium">System Admins</h4>
                            <p className="text-4xl font-bold mt-2">{stats.totalAdmins}</p>
                        </div>
                        <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                            <h4 className="opacity-80 text-sm font-medium">System Users</h4>
                            <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-2xl font-bold text-slate-800 capitalize">{activeView} List</h3>
                            <span className="text-slate-400 text-sm">
                                {activeView === "employees" ? totalRecords : localTotalRecords} total records
                            </span>
                        </div>
                        {/* Employee/Admin Table */}
                        <div className="card p-0 overflow-hidden">
                            {activeView === "employees" ? (
                                <EmployeeTable
                                    employees={employees}
                                    refresh={() => { fetchEmployees(); fetchStats(); }}
                                    onEdit={handleEdit}
                                    onSort={handleSort}
                                    sortConfig={sortConfig}
                                    currentUserRole={user?.role}
                                />
                            ) : (
                                <UserTable
                                    users={admins}
                                    refresh={() => { fetchAdmins(); fetchStats(); }}
                                    onEdit={handleEdit}
                                    onSort={handleSort}
                                    sortConfig={sortConfig}
                                    currentUserRole={user?.role}
                                />
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {(activeView === "employees" ? totalRecords : localTotalRecords) >= 5 && (
                            <div className="flex justify-between items-center mt-6">
                                <div className="text-sm text-slate-500">
                                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, activeView === "employees" ? totalRecords : localTotalRecords)} of {activeView === "employees" ? totalRecords : localTotalRecords} entries
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    {[...Array(activeView === "employees" ? totalPages : localTotalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${currentPage === i + 1 ? "bg-primary text-white" : "border border-slate-200 hover:bg-slate-50"}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, activeView === "employees" ? totalPages : localTotalPages))}
                                        disabled={currentPage === (activeView === "employees" ? totalPages : localTotalPages)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add/Edit Modal */}
                    {showForm && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={closeModal}
                        >
                            <div
                                className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-slate-800">
                                            {editId ? "Edit" : "Add New"} {activeView === 'employees' ? 'Employee' : (activeView === 'admins' ? 'Admin' : 'User')}
                                        </h3>
                                        <button
                                            onClick={closeModal}
                                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                            <input
                                                className="input-field w-full"
                                                placeholder="e.g. John Doe"
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                            <input
                                                className="input-field w-full"
                                                placeholder="john@example.com"
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>

                                        {activeView === "employees" ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                                                        <input
                                                            className="input-field w-full"
                                                            placeholder="50000"
                                                            type="number"
                                                            required
                                                            value={form.salary}
                                                            onChange={(e) => setForm({ ...form, salary: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                                        <input
                                                            className="input-field w-full"
                                                            placeholder="IT"
                                                            required
                                                            value={form.department}
                                                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                                    <select
                                                        className="input-field w-full"
                                                        value={form.status}
                                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                                    >
                                                        <option value="Active">Active</option>
                                                        <option value="Inactive">Inactive</option>
                                                        <option value="On Leave">On Leave</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo</label>
                                                    <input
                                                        type="file"
                                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                                                        onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                                    <select
                                                        className="input-field w-full"
                                                        value={form.role}
                                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="Editor">Editor</option>
                                                        <option value="Admin">Admin</option>
                                                        <option value="SuperAdmin">SuperAdmin</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                                        {editId ? "New Password (Optional)" : "Password"}
                                                    </label>
                                                    <input
                                                        className="input-field w-full"
                                                        placeholder="••••••••"
                                                        type="password"
                                                        required={!editId}
                                                        value={form.password}
                                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="pt-4 flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-[2] btn-primary py-3 rounded-xl font-bold"
                                            >
                                                {loading ? "Processing..." : editId ? "Update" : "Confirm Add"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
