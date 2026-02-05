import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, Loader2, Paperclip, Video, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUpload from '@/hooks/useUpload';
import useBlockStore from '@/store/useBlockStore';

const AttachmentBlock = ({ block }) => {
    const { updateBlock, deleteBlock } = useBlockStore();
    const { uploadFile, deleteFile, isUploading, progress, error } = useUpload();
    const [localError, setLocalError] = useState(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            deleteBlock(block._id);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setLocalError(null);
        try {
            // Delete old if exists (unlikely for new clean block, but good practice)
            if (block.file?.key) {
                await deleteFile(block.file.key);
            }

            const result = await uploadFile(file, 'attachment');

            // Update block content with file info
            updateBlock(block._id, { ...block.content, ...result }, block.props, block.type);

        } catch (error) {
            console.error("Attachment upload failed", error);
            setLocalError("Upload failed");
        }
    }, [block, uploadFile, deleteFile, updateBlock]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: block.type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024,
        accept: block.type === 'image'
            ? { 'image/*': [] }
            : block.type === 'video'
                ? { 'video/*': [] }
                : { 'application/pdf': [] }
    });

    // If we have a file, show preview or file card
    if (block.file?.url) {
        return (
            <div
                className="my-2 border rounded-md overflow-hidden relative group/attachment focus-within:ring-2 focus-within:ring-primary outline-none"
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                {/* Deletion Toolbar */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/attachment:opacity-100 transition-opacity z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block._id);
                        }}
                        className="p-1.5 rounded-md bg-background border border-border shadow-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Delete block"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                {block.type === 'image' && (
                    <img src={block.file.url} alt="Attachment" className="max-w-full h-auto" />
                )}
                {block.type === 'video' && (
                    <video src={block.file.url} controls className="max-w-full h-auto bg-black" />
                )}
                {block.type === 'pdf' && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div className="flex-1 min-w-0">
                            <a href={block.file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline truncate block">
                                {block.file.key?.split('/').pop()}
                            </a>
                            <span className="text-xs text-muted-foreground uppercase">{block.file.mimeType?.split('/')[1] || 'PDF'}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className={cn(
                "my-2 border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors relative group/attachment outline-none focus:ring-2 focus:ring-primary",
                isDragActive && "border-primary bg-primary/5",
                isUploading && "opacity-50 pointer-events-none"
            )}
        >
            {/* Deletion Toolbar for empty state */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/attachment:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block._id);
                    }}
                    className="p-1.5 rounded-md bg-background border border-border shadow-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
            <input {...getInputProps()} />

            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Uploading... {progress}%</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    {block.type === 'image' && <FileIcon size={24} />}
                    {block.type === 'video' && <Video size={24} />}
                    {block.type === 'pdf' && <FileText size={24} />}
                    <span className="text-sm font-medium">Click to upload {block.type}</span>
                    <span className="text-xs text-muted-foreground/70">
                        {block.type === 'video' ? 'Max 50MB' : 'Max 10MB'}
                    </span>
                    {localError && <span className="text-destructive text-xs mt-1">{localError}</span>}
                </div>
            )}
        </div>
    );
};

export default AttachmentBlock;
