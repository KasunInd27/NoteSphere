import React from 'react';
import { ChevronRight, File, Plus, Trash, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import usePageStore from '@/store/usePageStore';

const SidebarItem = ({ page, level = 0, onExpand, expanded }) => {
    const navigate = useNavigate();
    const { id: activePageId } = useParams(); // Should correspond to current route param 'id'
    const { createPage, deletePage } = usePageStore();

    // Check local expansion state or store state
    const isExpanded = expanded[page._id];
    const isActive = activePageId === page._id;

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
        const confirm = window.confirm("Are you sure? This will delete all sub-pages too.");
        if (confirm) {
            await deletePage(page._id);
            if (isActive) navigate('/');
        }
    };

    return (
        <div
            role="button"
            onClick={onClick}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
            className={cn(
                "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800 flex items-center text-muted-foreground font-medium transition-colors",
                isActive && "bg-neutral-200/50 dark:bg-neutral-800 text-primary"
            )}
        >
            <div
                role="button"
                className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1 p-0.5"
                onClick={handleExpand}
            >
                <ChevronRight className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform",
                    isExpanded && "rotate-90"
                )} />
            </div>

            {page.icon ? (
                <span className="text-[18px] mr-2 shrink-0">{page.icon}</span>
            ) : (
                <File className="h-[18px] w-[18px] mr-2 text-muted-foreground shrink-0" />
            )}

            <span className="truncate">{page.title}</span>

            <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div role="button" onClick={onDelete} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1">
                    <Trash className="h-4 w-4 text-muted-foreground" />
                </div>
                <div role="button" onClick={onCreateChild} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
};

export default SidebarItem;
