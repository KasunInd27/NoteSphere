import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const uploadFile = async (file, context = 'attachment') => {
        setIsUploading(true);
        setProgress(0);
        setError(null);

        try {
            // 1. Get Presigned URL
            const { data: presignData } = await axios.post(
                `${API_URL}/api/uploads/presign?context=${context}`,
                {
                    fileType: file.type.split('/')[0], // 'image', 'application' (pdf)
                    mimeType: file.type,
                    fileName: file.name
                },
                { withCredentials: true }
            );

            const { uploadUrl, fileUrl, key } = presignData;

            // 2. Upload to R2 directly
            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            setIsUploading(false);
            return { url: fileUrl, key, name: file.name, size: file.size, type: file.type };

        } catch (err) {
            console.error("Upload failed", err);
            setError(err.response?.data?.message || err.message || "Upload failed");
            setIsUploading(false);
            throw err;
        }
    };

    const deleteFile = async (key) => {
        if (!key) return;
        try {
            await axios.delete(`${API_URL}/api/uploads`, {
                data: { key },
                withCredentials: true
            });
        } catch (err) {
            console.error("Delete failed", err);
            // We usually don't block UI on delete failure, just log it.
        }
    };

    return { uploadFile, deleteFile, isUploading, progress, error };
};

export default useUpload;
