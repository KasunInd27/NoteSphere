import React, { useEffect, useState, useMemo } from "react";
import { Plus, Settings, ChevronRight, ChevronDown, Star, Clock } from "lucide-react";
import usePageStore from "@/store/usePageStore";
import SidebarItem from "./SidebarItem";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import AvatarUpload from "@/components/common/AvatarUpload";
import { cn } from "@/lib/utils";

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
    const {
        pages,
        fetchPages,
        createPage,
        expanded,
        toggleExpand,
        isLoading,
        favoritePages,
        recentPages,
        fetchFavorites,
        fetchRecentPages
    } = usePageStore();
    const { user } = useAuthStore();

    // Manage expanded sections
    const [expandedSections, setExpandedSections] = useState({
        favorites: true,
        recent: true
    });

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Deduplicate favorites and recents by _id to prevent duplicate React keys
    const uniqueFavorites = useMemo(() => {
        const seen = new Map();
        favoritePages.forEach(page => {
            if (page._id && !seen.has(page._id)) {
                seen.set(page._id, page);
            }
        });
        return Array.from(seen.values());
    }, [favoritePages]);

    const uniqueRecents = useMemo(() => {
        const seen = new Map();
        recentPages.forEach(page => {
            if (page._id && !seen.has(page._id)) {
                seen.set(page._id, page);
            }
        });
        return Array.from(seen.values());
    }, [recentPages]);

    useEffect(() => {
        fetchPages();
        fetchFavorites();
        fetchRecentPages();
    }, [fetchPages, fetchFavorites, fetchRecentPages]);

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
                {/* Favorites */}
                <div>
                    <button
                        onClick={() => toggleSection('favorites')}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {expandedSections.favorites ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <Star size={16} />
                        <span>Favorites</span>
                    </button>
                    {expandedSections.favorites && (
                        <div className="mt-1">
                            {uniqueFavorites.length > 0 ? (
                                uniqueFavorites.map((page) => (
                                    <SidebarItem key={`fav-${page._id}`} page={page} />
                                ))
                            ) : (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No favorites yet
                                </div>
                            )}
                        </div>
                    )}
                </div>


                {/* Recent Section */}
                {uniqueRecents.length > 0 && (
                    <div className="mb-4">
                        <div
                            onClick={() => toggleSection('recent')}
                            className="flex items-center gap-x-1 text-xs font-semibold text-muted-foreground/50 px-3 py-1 mb-1 cursor-pointer hover:text-muted-foreground/70 transition"
                        >
                            <ChevronRight className={cn(
                                "h-3 w-3 transition-transform",
                                expandedSections.recent && "rotate-90"
                            )} />
                            <span>Recent</span>
                        </div>
                        {expandedSections.recent && (
                            <div className="space-y-0.5">
                                {uniqueRecents.map(page => (
                                    <SidebarItem
                                        key={`recent-${page._id}`}
                                        page={page}
                                        level={0}
                                        expanded={expanded}
                                        onExpand={toggleExpand}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="text-xs font-semibold text-muted-foreground/50 px-3 py-1 mb-1">
                    Private
                </div>

                {isLoading ? (
                    <div className="space-y-2 px-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-7 bg-muted/50 rounded animate-pulse" />
                        ))}
                    </div>
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
