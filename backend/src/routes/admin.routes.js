import express from "express";
import { 
    getAdminSummary, 
    getAllOrders, 
    getOrderById,
    updateOrderStatus,
    uploadImages 
  } from "../controllers/admin.controller.js";
import {createProduct, updateProduct, deleteProduct} from "../controllers/product.controller.js"
import { protect, admin } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";


const router = express.Router();

router.use(protect, admin);

router.get("/summary", getAdminSummary);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/orders/:id", getOrderById);

router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.post("/upload", upload.array("images", 10), uploadImages);

export default router;

