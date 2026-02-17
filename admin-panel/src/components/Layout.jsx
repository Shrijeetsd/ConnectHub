import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
    return (
        <div className="h-screen overflow-hidden relative transition-colors duration-500 theme-bg text-main font-sans selection:bg-indigo-500/30 flex">
            <div className="mesh-bg">
                <div className="mesh-blob blob-1"></div>
                <div className="mesh-blob blob-2"></div>
            </div>

            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                <TopBar />
                <main className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 pt-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
