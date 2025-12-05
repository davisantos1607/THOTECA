const express = require('express');
const router = express.Router();
const BookController = require('../controllers/book.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Optional Cloudinary support (for Vercel / serverless uploads)
let cloudinary, streamifier;
if (process.env.CLOUDINARY_URL) {
    cloudinary = require('cloudinary').v2;
    // cloudinary will pick up CLOUDINARY_URL automatically, but allow explicit config if needed
    streamifier = require('streamifier');
}

// Use memory storage by default (so we can upload to Cloudinary in serverless env)
const memoryStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: process.env.CLOUDINARY_URL ? memoryStorage : diskStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// Helper to upload buffer to Cloudinary
async function uploadBufferToCloudinary(buffer, folder = 'thoteca') {
    return new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(upload_stream);
    });
}

// Routes
router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);
router.post('/', upload.single('cover_image'), async (req, res, next) => {
    try {
        if (process.env.CLOUDINARY_URL && req.file && req.file.buffer) {
            const result = await uploadBufferToCloudinary(req.file.buffer);
            // replace filename with secure_url so controller can save it
            req.file.filename = result.secure_url;
        }
        next();
    } catch (err) {
        next(err);
    }
}, BookController.createBook);

router.put('/:id', upload.single('cover_image'), async (req, res, next) => {
    try {
        if (process.env.CLOUDINARY_URL && req.file && req.file.buffer) {
            const result = await uploadBufferToCloudinary(req.file.buffer);
            req.file.filename = result.secure_url;
        }
        next();
    } catch (err) {
        next(err);
    }
}, BookController.updateBook);
router.delete('/:id', BookController.deleteBook);

module.exports = router;