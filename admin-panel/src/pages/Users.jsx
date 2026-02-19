import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, Phone, User as UserIcon, Users as UsersIcon, Trash2, ShieldCheck, Search, SquarePen } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        phoneNumber: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            confirmPassword: '',
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (userId, username) => {
        if (window.confirm(`Permanently remove terminal access for "${username}"?`)) {
            const toastId = toast.loading('Removing user...');
            try {
                await api.delete(`/auth/users/${userId}`);
                setUsers(users.filter(u => u._id !== userId));
                toast.success('User removed from system', { id: toastId });
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.response?.data?.message || 'Removal failed', { id: toastId });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingUser) {
            if (formData.password && formData.password !== formData.confirmPassword) {
                return toast.error("Passwords do not match");
            }

            const toastId = toast.loading('Updating terminal...');
            try {
                const { confirmPassword, ...submitData } = formData;
                if (!submitData.password) delete submitData.password;

                const response = await api.put(`/auth/users/${editingUser._id}`, submitData);
                setUsers(users.map(u => u._id === editingUser._id ? response.data : u));
                setFormData({
                    username: '',
                    password: '',
                    confirmPassword: '',
                    name: '',
                    email: '',
                    phoneNumber: '',
                });
                setShowForm(false);
                setEditingUser(null);
                toast.success('Terminal updated successfully', { id: toastId });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Update failed', { id: toastId });
            }
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        const toastId = toast.loading('Registering terminal...');
        try {
            const { confirmPassword, ...submitData } = formData;
            const response = await api.post('/auth/users', submitData);
            setUsers([...users, response.data]);
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                name: '',
                email: '',
                phoneNumber: '',
            });
            setShowForm(false);
            toast.success('Terminal registered successfully', { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed', { id: toastId });
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">User Management</h1>
                        <div className="flex bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 items-center gap-2">
                            <UsersIcon size={14} className="text-indigo-400" />
                            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{users.length} Active</span>
                        </div>
                    </div>
                    <p className="text-slate-400 font-medium">Provision and manage secure access credentials for the mobile terminals.</p>
                </div>

                <button
                    onClick={() => {
                        if (showForm) {
                            setShowForm(false);
                            setEditingUser(null);
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className={`
                        flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-bold shadow-lg
                        ${showForm
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'}
                    `}
                >
                    {showForm ? (
                        <>Cancel Operation</>
                    ) : (
                        <>
                            <UserPlus size={18} />
                            Register Terminal
                        </>
                    )}
                </button>
            </header>

            {showForm && (
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="p-1 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-indigo-500/20" />
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-indigo-400" size={24} />
                            {editingUser ? `Update Terminal: ${editingUser.username}` : 'Terminal Provisioning'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Terminal ID</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        required
                                        name="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="terminal_01"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-200 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{editingUser ? 'New Access Key (Leave blank to keep)' : 'Access Key'}</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={18} />
                                    <input
                                        required={!editingUser}
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-slate-200 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Verify Access Key</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                    <input
                                        required={formData.password !== ''}
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-200 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name (Optional)</label>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Terminal Operator"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-200 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Reference</label>
                                <input
                                    name="phoneNumber"
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="+1 234 567 890"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-200 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2 flex items-end">
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-extrabold tracking-widest text-sm"
                                >
                                    {editingUser ? 'APPLY UPDATE' : 'PROVISION TERMINAL'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!editingUser && (
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
                    <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
                        <h2 className="text-lg font-bold text-slate-200 ml-2">Registered Terminals</h2>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-highlight transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Filter by Terminal ID or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-300 transition-all w-full md:w-80 font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/60">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">Terminal Interface</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">Authorization</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">Metadata</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">Registry Date</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-xs font-bold tracking-widest uppercase opacity-50">Fetching Registry Data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center opacity-40">
                                                <div className="bg-slate-800 p-4 rounded-full mb-4">
                                                    <Search size={32} />
                                                </div>
                                                <p className="text-sm font-bold tracking-widest uppercase">No Terminal Matches Found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-indigo-500/[0.03] transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-indigo-400 font-black border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-black text-slate-100 uppercase tracking-tight">{user.username}</div>
                                                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <UserIcon size={10} />
                                                        {user.name || 'ANONYMOUS UNIT'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${user.role === 'admin'
                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_-5px_#f59e0b]'
                                                : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {user.phoneNumber ? (
                                                    <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        {user.phoneNumber}
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] font-bold text-slate-600 uppercase italic">No Link</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-xs font-bold text-slate-400 font-mono">
                                                {new Date(user.createdAt).toISOString().split('T')[0].replace(/-/g, '.')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-slate-600 hover:text-indigo-400 transition-all p-2.5 hover:bg-indigo-500/10 rounded-xl"
                                                title="Edit Terminal"
                                            >
                                                <SquarePen size={20} />
                                            </button>
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(user._id, user.username)}
                                                    className="text-slate-600 hover:text-rose-500 transition-all p-2.5 hover:bg-rose-500/10 rounded-xl"
                                                    title="Revoke Access"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
