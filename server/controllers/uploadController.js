import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Initialize Client
const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const getR2PublicUrl = (key) => {
    const baseUrl = process.env.R2_PUBLIC_BASE_URL || "";
    // Remove trailing slash if exists
    const cleanBase = baseUrl.replace(/\/$/, "");
    return `${cleanBase}/${key}`;
};

// @desc    Generate Presigned Upload URL
// @route   POST /api/uploads/presign
// @access  Private
const generatePresignedUrl = async (req, res) => {
    const { fileType, mimeType, fileName } = req.body;

    if (!fileType || !mimeType) {
        return res.status(400).json({ message: "Missing fileType or mimeType" });
    }

    // Define limits (simple check, enforcing more robustly via S3 conditions if needed)
    // Images: 5MB, PDF: 10MB, Video: 50MB
    const limits = {
        image: 5 * 1024 * 1024,
        pdf: 10 * 1024 * 1024,
        video: 50 * 1024 * 1024
    };

    // Construct Key
    // notesphere/avatars/, notesphere/covers/, notesphere/attachments/
    // Use uuid to prevent collisions
    const fileExt = fileName ? fileName.split('.').pop() : mimeType.split('/')[1];
    const uniqueId = uuidv4();

    let prefix = 'notesphere/attachments';
    if (fileType === 'image' && req.query.context === 'avatar') prefix = 'notesphere/avatars';
    if (fileType === 'image' && req.query.context === 'cover') prefix = 'notesphere/covers';

    const key = `${prefix}/${uniqueId}.${fileExt}`;

    // Presign
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: mimeType,
            // ContentLength: ... signed url doesn't strictly enforce length in PUT usually without checks
        });

        const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 }); // 1 hour

        res.json({
            uploadUrl,
            fileUrl: getR2PublicUrl(key),
            key
        });

    } catch (error) {
        console.error("R2 Presign Error:", error);
        res.status(500).json({ message: "Failed to generate upload URL" });
    }
};

// @desc    Delete File from R2
// @route   DELETE /api/uploads
// @access  Private
const deleteFile = async (req, res) => {
    const { key } = req.body;

    if (!key) {
        return res.status(400).json({ message: "Missing key" });
    }

    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        await r2.send(command);
        res.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("R2 Delete Error:", error);
        res.status(500).json({ message: "Failed to delete file" });
    }
};

export { generatePresignedUrl, deleteFile };
