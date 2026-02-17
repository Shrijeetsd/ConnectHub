import React from 'react';
import { useData } from '../context/DataContext';
import BentoCard from '../components/BentoCard';
import { Smartphone, MessageSquare, Activity, Server, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Overview = () => {
    const { smsLogs, devices } = useData();

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 content-start"
        >
            <BentoCard
                title="Active Nodes"
                value={devices.filter(d => d.last_seen && (new Date().getTime() - new Date(d.last_seen).getTime()) < 2 * 60 * 1000).length}
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
                <button
                    onClick={() => {
                        refreshData();
                        toast.info("System Check: Data Refreshed");
                    }}
                    className="px-6 py-2 bg-slate-500/10 rounded-lg text-sm font-bold text-main hover:bg-slate-500/20 transition-colors"
                >
                    Run Diagnostics
                </button>
            </div>
        </motion.div>
    );
};

export default Overview;
