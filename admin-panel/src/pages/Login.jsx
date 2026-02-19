import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await login(username, password);
            if (data.role !== 'admin') {
                setError('Access denied. Only administrators can access this portal.');
                logout();
                return;
            }
            navigate('/');
        } catch (err) {
            console.error(err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.status === 401) {
                    setError('Invalid username or password');
                } else if (err.response.status === 403) {
                    setError('Access denied');
                } else {
                    setError(`Server Error: ${err.response.status} - ${err.response.data?.message || err.message}`);
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError('No response from server. Check internet connection or server status.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen theme-bg text-main font-sans overflow-hidden transition-colors duration-500">
            {/* Animated Mesh Background */}
            <div className="mesh-bg">
                <div className="mesh-blob blob-1"></div>
                <div className="mesh-blob blob-2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md theme-panel rounded-2xl p-8 md:p-12 relative z-10 backdrop-blur-xl shadow-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-6 overflow-hidden border-2 border-slate-100/50 p-3">
                        <img
                            src={logo}
                            alt="ConnectHub Logo"
                            className="w-full h-full object-contain pointer-events-none"
                        />
                    </div>
                    <h2 className="text-3xl font-extrabold text-main tracking-tight">Welcome to ConnectHub</h2>
                    <p className="text-sub mt-2 font-medium">ConnectHub Dashboard Access</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm font-semibold border border-red-500/20 flex items-center gap-2"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block mr-2" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2 ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sub group-focus-within:text-highlight transition-colors" />
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-3.5 rounded-xl text-main placeholder-slate-500 focus:outline-none transition-all font-medium input-theme shadow-sm"
                                placeholder="Enter your ID"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sub group-focus-within:text-highlight transition-colors" />
                            <input
                                type="password"
                                className="block w-full pl-12 pr-4 py-3.5 rounded-xl text-main placeholder-slate-500 focus:outline-none transition-all font-medium input-theme shadow-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="mt-8 pt-6 border-t border-theme/50 text-center space-y-4">
                        <p className="text-xs text-sub font-medium uppercase tracking-widest opacity-60">Secured by End-to-End Encryption</p>
                        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-sub">
                            <button
                                type="button"
                                onClick={() => navigate('/privacy-policy')}
                                className="hover:text-highlight transition-colors"
                            >
                                Privacy Policy
                            </button>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <button
                                type="button"
                                onClick={() => navigate('/terms-of-service')}
                                className="hover:text-highlight transition-colors"
                            >
                                Terms of Service
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
