import express from 'express';
import { getAllCallPackages, addCallPackage } from '../Controlers/CallPackageController.js';

const router = express.Router();



// Get all call packages
router.get('/getAllPackages', getAllCallPackages);

// Add a new call package
router.post('/addPackage', addCallPackage);

export default router;