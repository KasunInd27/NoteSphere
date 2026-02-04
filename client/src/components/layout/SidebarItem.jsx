import React from "react";
import { ChevronRight, File, Plus, Trash, MoreHorizontal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import usePageStore from "@/store/usePageStore";

const SidebarItem = ({ page, level = 0, onExpand, expanded }) => {
    const navigate = useNavigate();
    const { id: activePageId } = useParams();
    const { createPage, deletePage, toggleFavorite, favoritePages } = usePageStore();


    const isExpanded = expanded?.[page._id];
    const isActive = activePageId === page._id;
    const isFavorite = favoritePages.some(p => p._id === page._id);

    const handleExpand = (e) => {
        e.stopPropagation();
        onExpand(page._id);
    };

    const onClick = () => {
        navigate(`/pages/${page._id}`);
    };

    const onCreateChild = async (e) => {
        e.stopPropagation();
        if (!isExpanded) onExpand(page._id, true);
        await createPage("Untitled", page._id);
    };

    const onDelete = async (e) => {
        e.stopPropagation();
        const confirmed = window.confirm(
            "Are you sure? This will delete all sub-pages too."
        );
        if (confirmed) {
            await deletePage(page._id);
            if (isActive) navigate("/");
        }
    };

    const onToggleFavorite = async (e) => {
        e.stopPropagation();
        await toggleFavorite(page._id);
    };

    return (
        <div
            role="button"
            onClick={onClick}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
            className={cn(
                "group min-h-[28px] text-sm py-1 pr-3 w-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800 flex items-center text-muted-foreground font-medium transition-colors cursor-pointer rounded-sm mx-1 max-w-[calc(100%-8px)]",
                isActive && "bg-neutral-200 dark:bg-neutral-800 text-primary"
            )}
        >
            <div
                role="button"
                className="h-5 w-5 rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center justify-center mr-0.5 shrink-0 transition"
                onClick={handleExpand}
            >
                <ChevronRight
                    className={cn(
                        "h-3.5 w-3.5 text-muted-foreground/70 transition-transform",
                        isExpanded && "rotate-90"
                    )}
                />
            </div>

            <div className="flex items-center gap-x-2 truncate">
                {page.icon ? (
                    <span className="text-[16px] shrink-0 leading-none">{page.icon}</span>
                ) : (
                    <File className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                )}
                <span className="truncate leading-none py-0.5">
                    {page.title || "Untitled"}
                </span>
            </div>


            <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-x-0.5">
                <div
                    role="button"
                    onClick={onToggleFavorite}
                    className={cn(
                        "h-5 w-5 flex items-center justify-center rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600",
                        isFavorite && "opacity-100"
                    )}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Star className={cn(
                        "h-3 w-3",
                        isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                    )} />
                </div>
                <div
                    role="button"
                    onClick={onDelete}
                    className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                    <Trash className="h-3 w-3 text-muted-foreground" />
                </div>
                <div
                    role="button"
                    onClick={onCreateChild}
                    className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                    <Plus className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                    <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
};

export default SidebarItem;
