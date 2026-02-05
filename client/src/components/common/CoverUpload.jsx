import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon, Loader2, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUpload from '@/hooks/useUpload';
import axios from 'axios';
import usePageStore from '@/store/usePageStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CoverUpload = ({ pageId, cover, onUpdate, className = "" }) => {
    const { uploadFile, deleteFile, isUploading, progress } = useUpload();

    // cover is { url, key }

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            if (cover?.key) {
                await deleteFile(cover.key);
            }

            const { url, key } = await uploadFile(file, 'cover');

            // Persist
            const newCover = { url, key };
            await axios.put(`${API_URL}/api/pages/${pageId}`, { cover: newCover }, { withCredentials: true });

            // Call parent callback to update local state
            if (onUpdate) onUpdate(newCover);

        } catch (error) {
            console.error("Cover upload failed", error);
        }
    }, [cover, pageId, uploadFile, deleteFile, onUpdate]);

    const handleRemove = async (e) => {
        e.stopPropagation();
        if (cover?.key) {
            await deleteFile(cover.key);
        }
        // Update DB to null
        await axios.put(`${API_URL}/api/pages/${pageId}`, { cover: { url: null, key: null } }, { withCredentials: true });
        if (onUpdate) onUpdate({ url: null, key: null });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false
    });

    if (cover?.url) {
        return (
            <div className="group relative w-full h-48 sm:h-64 bg-muted border-b">
                <img src={cover.url} alt="Cover" className="w-full h-full object-cover" />

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => document.getElementById('cover-input').click()} // Hack to trigger dropzone open if needed or just use separate button
                        className="bg-background/80 hover:bg-background text-xs px-2 py-1 rounded shadow text-foreground flex items-center gap-1 backdrop-blur-sm"
                    >
                        Change cover
                        {/* We use a hidden dropzone active area elsewhere or overlay? */}
                    </button>
                    <button
                        onClick={handleRemove}
                        className="bg-background/80 hover:bg-background text-xs px-2 py-1 rounded shadow text-destructive flex items-center gap-1 backdrop-blur-sm"
                    >
                        <X size={14} /> Remove
                    </button>
                </div>

                {/* Hidden input for change wrapper needed? actually usage of dropzone is tricky when image is present.
                     Better: Render the Dropzone area only when "Change" is clicked?
                     Or make the whole image a dropzone? Maybe too intrusive.
                     Let's use a "Change Cover" button that opens file dialog.
                 */}
                <div {...getRootProps({ className: 'hidden' })}>
                    <input {...getInputProps({ id: 'cover-input' })} />
                </div>

                {isUploading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "w-full h-32 border-b border-dashed border-muted-foreground/25 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer",
                isDragActive && "bg-accent/20 border-accent",
                className
            )}
        >
            <input {...getInputProps()} />
            {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin" />
                    <span className="text-sm">{progress}%</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-sm opacity-60 group-hover:opacity-100">
                    <ImageIcon size={16} />
                    <span>Add cover</span>
                </div>
            )}
        </div>
    );
};

export default CoverUpload;
