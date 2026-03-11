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
                                    <div className="mt-1 flex items-center space-x-4">
                                        {(form.photo && (typeof form.photo === 'string' || form.photo instanceof File)) ? (
                                            <div className="relative group">
                                                <img
                                                    src={typeof form.photo === 'string'
                                                        ? `${BASE_URL.replace("/api", "")}${form.photo.startsWith('/') ? form.photo : '/' + form.photo}`
                                                        : URL.createObjectURL(form.photo)
                                                    }
                                                    alt="Preview"
                                                    className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-100 shadow-sm transition-transform group-hover:scale-105"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, photo: null })}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all font-sans cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setForm({ ...form, photo: e.target.files[0] });
                                                    }
                                                }}
                                            />
                                            <p className="mt-1 text-[10px] text-slate-400 font-normal">JPG, PNG or JPEG (Max 2MB)</p>
                                        </div>
                                    </div>
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
