import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js"
import Product from "../models/Product.js"
import { generateInvoicePDF } from "../utils/pdfGenerator.js";
import {sendEmail} from "../utils/mailer.js";

const AGENCY_COORDS = { lat: 12.880774, lng: 80.228448 };

const SHIPPING_ZONES = {
  "600119": 50, "600097": 50, "600100": 50, "600130": 50,
  "600041": 80, "600096": 80, "600115": 80, "603103": 80,
  "600020": 100, "600042": 120, "600113": 120, "600091": 120
};

const calculateFee = (subtotal, shippingAddress) => {
  if (subtotal < 500) {
    throw new Error("MIN_ORDER_NOT_MET");
  }
  const userPin = shippingAddress.pincode;
  if (SHIPPING_ZONES[userPin] !== undefined) {
    return SHIPPING_ZONES[userPin];
  }
  throw new Error("OUT_OF_RANGE");
};

export const calculateShippingPreview = async (req, res) => {
  try {
    const fee = await calculateFee(req.body.subtotal, req.body.shippingAddress);
    const grandTotal = Number(req.body.subtotal) + fee;
    res.json({ shippingFee: fee, grandTotal: grandTotal, allowable: true });
  } catch (err) {
    if (err.message === "OUT_OF_RANGE") {
      return res.status(400).json({ 
        message: "Location is beyond our 15km delivery radius.",
        allowable: false 
      });
    }
    if(err.message === "MIN_ORDER_NOT_MET"){
      return res.status(400).json({ 
        message: "Minimum order value is Rs. 500.",
        allowable: false 
      });
    }
    res.status(500).json({ message: "Error calculating shipping" });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        message: "Your cart is empty. Please add items to checkout." 
      });
    }
    
    const calculatedSubtotal = cart.items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);

    let verifiedFee;
    try {
      // FIX 1: Use 'calculatedSubtotal' here instead of 'subtotal'
      verifiedFee = await calculateFee(calculatedSubtotal, shippingAddress);
    } catch (err) {
      if (err.message === "MIN_ORDER_NOT_MET") {
        return res.status(400).json({ message: "Minimum order must be ₹500." });
      }
      if (err.message === "OUT_OF_RANGE") {
        return res.status(400).json({ message: "Sorry, Akshaya Agensy only delivers within 15 km of our location." });
      }
      throw err;
    }

    // FIX 2: Use 'calculatedSubtotal' here as well
    const total = Number(calculatedSubtotal) + verifiedFee;
    
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`,
      payment_capture: 1,
    });

    res.json({ 
      order: razorpayOrder, 
      keyId: process.env.RAZORPAY_KEY_ID, 
      shippingFee: verifiedFee,
      subtotal: calculatedSubtotal // Optional: send back to confirm sync
    });
  } catch (error) {
    console.error("ORDER CREATION ERROR:", error); // This will show the error in your terminal
    res.status(500).json({ message: "Order creation failed" });
  }
};

export const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      items, 
      shippingAddress, 
    } = req.body;

    // 1. CRITICAL: Check if the signature exists at all
    if (!razorpay_payment_id || !razorpay_signature) {
       return res.status(400).json({ message: "Payment was cancelled or failed." });
    }

    // 2. Signature Verification
    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // STOP HERE if it doesn't match
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Security Verification Failed. Order not placed." });
    }

    try {
      await User.findByIdAndUpdate(req.user.id, {
        address: shippingAddress.address,
        phone: shippingAddress.phone
      });
    } catch (userUpdateError) {
      // We log this but don't stop the order process
      console.error("Failed to save address to user profile:", userUpdateError.message);
    }
    const productIds = items.map(item => item._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const verifiedSubtotal = items.reduce((acc, item) => {
      const dbProduct = dbProducts.find(p => p._id.toString() === item._id);
      if (!dbProduct) throw new Error(`Product ${item._id} not found`);

      let currentPrice=0;
      if (dbProduct.hasVariants && item.variant) {
        // Find by ID or Name (covers all frontend sync scenarios)
        const variant = dbProduct.variants.find(v => 
          (item.variant._id && String(v._id) === String(item.variant._id)) || 
          (v.name === item.variant.name)
        );
        currentPrice = variant ? variant.price : dbProduct.price;
      } else {
        currentPrice = dbProduct.price;
      }
      const finalQty = Number(item.qty || item.quantity || 0);

      // 3. Force numeric addition
      return acc + (Number(currentPrice) * finalQty);
    }, 0);

    const verifiedShippingFee = calculateFee(verifiedSubtotal, shippingAddress); 
    const verifiedTotal = verifiedSubtotal + verifiedShippingFee;

    try {
      const stockPromises = items.map((item) => {
        if (item.variant && item.variant._id) {
          // Find product, find specific variant, decrement its stock
          return Product.findOneAndUpdate(
            { _id: item._id, "variants._id": item.variant._id },
            { $inc: { "variants.$.stock": -item.qty } } // Negative to deduct
          );
        } else {
          // Standard product deduction
          return Product.findByIdAndUpdate(item._id, {
            $inc: { stock: -item.qty } // Negative to deduct
          });
        }
      });
      await Promise.all(stockPromises);
    } catch (stockError) {
      console.error("STOCK DEDUCTION ERROR:", stockError);
    }

    // 3. ONLY AFTER SUCCESS: Create the order
    const validatedItems = items.map(item => {
      const dbProd = dbProducts.find(p => p._id.toString() === item._id);
      let finalPrice = dbProd.price; 
      if (item.variant && item.variant._id) {
        const dbVariant = dbProd.variants.id(item.variant._id);
        if (dbVariant) {
          finalPrice = dbVariant.price;
        }
      }
    
      return {
        product: item._id,
        qty: Number(item.qty || item.quantity), 
        price: finalPrice,
        name: dbProd.name,
        variant: item.variant ? { name: item.variant.name, _id: item.variant._id } : null,
        imageUrl: item.imageUrl
      };
    });

    const order = await Order.create({
      user: req.user.id, 
      items: validatedItems, 
      shippingAddress, 
      subtotal: verifiedSubtotal, 
      shippingFee: verifiedShippingFee,
      total: verifiedTotal, 
      status: "paid",
      razorpayOrderId: razorpay_order_id, 
      razorpayPaymentId: razorpay_payment_id
    });

    // 4. Clear Cart
    await Cart.findOneAndDelete({ userId: req.user.id });

    // 5. Generate PDF and Send Confirmation Email
    try {
      const pdfBuffer = await generateInvoicePDF(order);
      
      await sendEmail({
        to: req.user.email,
        subject: `Order Confirmed! #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #f59e0b;">Thank you for your order!</h2>
            <p>Hi ${shippingAddress.name}, your payment was successful.</p>
            <p>Order ID: <b>${order._id}</b></p>
            <p>Please find your official invoice attached as a PDF.</p>
            <hr />
            <p>Team Akshaya Agensy</p>
          </div>`,
        attachmentBuffer: pdfBuffer,
        fileName: `Invoice_${order._id.toString().slice(-6)}.pdf`
      });
    } catch (mailError) {
      console.error("MAILING ERROR:", mailError.message);
      // We don't throw here so the user still gets the success response
    }

    res.status(201).json(order);
    
  } catch (error) {
    console.error("VERIFICATION ERROR:", error);
    res.status(500).json({ 
      message: "Verification failed", 
      details: error.message 
    });
  }
};

// file: controllers/order.controller.js
export const getMyOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5; // Showing 5 orders per page
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user.id })
    ]);

    res.json({
      orders,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // 1. Ownership & Status Checks
    if (!order.user._id.equals(req.user._id)) {
      return res.status(401).json({ message: "Not authorized to cancel this order" });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: "Order is already cancelled" });
    }
    if (['shipped', 'delivered', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel dispatched orders" });
    }

    // 2. Time Window Check (2 Hours)
    const orderTime = new Date(order.createdAt).getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    if (Date.now() - orderTime > twoHoursInMs) {
      return res.status(400).json({ message: "2-hour cancellation window has closed" });
    }

    // 3. ACTION: Restock Items back to Inventory
    // We loop through the items in the order and increment the product stock
    const restockPromises = order.items.map((item) => {
      if (item.variant && item.variant._id) {
        // If it's a variant, increment stock within the variants array
        return Product.findOneAndUpdate(
          { _id: item.product, "variants._id": item.variant._id },
          { $inc: { "variants.$.stock": item.qty } }
        );
      } else {
  
        return Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty } 
        });
      }
    });
    await Promise.all(restockPromises);

    // 4. Update Order Status
    order.status = 'cancelled';
    await order.save();
    try {
      await sendEmail({
        from: `"Akshaya Agensy" <${process.env.EMAIL_USER}>`,
        to: order.user.email,
        subject: `Order Cancelled #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ef4444;">Order Cancelled</h2>
            <p>Hi ${order.user.name},</p>
            <p>Your order <b>#${order._id}</b> has been successfully cancelled as requested.</p>
            <p>If a payment was processed, the refund will be initiated as per our policy.</p>
            <hr />
            <p>Team Akshaya Agensy</p>
          </div>`
      });
    } catch (mailError) {
      console.error("CANCELLATION EMAIL ERROR:", mailError.message);
    }

    res.status(200).json({ message: "Order cancelled and items restocked", order });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};