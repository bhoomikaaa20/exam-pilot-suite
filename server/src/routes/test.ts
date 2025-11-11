import { Router } from 'express';
import {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest
} from '../controllers/testController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { uploadPDF, handleMulterError } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tests (students can view, admins can manage)
router.get('/', getAllTests);

// Get specific test
router.get('/:id', getTestById);

// Create test (admin only)
router.post('/', authorizeRole('admin'), createTest);

// Update test (admin only, or test creator)
router.put('/:id', authorizeRole('admin'), updateTest);

// Delete test (admin only, or test creator)
router.delete('/:id', authorizeRole('admin'), deleteTest);

export default router;