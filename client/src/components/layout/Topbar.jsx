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
        <nav className="bg-background/80 dark:bg-[#1F1F1F] backdrop-blur-sm px-4 py-2 w-full h-14 flex items-center gap-x-4 border-b border-border/40 sticky top-0 z-40">
            <div className="flex items-center gap-x-2 flex-1 min-w-0">
                {/* Mobile menu trigger could go here */}

                {currentPage ? (
                    <div className="flex items-center text-sm">
                        {/* Fake breadcrumb path for visual */}
                        <span className="text-muted-foreground px-1">/</span>
                        <div className="flex items-center gap-x-1.5 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors cursor-pointer min-w-0">
                            {currentPage.icon && <span className="text-base leading-none">{currentPage.icon}</span>}
                            <span className="font-medium truncate text-foreground">{currentPage.title}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center text-sm font-medium text-muted-foreground/80 px-2">Dashboard</div>
                )}
            </div>

            <div className="flex items-center gap-x-3">
                {/* Status or Last Edited */}
                <div className="flex items-center gap-x-1 text-xs text-muted-foreground/60 hidden sm:flex">
                    {currentPage && <span>Edited just now</span>}
                </div>

                {/* Divider */}
                <div className="h-4 w-[1px] bg-border mx-1" />

                <div className="flex items-center gap-x-2">
                    {/* Share/Star Buttons can go here */}
                    <ModeToggle />
                </div>
            </div>
        </nav>
    );
};

export default Topbar;
