import express from "express";
import passport from "passport";
import { login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, initiateGoogleAuth, handleGoogleAuthCallback } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();


// Route for initiating Google OAuth2 authentication
router.get("/google", initiateGoogleAuth);

// Route for handling Google OAuth2 callback
router.get("/google/callback", handleGoogleAuthCallback);

router.get("/check-auth", verifyToken, checkAuth);
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;