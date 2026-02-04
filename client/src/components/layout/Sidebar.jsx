import React, { useEffect } from "react";
import { Plus, Settings } from "lucide-react";
import usePageStore from "@/store/usePageStore";
import SidebarItem from "./SidebarItem";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import AvatarUpload from "@/components/common/AvatarUpload";

// Recursive render helper
const renderTree = (pages, parentId = null, level = 0, expanded, toggleExpand) => {
    return pages
        .filter((page) => page.parentId === parentId)
        .map((page) => (
            <div key={page._id}>
                <SidebarItem page={page} level={level} expanded={expanded} onExpand={toggleExpand} />
                {expanded?.[page._id] && renderTree(pages, page._id, level + 1, expanded, toggleExpand)}
            </div>
        ));
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
        if (newPage) navigate(`/pages/${newPage._id}`);
    };

    return (
        <aside className="group/sidebar hidden md:flex h-full w-64 shrink-0 flex-col border-r border-border/40 bg-[#F7F7F5] dark:bg-[#202020] relative z-[40]">
            {/* Header / User Profile */}
            <div className="px-3 pt-3 pb-2">
                <div
                    role="button"
                    className="flex items-center gap-x-3 w-full p-2 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                    <AvatarUpload className="h-9 w-9 shrink-0 rounded-full shadow-sm" />

                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold truncate text-foreground leading-tight">
                            {user?.name ? `${user.name}'s Sphere` : "My Workspace"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate leading-tight opacity-80">
                            Free Plan
                        </span>
                    </div>

                    <div className="opacity-0 group-hover/sidebar:opacity-100 transition">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* Quick Actions (Search, etc) */}
            <div className="px-3 mb-3">
                <div
                    onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                    className="group flex items-center gap-x-2 px-2 py-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-sm font-medium text-muted-foreground cursor-pointer"
                >
                    <span className="flex items-center justify-center p-0.5 rounded bg-muted border ml-1 text-xs">
                        ⌘K
                    </span>
                    <span>Search</span>
                </div>
            </div>

            {/* Page Tree */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                <div className="text-xs font-semibold text-muted-foreground/50 px-3 py-1 mb-1">
                    Private
                </div>

                {isLoading ? (
                    <div className="px-4 py-2 text-sm text-muted-foreground">Loading pages...</div>
                ) : (
                    <div className="space-y-0.5">
                        {renderTree(pages, null, 0, expanded, toggleExpand)}

                        <div
                            onClick={handleCreate}
                            className="group flex items-center gap-x-2 p-2 pl-3 text-sm text-muted-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800 cursor-pointer rounded-sm mt-2 opacity-70 hover:opacity-100"
                        >
                            <div className="h-5 w-5 flex items-center justify-center rounded-sm bg-background/50 group-hover:bg-background border border-transparent group-hover:border-border transition">
                                <Plus className="h-3 w-3" />
                            </div>
                            <span>Add a page</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Resizer handle (visual only) */}
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0" />
        </aside>
    );
};

export default Sidebar;
