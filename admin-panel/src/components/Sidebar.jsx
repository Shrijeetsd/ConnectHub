import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Smartphone, Settings, Zap, Users
} from 'lucide-react';

const Sidebar = () => {

    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/devices', label: 'Devices', icon: Smartphone },
        { path: '/users', label: 'Users', icon: Users },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-20 lg:w-64 border-r flex flex-col z-20 relative theme-panel transition-all shadow-xl h-full">
            {/* Logo Section */}
            <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-theme/50 theme-panel-solid">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-lg shrink-0 overflow-hidden border border-theme/20">
                    <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
                </div>

                <div className="hidden lg:block ml-4">
                    <h1 className="font-bold text-lg text-main tracking-tight leading-none">ConnectHub</h1>
                    <p className="text-[10px] font-bold text-sub uppercase tracking-widest mt-1">v2.0 Console</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => `
                            w-full flex items-center p-3.5 rounded-xl transition-all nav-item
                            ${isActive
                                ? 'active bg-indigo-500/10 text-text-accent font-semibold'
                                : 'text-sub hover:text-main hover:bg-slate-500/10'}
                        `}
                    >
                        <item.icon size={20} className="shrink-0 z-10" />
                        <span className="hidden lg:block ml-3 text-sm font-medium z-10">{item.label}</span>
                    </NavLink>
                ))}
            </nav>



            <div className="p-4 theme-panel-solid border-t border-theme/50">
                <div className="hidden lg:flex flex-wrap gap-x-3 gap-y-1 mb-4 opacity-50 hover:opacity-100 transition-opacity">
                    <NavLink to="/privacy-policy" className="text-[10px] font-bold text-sub hover:text-highlight transition-colors">Privacy</NavLink>
                    <NavLink to="/terms-of-service" className="text-[10px] font-bold text-sub hover:text-highlight transition-colors">Terms</NavLink>
                    <span className="text-[10px] text-sub">© 2026</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                    <span className="hidden lg:block text-xs font-bold text-sub uppercase tracking-widest">System Stable</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
