import express from 'express';
import AuthController from '../Controlers/AuthController.js';

const router = express.Router();

router.post("/register", AuthController.userRegister);
router.post("/login", AuthController.userLogin);
router.get("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

export default router;