import express from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser, verifyOTP, resendOTP, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.route("/profile").get(protect, getCurrentUser).put(protect, updateProfile)
router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);

export default router;

