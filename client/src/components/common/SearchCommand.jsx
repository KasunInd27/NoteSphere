import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, File, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import usePageStore from "@/store/usePageStore";
import { cn } from "@/lib/utils";

const SearchCommand = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { pages, createPage } = usePageStore();

    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const onSelect = (id) => {
        navigate(`/pages/${id}`);
        setOpen(false);
    }

    const onCreate = async () => {
        const newPage = await createPage();
        if (newPage) {
            navigate(`/pages/${newPage._id}`);
            setOpen(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-popover border rounded-xl shadow-2xl overflow-hidden relative">
                <Command className="w-full">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            autoFocus
                            placeholder="Search pages..."
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <Command.List className="max-h-[300px] overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Pages" className="text-xs font-medium text-muted-foreground px-2 py-1.5 bg-muted/30">
                            {pages.map((page) => (
                                <Command.Item
                                    key={page._id}
                                    value={`${page.title} ${page._id}`}
                                    onSelect={() => onSelect(page._id)}
                                    className={cn(
                                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                                    )}
                                >
                                    <File className="mr-2 h-4 w-4" />
                                    <span>{page.title || "Untitled"}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>

                        <Command.Separator className="my-1 h-px bg-border" />

                        <Command.Group heading="Actions" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                            <Command.Item
                                onSelect={onCreate}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Create new page</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={async () => {
                                    const newPage = await createPage("Meeting Notes", null, "meeting-notes");
                                    if (newPage) {
                                        navigate(`/pages/${newPage._id}`);
                                        setOpen(false);
                                    }
                                }}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                            >
                                <span className="mr-2 h-4 w-4 text-xs flex items-center justify-center">📝</span>
                                <span>Create Meeting Notes</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={async () => {
                                    const newPage = await createPage("Project Plan", null, "project-plan");
                                    if (newPage) {
                                        navigate(`/pages/${newPage._id}`);
                                        setOpen(false);
                                    }
                                }}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                            >
                                <span className="mr-2 h-4 w-4 text-xs flex items-center justify-center">🚀</span>
                                <span>Create Project Plan</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>

                {/* Click outside to close - simple overlay approach */}
                <div className="absolute top-2 right-2 flex gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">ESC</span>
                    </kbd>
                </div>
            </div>
            <div className="absolute inset-0 -z-10" onClick={() => setOpen(false)} />
        </div>
    );
};

export default SearchCommand;
