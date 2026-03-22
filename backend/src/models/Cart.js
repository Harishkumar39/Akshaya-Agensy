import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true 
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1, default: 1 },
      // ADD THIS: This stores the price for non-variant products
      price: { type: Number, required: true }, 
      // Keep the variant object for items that have them
      variant: {
        name: String,
        price: Number,
        imageUrl: String
      }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;