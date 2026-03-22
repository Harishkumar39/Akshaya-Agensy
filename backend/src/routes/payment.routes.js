import express from "express";
const router = express.Router();
import { 
  createRazorpayOrder, 
  verifyPaymentAndCreateOrder, 
  calculateShippingPreview 
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.js";

router.post("/order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPaymentAndCreateOrder);
router.post("/shipping-preview", calculateShippingPreview);

export default router;