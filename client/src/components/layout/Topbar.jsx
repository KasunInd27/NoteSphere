import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import usePageStore from '@/store/usePageStore';
import { ModeToggle } from './ModeToggle';

const Topbar = () => {
    const { id } = useParams();
    const { pages } = usePageStore();

    // Find current page title for breadcrumbs (simple version)
    // A real breadcrumb would traverse up the parentId chain, but for now let's just show current title or "Dashboard"
    const currentPage = pages.find(p => p._id === id);

    return (
        <nav className="bg-background dark:bg-[#1F1F1F] px-4 py-2 border-b flex items-center gap-x-4 h-12 w-full">
            <div className="flex items-center gap-x-2 flex-1">
                {currentPage ? (
                    <div className="flex items-center text-sm font-medium">
                        <span className="text-muted-foreground mr-2">/</span>
                        {currentPage.icon && <span className="mr-2">{currentPage.icon}</span>}
                        <span>{currentPage.title}</span>
                    </div>
                ) : (
                    <div className="text-sm font-medium text-muted-foreground">Index</div>
                )}
            </div>

            <div className="flex items-center gap-x-2">
                <div className="text-xs text-muted-foreground">
                    {/* Status indicator can go here: "Saved" */}
                    Saved
                </div>
                <ModeToggle />
            </div>
        </nav>
    );
};

export default Topbar;
