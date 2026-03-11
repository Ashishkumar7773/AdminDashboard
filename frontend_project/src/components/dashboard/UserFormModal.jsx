import React from "react";

const UserFormModal = ({
    showForm,
    closeModal,
    editId,
    activeView,
    form,
    setForm,
    handleSubmit,
    loading
}) => {
    if (!showForm) return null;

    return (
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
                                className="input-field w-full px-4 py-2 border border-slate-200 rounded-xl"
                                placeholder="e.g. John Doe"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                className="input-field w-full px-4 py-2 border border-slate-200 rounded-xl"
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
                                            className="input-field w-full px-4 py-2 border border-slate-200 rounded-xl"
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
                                            className="input-field w-full px-4 py-2 border border-slate-200 rounded-xl"
                                            placeholder="IT"
                                            required
                                            value={form.department}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                                setForm({ ...form, department: value });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        className="input-field w-full px-4 py-2 border border-slate-200 rounded-xl"
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
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all font-sans"
                                        onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select
                                        className="input-field w-full px-4 py-2 border border-slate-200 rounded-xl"
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
                                        className="input-field w-full px-4 py-2 border border-slate-200 rounded-xl"
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
                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors cursor-pointer"
                            >
                                {loading ? "Processing..." : editId ? "Update" : "Confirm Add"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserFormModal;
