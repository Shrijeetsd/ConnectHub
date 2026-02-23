import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Globe, RefreshCw, Send, Wifi, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Settings = () => {
    const { configUrl, updateConfig } = useData();
    const { user, logout } = useAuth();
    const [url, setUrl] = useState(configUrl);
    const [updating, setUpdating] = useState(false);

    // 2FA State
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [setupToken, setSetupToken] = useState('');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
    const [mfaLoading, setMfaLoading] = useState(false);

    // Sync local state when context updates (initial load)
    React.useEffect(() => {
        setUrl(configUrl);
    }, [configUrl]);

    const handleUpdate = async () => {
        setUpdating(true);
        await updateConfig(url);
        setUpdating(false);
    };

    const handleSetup2FA = async () => {
        setMfaLoading(true);
        try {
            const { data } = await api.post('/setup-2fa');
            setQrCodeUrl(data.qrCodeUrl);
            setShow2FASetup(true);
        } catch (err) {
            toast.error("Failed to start 2FA setup");
        } finally {
            setMfaLoading(false);
        }
    };

    const handleVerifySetup2FA = async () => {
        setMfaLoading(true);
        try {
            await api.post('/verify-setup-2fa', { token: setupToken });
            setTwoFactorEnabled(true);
            setShow2FASetup(false);
            toast.success("Google Authenticator enabled");
        } catch (err) {
            toast.error("Invalid code. Please try again.");
        } finally {
            setMfaLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm("Are you sure you want to disable Google Authentication? This reduces your account security.")) return;
        setMfaLoading(true);
        try {
            await api.post('/disable-2fa');
            setTwoFactorEnabled(false);
            toast.success("Google Authenticator disabled");
        } catch (err) {
            toast.error("Failed to disable 2FA");
        } finally {
            setMfaLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-2xl mx-auto w-full space-y-8"
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
                </div>
            </div>

            {/* Google Authentication Section */}
            <div className="theme-panel rounded-2xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-main tracking-tight">Google Authentication</h3>
                        <p className="text-sub mt-1 text-sm">Add an extra layer of security to your account.</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-sub border border-slate-500/20'}`}>
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                </div>

                <div className="space-y-6">
                    {!twoFactorEnabled && !show2FASetup && (
                        <button
                            onClick={handleSetup2FA}
                            disabled={mfaLoading}
                            className="w-full py-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 font-bold text-sm uppercase tracking-widest hover:bg-indigo-500/10 transition-all disabled:opacity-50"
                        >
                            Enable 2FA Verification
                        </button>
                    )}

                    {show2FASetup && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-6 bg-slate-500/5 p-6 rounded-2xl border border-theme/20"
                        >
                            <div className="flex flex-col items-center">
                                <p className="text-xs font-bold text-sub uppercase mb-4">Scan this QR code in Google Authenticator</p>
                                <div className="p-4 bg-white rounded-xl mb-6 shadow-inner">
                                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                </div>
                                <div className="w-full">
                                    <label className="block text-xs font-bold text-sub uppercase mb-3 text-center">Enter 6-digit verification code</label>
                                    <input
                                        value={setupToken}
                                        onChange={(e) => setSetupToken(e.target.value.replace(/\D/g, ''))}
                                        maxLength="6"
                                        className="block w-full py-4 rounded-xl text-xl text-center font-bold tracking-[0.5em] input-theme mb-4"
                                        placeholder="000000"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setShow2FASetup(false)}
                                            className="py-3 rounded-lg bg-slate-500/10 text-sub font-bold text-xs uppercase"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleVerifySetup2FA}
                                            disabled={mfaLoading || setupToken.length !== 6}
                                            className="py-3 rounded-lg bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-500 transition-colors disabled:opacity-50"
                                        >
                                            Verify & Enable
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {twoFactorEnabled && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
                                <ShieldCheck className="text-emerald-500" size={24} />
                                <p className="text-sm text-sub font-medium">Your account is protected with Google Authentication.</p>
                            </div>
                            <button
                                onClick={handleDisable2FA}
                                disabled={mfaLoading}
                                className="w-full py-4 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                                Disable 2FA Verification
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-bold text-sm uppercase tracking-widest active:scale-95"
                >
                    <LogOut size={18} />
                    Log Out Session
                </button>
            </div>
        </motion.div>
    );
};

export default Settings;
