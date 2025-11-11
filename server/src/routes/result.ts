import { Router } from 'express';
import {
  submitResult,
  getMyResults,
  getAllResults,
  getTestResults,
  getResultById
} from '../controllers/resultController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Submit test result (students only)
router.post('/', submitResult);

// Get student's own results
router.get('/my', getMyResults);

// Get specific result (students can view their own, admins can view any)
router.get('/:id', getResultById);

// Admin only routes
router.get('/admin/all', authorizeRole('admin'), getAllResults);
router.get('/admin/test/:testId', authorizeRole('admin'), getTestResults);

export default router;