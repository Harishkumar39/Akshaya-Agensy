// import-products.js
import mongoose from "mongoose";
import XLSX from "xlsx";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const importExcelToMongo = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 2. Read the Excel file
    const workbook = XLSX.readFile("C://Users//haris//OneDrive//Documents//Akshaya Agensy Inventory Items.xlsx"); // Replace with your file path

    for (const sheetName of workbook.SheetNames) {

      const category = await Category.findOne({ name: sheetName });
      if (!category) {
        console.log(`Category not found for sheet: ${sheetName}`);
        continue;
      }
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }); // defval = "" fills empty cells

      // 3. Prepare products
      const products = rows.map(row => ({
        name: row.name || "No Name",
        description: row.description || "",
        price: Number(row.price) || 0,
        stock: Number(row.stock) || 0,
        isFeatured: row.isFeatured === true || row.isFeatured === "true" || false,
        images: row.images ? row.images.split(",") : [], // comma-separated if any
        category: category._id
      }));

      // 4. Insert into MongoDB
      if (products.length > 0) {
        await Product.insertMany(products);
        console.log(`Inserted ${products.length} products from category: ${sheetName}`);
      }
    }

    console.log("All sheets imported successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error importing products:", err);
    mongoose.disconnect();
  }
};

// Run the script
importExcelToMongo();