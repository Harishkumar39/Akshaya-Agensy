import express from "express";
import { getMyOrders, cancelMyOrder } from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/my", protect, getMyOrders);
router.put("/:id/cancel", cancelMyOrder);

export default router;

