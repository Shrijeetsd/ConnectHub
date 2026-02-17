import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

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

export default BentoCard;
