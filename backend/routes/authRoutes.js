import express from 'express';
import { completeProfile, getProfile, getUsers, LoginUser, registerAdmin, registerUser, updateProfile, verifyOtp } from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register',registerUser);
authRouter.post('/verify-otp',verifyOtp);
authRouter.post("/complete-profile",completeProfile);

authRouter.post("/login",LoginUser);
authRouter.post("/register-admin",registerAdmin);

//protected Routes
authRouter.get("/me",authenticateToken,getProfile);
authRouter.put("/update-profile",authenticateToken,updateProfile);

authRouter.get("/users",authenticateToken,authorizeRoles("admin"),getUsers);

export default authRouter;
