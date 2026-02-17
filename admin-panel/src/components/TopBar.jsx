import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Search, Moon, Sun, RefreshCw } from 'lucide-react';

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();
    const { refreshData, loading } = useData();
    const location = useLocation();

    const getTitle = (pathname) => {
        switch (pathname) {
            case '/': return 'Overview';
            case '/devices': return 'Devices';
            case '/settings': return 'Settings';
            default: return 'Dashboard';
        }
    };

    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-10 bg-app/50 backdrop-blur-md">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-main tracking-tight">{getTitle(location.pathname)}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-xl text-sub hover:text-main hover:bg-slate-500/10 transition-colors border border-transparent hover:border-theme/50"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-400" />}
                </button>

                {/* Vertical Divider */}
                <div className="h-8 w-[1px] bg-theme/50 mx-1"></div>

                {/* Search Bar */}
                <div className="relative hidden md:block group">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-main transition-colors" />
                    <input
                        type="text"
                        placeholder="Search intercepts..."
                        className="pl-10 pr-4 py-2.5 w-64 rounded-xl bg-white/5 border border-theme/50 text-sm text-main focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-sub/50"
                    />
                </div>

                {/* Refresh Button */}
                <button
                    onClick={() => refreshData()}
                    className="p-3 rounded-xl text-sub hover:text-main hover:bg-slate-500/10 transition-colors border border-transparent hover:border-theme/50"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin text-indigo-500' : ''} />
                </button>
            </div>
        </header>
    );
};

export default TopBar;
