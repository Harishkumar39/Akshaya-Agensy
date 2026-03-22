import express from "express";
import { syncCart, getCart } from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get the user's saved cart from DB
router.get("/", protect, getCart);

// Sync/Merge local storage items to DB
router.post("/sync", protect, syncCart);


export default router;