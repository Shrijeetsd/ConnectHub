import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Globe, RefreshCw, Send, Wifi, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
    const { configUrl, updateConfig } = useData();
    const { logout } = useAuth();
    const [url, setUrl] = useState(configUrl);
    const [updating, setUpdating] = useState(false);

    // Sync local state when context updates (initial load)
    React.useEffect(() => {
        setUrl(configUrl);
    }, [configUrl]);

    const handleUpdate = async () => {
        setUpdating(true);
        await updateConfig(url);
        setUpdating(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-2xl mx-auto w-full"
        >
            <div className="theme-panel rounded-2xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="flex flex-col items-center mb-10 text-center relative z-10">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6 bg-gradient-to-br from-indigo-500 to-violet-500 ring-4 ring-slate-500/10">
                        <Wifi size={36} />
                    </div>
                    <h3 className="text-3xl font-bold text-main tracking-tight">System Configuration</h3>
                    <p className="text-sub mt-2 font-medium">Manage global variables and remote directives.</p>
                </div>

                <div className="space-y-8 relative z-10">
                    <div>
                        <label className="block text-xs font-bold text-highlight uppercase tracking-[0.2em] mb-3 ml-1">Redirection Endpoint</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Globe size={18} className="text-sub group-focus-within:text-highlight transition-colors" />
                            </div>
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="block w-full pl-14 pr-5 py-5 rounded-xl text-lg text-main font-medium placeholder-slate-500 focus:outline-none transition-all shadow-inner input-theme"
                                placeholder="https://example.com/api/webhook"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 rounded-xl text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {updating ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                        {updating ? 'Pushing Configuration...' : 'Deploy Updates'}
                    </button>

                    <div className="bg-slate-500/5 rounded-lg p-4 text-center border border-slate-500/10">
                        <p className="text-xs text-sub font-medium">
                            Updates propagate to all connected nodes within the next heartbeat cycle (approx. 30s).
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-500/10">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-bold text-sm uppercase tracking-widest active:scale-95"
                        >
                            <LogOut size={18} />
                            Log Out Session
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
