import express from 'express';
import User from '../Model/User.js';
import { verifyRole, verifyToken } from '../middleware/authMiddleware.js';
import LawyerController from '../Controlers/LawyerController.js';

const router = express.Router();

// router.get("/all", LawyerController.findAllLawyers);
router.get("/findAllLawyers", LawyerController.findAllLawyers);
router.get("/:id", LawyerController.getLawyerById);
router.get("/specialization/:specialization", LawyerController.getLawyersBySpecialization);

export default router;