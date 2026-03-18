import express from 'express';
import User from '../Model/User.js';
import UserController from '../Controlers/UserController.js';
import { verifyRole, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/allUsers", verifyToken, verifyRole("admin"), UserController.getAllUsers);
router.post("/add", UserController.addUser);
router.get("/me", verifyToken, UserController.getCurrentUser);
router.get("/:id", UserController.findUserById);
router.put("/update/:id", UserController.updateUser);
router.delete("/delete/:id", verifyToken, UserController.deleteUser);

export default router;