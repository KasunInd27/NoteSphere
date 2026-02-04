import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useSocketStore from '@/store/useSocketStore';

const Layout = () => {
    const { connect, disconnect } = useSocketStore();

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return (
        <div className="h-full flex dark:bg-[#191919] bg-white">
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden flex flex-col relative min-w-0">
                <Topbar />
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
