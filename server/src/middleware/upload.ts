import { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File filter for PDFs and HWP files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/x-hwp') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and HWP files are allowed'));
  }
};

// In-memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// Multer configuration for PDF and HWP uploads
export const uploadPDF = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload to Cloudinary
export const uploadToCloudinary = (file: Express.Multer.File): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'exam-pilot/tests',
        resource_type: 'raw', // Raw resource type for non-image files
        format: 'pdf', // Explicitly set format for PDFs
        public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!);
        }
      }
    );
    stream.end(file.buffer);
  });
};

// Error handling middleware for multer
export const handleMulterError = (error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }

  if (error.message === 'Only PDF and HWP files are allowed') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};