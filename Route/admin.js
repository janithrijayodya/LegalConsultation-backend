import express from 'express';
import AdminController from '../Controlers/AdminController.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all pending lawyer requests (admin only)
router.get('/lawyer-requests/pending', verifyToken, verifyRole('admin'), AdminController.getPendingLawyerRequests);

// Get all lawyer requests (admin only)
router.get('/lawyer-requests', verifyToken, verifyRole('admin'), AdminController.getAllLawyerRequests);

// Get single lawyer request (admin only)
router.get('/lawyer-requests/:id', verifyToken, verifyRole('admin'), AdminController.getLawyerRequest);

// Approve lawyer request (admin only)
router.post('/lawyer-requests/:id/approve', verifyToken, verifyRole('admin'), AdminController.approveLawyerRequest);

// Reject lawyer request (admin only)
router.post('/lawyer-requests/:id/reject', verifyToken, verifyRole('admin'), AdminController.rejectLawyerRequest);

export default router;
