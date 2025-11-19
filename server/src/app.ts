import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before importing modules that use them
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import routes
import authRoutes from './routes/auth';
import testRoutes from './routes/test';
import resultRoutes from './routes/result';

// Import middleware
import { uploadPDF, handleMulterError, uploadToCloudinary } from './middleware/upload';
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backward compatibility: Serve uploaded files statically for existing local files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://bhoomi:bhoomi@cluster0.q8toe4q.mongodb.net/?appName=Cluster0');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Exam Pilot Backend API' });
});

// File upload route with PDF/HWP validation and Cloudinary upload
app.post('/upload', uploadPDF.single('file'), handleMulterError, async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await uploadToCloudinary(req.file);
    res.json({
      message: 'File uploaded successfully',
      filename: result.public_id,
      path: result.secure_url
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to cloud storage' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;