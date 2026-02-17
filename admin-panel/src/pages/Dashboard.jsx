import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Smartphone, Settings, Search, RefreshCw,
    Send, ShieldCheck, Copy, Check, Terminal, Zap,
    Globe, Activity, ChevronLeft, ChevronRight, Wifi, Sun, Moon,
    Battery, Signal, Lock, Edit2, Save, X, MessageSquare, ArrowUpRight,
    Cpu, Server, Eye, EyeOff, Trash2, Download, CloudRain, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';

const LOGS_PER_PAGE = 8;

// --- Helper for formatting Device Names ---
const getDeviceDisplayName = (device) => {
    if (device.name && device.name.trim() !== '') return device.name;
    if (device.model && device.model !== 'Unknown Device' && device.model !== 'Android SDK built for x86' && device.model.trim() !== '') {
        return device.model;
    }
    const idSnippet = device.device_id ? device.device_id.slice(0, 4) : (device.id ? device.id.slice(0, 4) : '????');
    return `Unidentified Device (${idSnippet})`;
};

// --- Components ---

const BentoCard = ({ title, value, subtext, icon: Icon, color, size = "md", delay = 0, onClick }) => {
    const sizeClasses = {
        sm: "col-span-1 row-span-1",
        md: "col-span-1 md:col-span-2 row-span-1",
        lg: "col-span-1 md:col-span-2 row-span-2",
        xl: "col-span-1 md:col-span-4 row-span-2"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className={`${sizeClasses[size]} theme-panel rounded-2xl p-5 relative overflow-hidden group cursor-default transition-all border border-theme/50`}
        >
            <div className={`absolute top-0 right-0 p-24 bg-${color}-500/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-${color}-500/20`}></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500 ring-1 ring-${color}-500/20`}>
                        <Icon size={24} />
                    </div>
                    {onClick && <ArrowUpRight className="text-sub group-hover:text-main transition-colors" size={18} />}
                </div>

                <div className="mt-5">
                    <h3 className="text-3xl font-bold text-main tracking-tighter mb-1">{value}</h3>
                    <p className="text-sm font-medium text-sub">{title}</p>
                    {subtext && <p className="text-[10px] font-bold uppercase tracking-widest text-sub/70 mt-3 pt-3 border-t border-theme/30">{subtext}</p>}
                </div>
            </div>
        </motion.div>
    );
};

const RealisticPhone = ({ device, onRename, onClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(device.name || getDeviceDisplayName(device));

    const handleSave = (e) => {
        e.stopPropagation();
        onRename(device.device_id || device.id, newName);
        setIsEditing(false);
    };

    // Dynamic Online Status Logic (2 minutes threshold)
    const isOnline = useMemo(() => {
        if (!device.last_seen) return false;
        const lastSeenTime = new Date(device.last_seen).getTime();
        const currentTime = new Date().getTime();
        return (currentTime - lastSeenTime) < 2 * 60 * 1000; // 2 mins
    }, [device.last_seen]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            onClick={onClick}
            className="relative group cursor-pointer"
        >
            {/* Phone Body */}
            <div className={`relative w-[180px] h-[340px] bg-slate-900 rounded-[2.5rem] border-[6px] shadow-2xl overflow-hidden mx-auto transition-all duration-300 group-hover:shadow-indigo-500/20 ${isOnline ? 'border-slate-800 group-hover:border-indigo-600/50' : 'border-slate-800 opacity-80 grayscale-[0.5]'}`}>
                {/* Bezel Gradient */}
                <div className="absolute inset-0 border-2 border-slate-700/50 rounded-[2.2rem] pointer-events-none z-20"></div>

                {/* Dynamic Island / Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800/80"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-900/50"></div>
                </div>

                {/* Screen Content */}
                <div className="w-full h-full bg-slate-950 relative overflow-hidden flex flex-col">
                    {/* Wallpaper/Gradient */}
                    <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black z-0"></div>

                    {/* Status Bar */}
                    <div className="h-12 w-full flex justify-between items-center px-5 pt-3 relative z-10 text-[10px] font-medium text-white/70">
                        <span>{new Date(device.last_seen || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex gap-1.5 items-center">
                            <Signal size={10} className={isOnline ? "" : "text-white/30"} />
                            <Wifi size={10} className={isOnline ? "" : "text-white/30"} />
                            <Battery size={10} />
                        </div>
                    </div>

                    {/* Main Screen UI */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4 text-center mt-[-20px]">
                        <div className={`w-16 h-16 rounded-[1.2rem] shadow-lg mb-4 flex items-center justify-center text-white transition-colors ${isOnline ? 'bg-gradient-to-tr from-indigo-500 to-violet-500' : 'bg-slate-700'}`}>
                            {isOnline ? <Zap size={32} fill="white" /> : <CloudRain size={32} />}
                        </div>

                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-2 w-full" onClick={e => e.stopPropagation()}>
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-slate-800/80 text-white text-xs px-2 py-1 rounded border border-indigo-500 focus:outline-none"
                                    autoFocus
                                />
                                <button onClick={handleSave} className="p-1 bg-emerald-500 rounded text-white"><Save size={12} /></button>
                                <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="p-1 bg-slate-600 rounded text-white"><X size={12} /></button>
                            </div>
                        ) : (
                            <div className="group/name relative">
                                <h4 className="text-white font-bold text-base leading-tight mb-1 drop-shadow-md break-words w-full px-1">
                                    {getDeviceDisplayName(device)}
                                </h4>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                    className="absolute -right-6 top-0 opacity-0 group-hover/name:opacity-100 transition-opacity text-indigo-400 p-1 hover:bg-slate-800 rounded"
                                >
                                    <Edit2 size={12} />
                                </button>
                            </div>
                        )}

                        <div className={`flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full border backdrop-blur-md transition-colors ${isOnline ? 'bg-slate-800/50 border-white/10' : 'bg-rose-900/20 border-rose-500/20'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-rose-500'}`}></div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        <p className="text-[9px] text-slate-500 font-mono mt-4 uppercase tracking-widest">
                            ID: {(device.device_id || device.id).slice(0, 6)}
                        </p>
                    </div>

                    {/* Click CTA */}
                    <div className="mt-auto mb-6 relative z-10 w-full px-6">
                        <div className="w-full py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 text-[10px] uppercase font-bold text-white/70 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                            View Logs <ArrowUpRight size={10} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Badge */}
            {isOnline && (
                <div className="absolute -top-2 -right-2 z-40">
                    <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-900">
                        <Check size={14} strokeWidth={4} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const Dashboard = () => {
    const { theme, toggleTheme } = useTheme();
    const [smsLogs, setSmsLogs] = useState([]);
    const [devices, setDevices] = useState([]);
    const [configUrl, setConfigUrl] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');

    // Selection State
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [expandedLogId, setExpandedLogId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [updating, setUpdating] = useState(false);

    // Feature State
    const [lastLogId, setLastLogId] = useState(null);
    const [visibleSensitiveIds, setVisibleSensitiveIds] = useState(new Set());

    // --- Browser Notification Permission ---
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    // --- Masking Logic ---
    const maskContent = (text) => {
        // Mask OTPs (4-8 digits) and Account Numbers
        return text.replace(/\b\d{4,8}\b/g, '****');
    };

    const toggleSensitive = (e, id) => {
        e.stopPropagation();
        setVisibleSensitiveIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleExportCSV = () => {
        if (!selectedDevice || filteredLogs.length === 0) return;

        const headers = ['Sender', 'Message Body', 'Timestamp', 'SIM Info'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                `"${log.sender}"`,
                `"${log.message_body.replace(/"/g, '""')}"`,
                `"${new Date(log.timestamp).toISOString()}"`,
                `"${log.sim_info}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `logs_${selectedDevice.device_id}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    const handleClearLogs = async () => {
        if (!selectedDevice || !window.confirm(`Are you sure you want to DELETE ALL logs for ${getDeviceDisplayName(selectedDevice)}? This cannot be undone.`)) return;

        try {
            await api.delete(`/sms/${selectedDevice.device_id}`);
            toast.success("Logs cleared successfully");
            setSmsLogs(prev => prev.filter(log => log.device_id !== selectedDevice.device_id));
        } catch (err) {
            toast.error("Failed to clear logs");
        }
    };

    const fetchData = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            // Token is handled by api interceptor
            const [logsRes, devicesRes, configRes] = await Promise.all([
                api.get('/sms'),
                api.get('/device'),
                api.get('/config/WEBSITE_URL').catch(() => ({ data: { value: "" } }))
            ]);

            setSmsLogs(logsRes.data);
            setDevices(devicesRes.data);
            setConfigUrl(configRes.data.value || "");

            // Notification Logic
            const latestLogs = logsRes.data;
            if (latestLogs.length > 0) {
                const latestLog = latestLogs[0];
                if (lastLogId && latestLog._id !== lastLogId && !isBackground) {
                    // New message detected
                    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
                        const deviceName = getDeviceDisplayName(devicesRes.data.find(d => d.device_id === latestLog.device_id) || {});
                        new Notification(`New Message from ${deviceName}`, {
                            body: `${latestLog.sender}: ${latestLog.message_body}`,
                            icon: '/vite.svg'
                        });
                    }
                }
                setLastLogId(latestLog._id);
            }
        } catch (err) {
            console.error("Fetch error", err);
            if (!isBackground) toast.error("Failed to fetch data");
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 15000); // Global refresh every 15s

        // Faster polling for selected device logs
        let deviceInterval;
        if (selectedDevice) {
            deviceInterval = setInterval(() => fetchData(true), 5000); // 5s refresh for focused device
        }

        return () => {
            clearInterval(interval);
            if (deviceInterval) clearInterval(deviceInterval);
        };
    }, [selectedDevice]);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleUpdateConfig = async () => {
        setUpdating(true);
        try {
            await api.put('/config', { key: 'WEBSITE_URL', value: configUrl });
            toast.success("Synchronized successfully");
        } catch (err) {
            toast.error("Sync failed");
        } finally {
            setUpdating(false);
        }
    };

    const handleRenameDevice = async (deviceId, newName) => {
        try {
            await api.put(`/device/${deviceId}`, { name: newName });
            toast.success("Device renamed successfully");
            fetchData(true);
        } catch (err) {
            toast.error("Failed to rename device");
        }
    };

    // Filter Logs based on Search AND Selected Device
    const filteredLogs = useMemo(() => {
        let logs = smsLogs;

        // If viewing a specific device in Devices tab
        if (activeTab === 'Devices' && selectedDevice) {
            logs = logs.filter(log => log.device_id === selectedDevice.device_id);
        }

        return logs.filter(log =>
            log.sender.toLowerCase().includes(search.toLowerCase()) ||
            log.message_body.toLowerCase().includes(search.toLowerCase())
        );
    }, [smsLogs, search, activeTab, selectedDevice]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
        return filteredLogs.slice(startIndex, startIndex + LOGS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);

    const getDeviceNameForLog = (log) => {
        const device = devices.find(d => d.device_id === log.device_id);
        if (device) return getDeviceDisplayName(device);
        return log.device_model || 'Unknown Device';
    };

    return (
        <div className="flex h-screen overflow-hidden relative transition-colors duration-500 theme-bg text-main font-sans selection:bg-indigo-500/30">

            <div className="mesh-bg">
                <div className="mesh-blob blob-1"></div>
                <div className="mesh-blob blob-2"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-20 lg:w-64 border-r flex flex-col z-20 relative theme-panel transition-all shadow-xl">
                <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-theme/50 theme-panel-solid">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div className="hidden lg:block ml-4">
                        <h1 className="font-bold text-lg text-main tracking-tight leading-none">ConnectHub</h1>
                        <p className="text-[10px] font-bold text-sub uppercase tracking-widest mt-1">v2.0 Console</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    {[
                        { icon: LayoutDashboard, label: 'Overview' },
                        { icon: Smartphone, label: 'Devices' },
                        { icon: Settings, label: 'Settings' }
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => { setActiveTab(item.label); setCurrentPage(1); setSelectedDevice(null); }}
                            className={`w-full flex items-center p-3.5 rounded-xl transition-all nav-item ${activeTab === item.label ? 'active' : ''}`}
                        >
                            <item.icon size={20} className="shrink-0 z-10" />
                            <span className="hidden lg:block ml-3 text-sm font-medium z-10">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-theme/50 theme-panel-solid">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                        <span className="hidden lg:block text-xs font-bold text-sub uppercase tracking-widest">System Stable</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 z-10 relative">
                {/* Header */}
                <header className="h-24 px-10 flex items-center justify-between border-b border-theme/50 sticky top-0 z-30 theme-panel backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        {selectedDevice && activeTab === 'Devices' ? (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedDevice(null)}
                                    className="p-2 -ml-2 rounded-lg hover:bg-slate-500/10 text-sub hover:text-main transition-colors"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold text-main tracking-tight">{getDeviceDisplayName(selectedDevice)}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live Syncing</span>
                                        </div>
                                        <span className="text-xs font-mono text-sub uppercase ml-2">ID: {selectedDevice.device_id?.slice(0, 6)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <h2 className="text-3xl font-bold text-main tracking-tight">{activeTab}</h2>
                        )}
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <button onClick={toggleTheme} className="btn-icon w-10 h-10 rounded-xl">
                            {theme === 'light' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-400" />}
                        </button>

                        <div className="h-8 w-[1px] bg-slate-500/20 mx-1"></div>

                        <div className="relative group hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-highlight transition-colors" size={18} />
                            <input
                                placeholder="Search intercepts..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="pl-12 pr-4 py-3 w-64 md:w-80 rounded-xl text-sm focus:outline-none transition-all input-theme shadow-sm placeholder:text-slate-500 font-medium"
                            />
                        </div>
                        <button onClick={() => fetchData()} className="btn-icon w-12 h-12 rounded-xl">
                            <RefreshCw size={20} className={loading ? 'animate-spin text-highlight' : ''} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {/* --- OVERVIEW TAB: BENTO LAYOUT --- */}
                        {activeTab === 'Overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full content-start"
                            >
                                <BentoCard
                                    title="Active Nodes"
                                    value={devices.filter(d => (new Date().getTime() - new Date(d.last_seen).getTime()) < 2 * 60 * 1000).length}
                                    subtext="Live Grid Status"
                                    icon={Smartphone}
                                    color="emerald"
                                    size="md"
                                    delay={0.1}
                                />
                                <BentoCard
                                    title="Total Intercepts"
                                    value={smsLogs.length}
                                    subtext="Messages Captured"
                                    icon={MessageSquare}
                                    color="indigo"
                                    size="md"
                                    delay={0.2}
                                />
                                <BentoCard
                                    title="System Health"
                                    value="99.9%"
                                    icon={Activity}
                                    color="blue"
                                    size="md"
                                    delay={0.3}
                                />
                                <BentoCard
                                    title="Server Latency"
                                    value="24ms"
                                    icon={Server}
                                    color="violet"
                                    size="md"
                                    delay={0.4}
                                />
                                <div className="col-span-1 md:col-span-4 p-5 rounded-3xl theme-panel border border-theme/50 mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500"><Cpu size={24} /></div>
                                        <div>
                                            <h4 className="font-bold text-main">System Status Normal</h4>
                                            <p className="text-sm text-sub">All listeners active and logging.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => Toast.info("System Check: OK")} className="px-6 py-2 bg-slate-500/10 rounded-lg text-sm font-bold text-main hover:bg-slate-500/20 transition-colors">Run Diagnostics</button>
                                </div>
                            </motion.div>
                        )}

                        {/* --- DEVICES TAB: LIST & DETAIL VIEW --- */}
                        {activeTab === 'Devices' && (
                            !selectedDevice ? (
                                <motion.div
                                    key="device-list"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                                        {devices.length === 0 && !loading ? (
                                            <div className="col-span-full h-64 flex flex-col items-center justify-center text-sub/50 border-2 border-dashed border-theme/20 rounded-3xl bg-slate-500/5">
                                                <Smartphone size={48} className="mb-4 opacity-50" />
                                                <p className="text-lg font-bold">No connected devices</p>
                                                <p className="text-sm">Install the app on an Android device to start syncing.</p>
                                            </div>
                                        ) : (
                                            devices.map((device, idx) => (
                                                <RealisticPhone
                                                    key={device.device_id || idx}
                                                    device={device}
                                                    onRename={handleRenameDevice}
                                                    onClick={() => setSelectedDevice(device)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="device-detail"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col h-full space-y-6"
                                >
                                    {/* LOGS TABLE FOR SPECIFIC DEVICE */}
                                    <div className="flex-1 theme-panel rounded-2xl flex flex-col overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60"></div>

                                        <div className="px-8 py-5 border-b border-theme/50 flex justify-between items-center theme-panel-solid rounded-t-2xl">
                                            <h3 className="font-bold text-main">Device Logs</h3>
                                            <div className="flex items-center gap-3">
                                                <button onClick={handleExportCSV} className="btn-icon w-8 h-8 rounded-lg text-theme hover:bg-theme/10" title="Export CSV">
                                                    <Download size={16} />
                                                </button>
                                                <button onClick={handleClearLogs} className="btn-icon w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-500/10" title="Clear All Logs">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="h-4 w-[1px] bg-theme/20 mx-1"></div>
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{filteredLogs.length} Records</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                            {filteredLogs.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-sub opacity-50">
                                                    <MessageSquare size={48} className="mb-4" />
                                                    <p className="text-lg font-medium">No logs for this device yet.</p>
                                                </div>
                                            ) : (
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="text-[11px] font-extrabold uppercase tracking-widest sticky top-0 z-10 text-sub bg-slate-500/5 backdrop-blur-sm border-b border-theme/50">
                                                        <tr>
                                                            <th className="px-8 py-4 pl-10">Sender</th>
                                                            <th className="px-8 py-4 w-1/2">Decoded Payload</th>
                                                            <th className="px-8 py-4 text-right pr-10">Timestamp</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-500/10">
                                                        {paginatedLogs.map((log) => (
                                                            <React.Fragment key={log._id}>
                                                                <tr
                                                                    onClick={() => setExpandedLogId(expandedLogId === log._id ? null : log._id)}
                                                                    className={`group cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-l-indigo-500 hover:bg-slate-500/5 ${expandedLogId === log._id ? 'bg-indigo-500/5 border-l-indigo-500' : ''}`}
                                                                >
                                                                    <td className="px-8 py-5 pl-9">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-bold text-main group-hover:text-highlight transition-colors">{log.sender}</span>
                                                                            <span className="text-[10px] text-sub uppercase tracking-wider font-semibold mt-0.5">{log.sim_info || 'SIM 1'}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-5">
                                                                        <div className="flex items-start gap-3">
                                                                            <p className="text-sm text-sub group-hover:text-main truncate max-w-lg font-medium flex-1">
                                                                                {visibleSensitiveIds.has(log._id) ? log.message_body : maskContent(log.message_body)}
                                                                            </p>
                                                                            <button
                                                                                onClick={(e) => toggleSensitive(e, log._id)}
                                                                                className="text-sub hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                                            >
                                                                                {visibleSensitiveIds.has(log._id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-5 text-right pr-10">
                                                                        <span className="text-xs font-mono text-sub bg-slate-500/10 px-2 py-1 rounded">
                                                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                                {expandedLogId === log._id && (
                                                                    <tr>
                                                                        <td colSpan="3" className="p-0 border-none">
                                                                            <motion.div
                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                className="bg-slate-900/40 border-y border-theme/50 shadow-inner overflow-hidden backdrop-blur-sm"
                                                                            >
                                                                                <div className="p-8">
                                                                                    <div className="flex justify-between items-center mb-4">
                                                                                        <h4 className="text-xs font-bold text-highlight uppercase tracking-widest">Full Message</h4>
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); handleCopy(log.message_body, log._id); }}
                                                                                            className="btn-icon px-3 py-1 text-xs font-bold gap-2"
                                                                                        >
                                                                                            {copiedId === log._id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                                                            {copiedId === log._id ? 'Copied' : 'Copy'}
                                                                                        </button>
                                                                                    </div>
                                                                                    <p className="bg-slate-500/5 p-4 rounded-xl border border-slate-500/10 text-main font-mono text-sm whitespace-pre-wrap">{log.message_body}</p>
                                                                                </div>
                                                                            </motion.div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>

                                        {/* Pagination Footer */}
                                        <div className="h-20 border-t border-theme/50 px-8 flex items-center justify-between theme-panel-solid z-20">
                                            <span className="text-xs font-bold text-sub">Page {currentPage} of {totalPages || 1}</span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-icon w-9 h-9 disabled:opacity-30"><ChevronLeft size={18} /></button>
                                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="btn-icon w-9 h-9 disabled:opacity-30"><ChevronRight size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        )}

                        {activeTab === 'Settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="max-w-2xl mx-auto pt-10 w-full"
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
                                                    value={configUrl}
                                                    onChange={(e) => setConfigUrl(e.target.value)}
                                                    className="block w-full pl-14 pr-5 py-5 rounded-xl text-lg text-main font-medium placeholder-slate-500 focus:outline-none transition-all shadow-inner input-theme"
                                                    placeholder="https://example.com/api/webhook"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleUpdateConfig}
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
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
