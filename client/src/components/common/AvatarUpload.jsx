import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUpload from '@/hooks/useUpload';
import useAuthStore from '@/store/useAuthStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AvatarUpload = ({ className }) => {
    const { user, setUser } = useAuthStore();
    const { uploadFile, deleteFile, isUploading, progress } = useUpload();

    // We update the user store locally and optionally sync to backend auth endpoint if needed,
    // but typically we should have a user update endpoint. 
    // AuthController.googleLogin handles creation/login. We need a `updateUser` endpoint or similar?
    // The instructions say "Store object key in MongoDB".
    // We assume there's a way to update the user profile. 
    // Since we don't have a dedicated "update profile" endpoint yet (only auth routes), 
    // I should probably add one or just rely on the fact we need to persist this.
    // For now, I'll update the store and TODO: verify backend persistence.
    // Actually, `authController.js` doesn't have an update endpoint. 
    // I should create `PUT /api/auth/me` or similar? 
    // Or I can add it now.

    // Let's implement the upload flow first.

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            // Delete old avatar if it's a custom one (has a key)
            if (user.avatar?.key) {
                await deleteFile(user.avatar.key);
            }

            const { url, key } = await uploadFile(file, 'avatar');

            // Optimistic update
            const newAvatar = { url, key };
            setUser({ ...user, avatar: newAvatar });

            // Persist to backend (WE NEED THIS ENDPOINT)
            // Let's assume axios.put('/api/users/profile', { avatar: newAvatar })
            // I'll add this endpoint to generic user routes or auth routes?
            // Let's add `PUT /api/auth/profile` to authRoutes.
            await axios.put(`${API_URL}/api/auth/profile`, { avatar: newAvatar }, { withCredentials: true });

        } catch (error) {
            console.error("Avatar upload failed", error);
        }
    }, [user, uploadFile, deleteFile, setUser]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false
    });

    // Extract sizing classes from className if present, or default to w-24 h-24
    // Actually, simpler: Use a wrapper div for positioning, and inner div for the circle structure.
    // If className is passed, applying it to the outer div is correct. 
    // BUT we need to override the inner div's fixed dimensions if the user wants a small icon.
    // Let's make the inner div take full width/height of the container.

    return (
        <div className={cn("relative group", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative w-full h-full rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center cursor-pointer transition-colors",
                    isDragActive && "border-primary",
                    isUploading && "opacity-50 pointer-events-none"
                )}
            >
                <input {...getInputProps()} />

                {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span className={cn("font-bold text-muted-foreground",
                        // approximate text size based on container? easier to just use 'text-xs' or whatever 
                        // For now let's rely on parent font size or defaults.
                        "text-xs sm:text-2xl"
                    )}>
                        {user?.name?.[0]?.toUpperCase()}
                    </span>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="text-white w-1/2 h-1/2" />
                </div>

                {/* Progress */}
                {isUploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="animate-spin w-1/2 h-1/2 text-primary" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarUpload;
