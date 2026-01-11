import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Memory storage for multer
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only allow JPG and PNG
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG images are allowed'), false);
    }
  }
});

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error('No file provided'));
    }

    // Convert buffer to base64 data URI
    const base64Data = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64Data}`;

    cloudinary.uploader.upload(
      dataUri,
      {
        folder: 'spiritualunitymatch-profiles',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
  });
};

// Middleware to handle multiple files (up to 5)
export const uploadPhotos = upload.array('photos', 5);

export default upload;