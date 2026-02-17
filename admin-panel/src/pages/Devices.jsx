import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import RealisticPhone from '../components/RealisticPhone';
import { decryptMessage } from '../utils/crypto';
import {
    Download, Trash2, MessageSquare, Eye, EyeOff, Check, Copy, ChevronLeft, ChevronRight, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LOGS_PER_PAGE = 8;

const Devices = () => {
    const { devices, smsLogs, renameDevice, clearLogs, refreshData, loading } = useData();
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedLogId, setExpandedLogId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [visibleSensitiveIds, setVisibleSensitiveIds] = useState(new Set());

    // Faster polling for selected device logs
    useEffect(() => {
        let deviceInterval;
        if (selectedDevice) {
            deviceInterval = setInterval(() => refreshData(), 5000); // 5s refresh for focused device
        }
        return () => {
            if (deviceInterval) clearInterval(deviceInterval);
        };
    }, [selectedDevice, refreshData]);

    // Cleanup selection if device disappears (optional, but good practice)
    useEffect(() => {
        if (selectedDevice && !devices.find(d => d.device_id === selectedDevice.device_id)) {
            // Keep selected but maybe show offline status - logic handled in RealisticPhone
        }
    }, [devices, selectedDevice]);

    const maskContent = (text) => {
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

    const filteredLogs = useMemo(() => {
        let logs = smsLogs;
        if (selectedDevice) {
            logs = logs.filter(log => log.device_id === selectedDevice.device_id);
        }
        return logs.filter(log =>
            log.sender.toLowerCase().includes(search.toLowerCase()) ||
            log.message_body.toLowerCase().includes(search.toLowerCase())
        );
    }, [smsLogs, search, selectedDevice]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
        return filteredLogs.slice(startIndex, startIndex + LOGS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleExportCSV = () => {
        if (!selectedDevice || filteredLogs.length === 0) return;

        const headers = ['Sender', 'Message Body', 'Timestamp', 'SIM Info'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                `"${log.sender}"`,
                `"${decryptMessage(log.message_body, log.iv).replace(/"/g, '""')}"`,
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

    const handleClearLogsWrapper = () => {
        if (!selectedDevice || !window.confirm(`Are you sure you want to DELETE ALL logs for this device?`)) return;
        clearLogs(selectedDevice.device_id);
    };

    const getDeviceDisplayName = (device) => {
        if (device.name && device.name.trim() !== '') return device.name;
        if (device.model && device.model !== 'Unknown Device') return device.model;
        return `Unidentified Device (${device.device_id?.slice(0, 4)})`;
    };

    return (
        <AnimatePresence mode="wait">
            {!selectedDevice ? (
                <motion.div
                    key="device-list"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2 h-full"
                >
                    {/* Header for Filter/Search if needed, but Navbar manages global search? 
                        Wait, search state is local here. Navbar might need to update search in context?
                        For now, I'll add a local search bar if global isn't available, or assume global search is meant to replace this.
                        The previous dashboard had search in Header.
                        If I use separate pages, where is the Search Bar?
                        The user asked for Navbar to stay at top. Navbar has Search.
                        I should probably move `search` state to Context if I want Navbar search to work on this page.
                        OR, I can add a local search bar here for functionality.
                        Let's add a local "Filter Logs" input inside the Detail View, and maybe a "Search Devices" input in List view.
                     */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-20">
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
                                    onRename={renameDevice}
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
                    <div className="flex items-center gap-4 mb-4">
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

                    {/* LOGS TABLE */}
                    <div className="flex-1 theme-panel rounded-2xl flex flex-col overflow-hidden relative min-h-[500px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60"></div>

                        <div className="px-8 py-5 border-b border-theme/50 flex justify-between items-center theme-panel-solid rounded-t-2xl">
                            <div className="flex items-center gap-4">
                                <h3 className="font-bold text-main">Device Logs</h3>
                                <input
                                    placeholder="Search logs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-slate-500/5 border border-theme/20 rounded-lg px-3 py-1 text-xs text-main focus:outline-none focus:border-indigo-500 transition-colors w-48"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleExportCSV} className="btn-icon w-8 h-8 rounded-lg text-theme hover:bg-theme/10" title="Export CSV">
                                    <Download size={16} />
                                </button>
                                <button onClick={handleClearLogsWrapper} className="btn-icon w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-500/10" title="Clear All Logs">
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
                                    <p className="text-lg font-medium">No logs found.</p>
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
                                                                {visibleSensitiveIds.has(log._id)
                                                                    ? decryptMessage(log.message_body, log.iv)
                                                                    : maskContent(decryptMessage(log.message_body, log.iv))}
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
                                                                    <p className="bg-slate-500/5 p-4 rounded-xl border border-slate-500/10 text-main font-mono text-sm whitespace-pre-wrap">
                                                                        {decryptMessage(log.message_body, log.iv)}
                                                                    </p>
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
            )}
        </AnimatePresence>
    );
};

export default Devices;
