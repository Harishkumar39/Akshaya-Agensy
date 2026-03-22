import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI

const updateProductCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const products = await Product.find({});
    // console.log(products)
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      // Assuming the product.category currently stores theAC slug

      if (mongoose.Types.ObjectId.isValid(product.category)) {
        console.log(`Product "${product.name}" already has ObjectId category`);
        continue;
      }


      const categoryName = product.category;
      if(!categoryName){
        console.warn(`Product "${product.name}" has no category`);
        continue;
      }
      const category = await Category.findOne({ name: categoryName });

      if (category) {
        product.category = category._id;
        await product.save();
        console.log(`Updated product "${product.name}" to category ID ${category._id}`);
      } else {
        console.warn(`Category not found for slug: ${categoryName} (Product: ${product.name})`);
      }
    }

    console.log("All products updated!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating products:", error);
    process.exit(1);
  }
};

updateProductCategories();