import express from 'express';
import {
  saveConsultation,
  getLawyerConsultations,
  getClientConsultations,
  getConsultationById
} from '../Controlers/ConsultationController.js';

const router = express.Router();

// ✅ Save consultation details
router.post('/save', saveConsultation);

// ✅ Get all consultations for a lawyer
router.get('/lawyer/:lawyerId', getLawyerConsultations);

// ✅ Get all consultations for a client
router.get('/client/:clientId', getClientConsultations);

// ✅ Get specific consultation by ID
router.get('/:consultationId', getConsultationById);

export default router;
