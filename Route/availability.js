import express from 'express';
import {
  getLawyerAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability,
  getPublicLawyerAvailability,
} from '../Controlers/AvailabilityController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all availability slots for a specific lawyer (public)
router.get('/lawyer/:lawyerId', getPublicLawyerAvailability);

// Get all availability slots for the current logged-in lawyer
router.get('/my-availability', verifyToken, getLawyerAvailability);

// Add new availability slot
router.post('/add', verifyToken, addAvailability);

// Update availability slot
router.put('/:availabilityId', verifyToken, updateAvailability);

// Delete availability slot
router.delete('/:availabilityId', verifyToken, deleteAvailability);

export default router;
