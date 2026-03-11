import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees as fetchEmployeesAction } from "../redux/slices/employeeSlice";
import { logout } from "../redux/slices/authSlice";
import apiService from "../services/apiService";
import EmployeeTable from "../components/EmployeeTable";
import UserTable from "../components/UserTable";
import DashboardStats from "../components/dashboard/DashboardStats";
import UserFormModal from "../components/dashboard/UserFormModal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: employees, total: totalRecords, pages: totalPages, loading: employeesLoading } = useSelector(state => state.employees);
    const { user } = useSelector(state => state.auth);

    const [form, setForm] = useState({
        name: "",
        email: "",
        salary: "",
        department: "",
        role: "user",
        password: "",
        status: "Active",
        photo: null
    });
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("employees"); // 'employees', 'admins', 'users'
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

    const pageSize = 5;

    const fetchStats = useCallback(async () => {
        try {
            const res = await apiService.getDashboardStats();
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats", err);
        }
    }, []);

    const fetchEmployees = useCallback(() => {
        dispatch(fetchEmployeesAction({
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
            department: selectedDept,
            status: selectedStatus
        }));
    }, [dispatch, currentPage, searchTerm, sortConfig, selectedDept, selectedStatus]);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const roleFilter = activeView === "admins" ? "Admin" : (activeView === "users" ? "user" : "");
            const res = await apiService.getUsers({
                page: currentPage,
                limit: pageSize,
                search: searchTerm,
                sortBy: sortConfig.key,
                order: sortConfig.direction,
                role: roleFilter
            });
            setAdmins(res.data.users);
            setLocalTotalPages(res.data.pages);
            setLocalTotalRecords(res.data.total);
        } catch (err) {
            console.error("Error fetching admins", err);
        } finally {
            setLoading(false);
        }
    }, [activeView, currentPage, searchTerm, sortConfig]);

    useEffect(() => {
        fetchStats();
        if (activeView === "employees") {
            fetchEmployees();
        } else {
            fetchAdmins();
        }
    }, [fetchStats, fetchEmployees, fetchAdmins, activeView]);

    const handleLogout = useCallback(() => {
        dispatch(logout());
        navigate("/login");
    }, [dispatch, navigate]);

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "ASC" ? "DESC" : "ASC"
        }));
        setCurrentPage(1);
    }, []);

    const closeModal = useCallback(() => {
        setShowForm(false);
        setEditId(null);
        setForm({
            name: "",
            email: "",
            salary: "",
            department: "",
            role: "user",
            password: "",
            status: "Active",
            photo: null
        });
    }, []);

    const handleEdit = useCallback((item) => {
        setEditId(item.id);
        const baseForm = {
            name: item.name,
            email: item.email,
        };

        if (activeView === "employees") {
            setForm({ ...baseForm, salary: item.salary, department: item.department, status: item.status || "Active", photo: item.photo });
        } else {
            setForm({ ...baseForm, role: item.role, password: "", status: "Active", photo: null });
        }
        setShowForm(true);
    }, [activeView]);

    const handleSubmit = useCallback(async (e) => {
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
                    await apiService.updateEmployee(editId, formData);
                    toast.success("Employee updated!");
                } else {
                    await apiService.createEmployee(formData);
                    toast.success("Employee added!");
                }
                fetchEmployees();
            } else {
                const payload = {
                    name: form.name,
                    email: form.email,
                    role: form.role,
                };
                if (form.password) payload.password = form.password;

                if (editId) {
                    await apiService.updateUser(editId, payload);
                    toast.success("User updated!");
                } else {
                    await apiService.register(payload);
                    toast.success("User added!");
                }
                fetchAdmins();
            }
            fetchStats();
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error processing request!");
        } finally {
            setLoading(false);
        }
    }, [activeView, editId, form, fetchEmployees, fetchAdmins, fetchStats, closeModal]);

    const totalDisplayRecords = useMemo(() =>
        activeView === "employees" ? totalRecords : localTotalRecords,
        [activeView, totalRecords, localTotalRecords]);

    const totalDisplayPages = useMemo(() =>
        activeView === "employees" ? totalPages : localTotalPages,
        [activeView, totalPages, localTotalPages]);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        AdminPro
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem
                        active={activeView === "employees"}
                        onClick={() => { setActiveView("employees"); closeModal(); }}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-4.915" /></svg>}
                        label="Employees"
                    />
                    {user?.role?.toLowerCase() === "superadmin" && (
                        <NavItem
                            active={activeView === "admins"}
                            onClick={() => { setActiveView("admins"); closeModal(); }}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                            label="Admins"
                        />
                    )}
                    <NavItem
                        active={activeView === "users"}
                        onClick={() => { setActiveView("users"); closeModal(); }}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                        label="Users"
                    />
                </nav>
                <div className="p-4 border-t border-slate-800">
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
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder={`Search ${activeView}...`}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            {activeView === "employees" && (
                                <div className="flex space-x-2">
                                    <FilterSelect
                                        value={selectedDept}
                                        onChange={(v) => { setSelectedDept(v); setCurrentPage(1); }}
                                        options={["IT", "HR", "Sales", "Marketing", "Finance"]}
                                        placeholder="All Departments"
                                    />
                                    <FilterSelect
                                        value={selectedStatus}
                                        onChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}
                                        options={["Active", "Inactive", "On Leave"]}
                                        placeholder="All Status"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${((activeView === 'admins' || activeView === 'users') && user?.role?.toLowerCase() !== 'superadmin' && !showForm) ? "hidden" : (showForm
                                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer shadow-md"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md"
                                )}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showForm ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    )}
                                </svg>
                                <span>{showForm ? "Close Form" : `Add ${activeView.slice(0, -1)}`}</span>
                            </button>
                            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm">
                                    {user?.name?.[0].toUpperCase() || "A"}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <DashboardStats stats={stats} />

                    <div className="grid grid-cols-1 gap-8">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 capitalize leading-none">{activeView} List</h3>
                                <p className="text-slate-500 text-sm mt-1">{totalDisplayRecords} total records found</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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

                        {totalDisplayRecords > pageSize && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalDisplayPages}
                                totalRecords={totalDisplayRecords}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>

                    <UserFormModal
                        showForm={showForm}
                        closeModal={closeModal}
                        editId={editId}
                        activeView={activeView}
                        form={form}
                        setForm={setForm}
                        handleSubmit={handleSubmit}
                        loading={loading}
                    />
                </div>
            </main>
        </div>
    );
};

// Helper Components
const NavItem = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 p-3 w-full rounded-xl transition-all cursor-pointer ${active ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const FilterSelect = ({ value, onChange, options, placeholder }) => (
    <select
        className="h-10 pl-3 pr-8 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
    >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);

const Pagination = ({ currentPage, totalPages, totalRecords, pageSize, onPageChange }) => (
    <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{((currentPage - 1) * pageSize) + 1}</span> to <span className="font-medium text-slate-700">{Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-medium text-slate-700">{totalRecords}</span> entries
        </div>
        <div className="flex space-x-1">
            <button
                onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i + 1}
                    onClick={() => onPageChange(i + 1)}
                    className={`min-w-[40px] h-10 rounded-lg transition-all font-medium ${currentPage === i + 1 ? "bg-indigo-600 text-white shadow-md" : "border border-slate-200 hover:bg-white text-slate-600"}`}
                >
                    {i + 1}
                </button>
            ))}
            <button
                onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    </div>
);

export default AdminDashboard;
