import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getAdminSummary = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD = 10;

    const [userCount, orderCount, revenueAgg, statusAgg, lowStockItems] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      // Revenue Aggregation
      Order.aggregate([
        {
          $match: {
            status: { $in: ["paid", "processing", "shipped", "delivered"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
          },
        },
      ]),
      // Status Aggregation
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      // Low Stock Identification
      Product.find({
        $or: [
          // Case 1: Standard product is low
          { stock: { $lte: LOW_STOCK_THRESHOLD } },
          // Case 2: Product has variants, and at least one variant is low
          { "variants.stock": { $lte: LOW_STOCK_THRESHOLD } }
        ]
      }).select("name stock variants hasVariants")
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    
    const statusCounts = statusAgg.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    // Format low stock items for the frontend
    const lowStockDetails = lowStockItems.map(p => {
      let currentStock = p.stock;
      
      // If product has variants, find the lowest stock among them to alert the admin
      if (p.hasVariants && p.variants.length > 0) {
        currentStock = Math.min(...p.variants.map(v => v.stock));
      }

      return {
        _id: p._id,
        name: p.name,
        stock: currentStock,
        hasVariants: p.hasVariants
      };
    });

    res.json({
      users: userCount,
      orders: orderCount,
      revenue: totalRevenue,
      statusCounts,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockDetails,
    });
  } catch (error) {
    console.error("Admin summary error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by specific status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // 2. FIXED: Database-level Email Search (Fixes pagination bottleneck)
    if (req.query.userEmail) {
      const user = await User.findOne({ 
        email: { $regex: req.query.userEmail, $options: "i" } 
      });
      
      if (user) {
        query.user = user._id;
      } else {
        // If no user is found with that email, return empty results immediately
        return res.json({ orders: [], page, totalPages: 0, total: 0 });
      }
    }

    // Execute queries in parallel for speed
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Get all orders error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name images"); // Added images for the order detail view

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order by id error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Update order status error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// --- IMAGE UPLOAD ---

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    // Return the Cloudinary URLs provided by Multer-Storage-Cloudinary
    const urls = req.files.map(file => file.path);
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};
