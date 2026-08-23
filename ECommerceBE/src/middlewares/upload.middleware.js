import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 5
    },
    fileFilter
});

export const validateImageSignature = (req, res, next) => {
    if (!req.files && !req.file) {
        return next();
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

    for (const file of files) {
        if (!file.buffer || file.buffer.length < 4) {
            return next(new ApiError(400, 'Invalid file content.'));
        }

        const header = file.buffer.toString('hex', 0, 4).toUpperCase();
        let isValid = false;

        const isPng = header === '89504E47';
        const isJpg = header.startsWith('FFD8FF');
        const isWebp = header === '52494646'; // RIFF header for webp

        if (isPng || isJpg || isWebp) {
            isValid = true;
        }

        if (!isValid) {
            return next(new ApiError(400, `File content signature does not match image format for ${file.originalname}.`));
        }
    }

    next();
};

export default upload;
