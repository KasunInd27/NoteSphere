import React, { useEffect, useMemo } from 'react';
import { ChevronsLeft, MenuIcon, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import usePageStore from '@/store/usePageStore';
import SidebarItem from './SidebarItem';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';

// Recursive render helper
const renderTree = (pages, parentId = null, level = 0, expanded, toggleExpand) => {
    return pages
        .filter(page => page.parentId === parentId)
        .map(page => {
            const childPages = pages.filter(p => p.parentId === page._id);
            return (
                <div key={page._id}>
                    <SidebarItem
                        page={page}
                        level={level}
                        expanded={expanded}
                        onExpand={toggleExpand}
                    // We pass recursion manually here? 
                    // Actually SidebarItem's children logic above was incomplete.
                    // Let's fix SidebarItem to just be the row, and we render children here.
                    />
                    {expanded[page._id] && renderTree(pages, page._id, level + 1, expanded, toggleExpand)}
                </div>
            );
        });
};


const Sidebar = () => {
    const navigate = useNavigate();
    const { pages, fetchPages, createPage, expanded, toggleExpand, isLoading } = usePageStore();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const handleCreate = async () => {
        const newPage = await createPage();
        if (newPage) {
            navigate(`/pages/${newPage._id}`);
        }
    };

    return (
        <aside className="h-full bg-secondary/30 w-60 flex flex-col border-r group relative z-[99999]" style={{ height: '100vh' }}>
            {/* Header / User Profile */}
            <div className="p-3 pl-4 flex items-center gap-x-2 hover:bg-neutral-200/50 cursor-pointer transition">
                <div className="h-5 w-5 bg-primary/10 rounded items-center flex justify-center text-xs font-medium">
                    {user?.name?.[0]}
                </div>
                <span className="text-sm font-medium truncate">
                    {user?.name}'s Workspace
                </span>
            </div>

            {/* Quick Actions */}
            <div className="mt-2 text-muted-foreground px-3">
                {/* Search etc can go here */}
            </div>

            {/* Page Tree */}
            <div className="flex-1 overflow-y-auto mt-2">
                {isLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                ) : (
                    <>
                        {renderTree(pages, null, 0, expanded, toggleExpand)}

                        <div
                            onClick={handleCreate}
                            className="flex items-center gap-x-2 p-3 pl-4 text-sm font-medium text-muted-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            Add a page
                        </div>
                    </>
                )}
            </div>

            {/* Footer / Settings */}
            <div className="p-2 mt-auto">
                <div className="text-xs text-muted-foreground p-2">
                    NoteSphere v1.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
