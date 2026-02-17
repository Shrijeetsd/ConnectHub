import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Signal, Wifi, Battery, Zap, CloudRain, Save, X, Edit2, ArrowUpRight, Check } from 'lucide-react';

const getDeviceDisplayName = (device) => {
    if (device.name && device.name.trim() !== '') return device.name;
    if (device.model && device.model !== 'Unknown Device' && device.model !== 'Android SDK built for x86' && device.model.trim() !== '') {
        return device.model;
    }
    const idSnippet = device.device_id ? device.device_id.slice(0, 4) : (device.id ? device.id.slice(0, 4) : '????');
    return `Unidentified Device (${idSnippet})`;
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

export default RealisticPhone;
