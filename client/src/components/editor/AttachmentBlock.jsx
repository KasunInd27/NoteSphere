import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, Loader2, Paperclip, Video, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUpload from '@/hooks/useUpload';
import useBlockStore from '@/store/useBlockStore';

const AttachmentBlock = ({ block }) => {
    const { updateBlock } = useBlockStore();
    const { uploadFile, deleteFile, isUploading, progress, error } = useUpload();
    const [localError, setLocalError] = useState(null);

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
            <div className="my-2 border rounded-md overflow-hidden relative group">
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

                {/* Delete/Replace actions could go here */}
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "my-2 border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors",
                isDragActive && "border-primary bg-primary/5",
                isUploading && "opacity-50 pointer-events-none"
            )}
        >
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
