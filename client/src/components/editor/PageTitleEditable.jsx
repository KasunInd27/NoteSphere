import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import usePageStore from "@/store/usePageStore";
import { toast } from "sonner";

const PageTitleEditable = ({ pageId, initialTitle = "", className }) => {
    const { updatePageTitle } = usePageStore();

    const [draftTitle, setDraftTitle] = useState(initialTitle ?? "");
    const [isSaving, setIsSaving] = useState(false);

    const lastSavedRef = useRef(initialTitle ?? "");
    const saveTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    const isEditingRef = useRef(false); // prevents store updates from resetting while typing

    // Sync from props ONLY when page changes, or when not actively editing
    useEffect(() => {
        if (!isEditingRef.current) {
            setDraftTitle(initialTitle ?? "");
            lastSavedRef.current = initialTitle ?? "";
        }
    }, [pageId, initialTitle]);

    const clearSaveTimeout = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
    };

    // Choose your behavior here:
    // Option A (Notion-like): allow empty title to be stored as "".
    // Option B: on blur, if empty, save "Untitled".
    const normalizeForSave = (raw) => raw; // Option A
    // const normalizeForSave = (raw) => (raw.trim() ? raw : "Untitled"); // Option B (only at blur/enter)

    const handleSave = async (rawTitle) => {
        const finalTitle = normalizeForSave(rawTitle);

        // if unchanged, do nothing
        if (finalTitle === lastSavedRef.current) return;

        setIsSaving(true);
        try {
            await updatePageTitle(pageId, finalTitle);
            lastSavedRef.current = finalTitle;
        } catch (err) {
            toast.error("Failed to save title");
            setDraftTitle(lastSavedRef.current);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setDraftTitle(newValue);

        clearSaveTimeout();

        // Debounce save while typing (still allows empty string!)
        saveTimeoutRef.current = setTimeout(() => {
            handleSave(newValue);
        }, 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            clearSaveTimeout();
            handleSave(draftTitle);
            inputRef.current?.blur();
        }

        if (e.key === "Escape") {
            e.preventDefault();
            clearSaveTimeout();
            setDraftTitle(lastSavedRef.current);
            inputRef.current?.blur();
        }
    };

    const handleFocus = () => {
        isEditingRef.current = true;
    };

    const handleBlur = () => {
        isEditingRef.current = false;
        clearSaveTimeout();
        handleSave(draftTitle);
    };

    useEffect(() => {
        return () => clearSaveTimeout();
    }, []);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={draftTitle}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Untitled"
                className={cn(
                    "w-full text-4xl font-bold outline-none bg-transparent",
                    "placeholder:text-muted-foreground/30",
                    "focus:bg-muted/10 rounded px-2 -ml-2 py-1 transition-colors",
                    "border-2 border-transparent focus:border-primary/20",
                    className
                )}
            />

            {isSaving && (
                <span className="absolute -top-6 right-0 text-xs text-muted-foreground animate-pulse">
                    Saving...
                </span>
            )}
        </div>
    );
};

export default PageTitleEditable;
