import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";
import connectDB from "../config/db.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const categories = [
  "Office Envelopes",
  "Cloth Cover",
  "Bubble Cover",
  "Office Files",
  "Folder Files",
  "Copier Papers",
  "Classmate Binded",
  "Normal Accounts Register",
  "Leather Binding Register",
  "Oswal Accounts Register",
  "General Stationeries",
  "NotePad",
  "Billing Paper & Roll",
  "Table & Exam Pad",
  "White & Black Board",
];

const importCategories = async () => {
  try {
    for (let name of categories) {
      const slug = name.toLowerCase().replace(/ /g, "-");
      const exists = await Category.findOne({ slug });
      if (!exists) {
        await Category.create({ name, slug });
        console.log(`Created category: ${name}`);
      } else {
        console.log(`Category already exists: ${name}`);
      }
    }
    console.log("All categories processed.");
    process.exit();
  } catch (error) {
    console.error("Error importing categories:", error);
    process.exit(1);
  }
};

importCategories();