import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js'; // Ensure the path is correct

dotenv.config();

const migrateProducts = async () => {
  try {
    // 1. Connect to Database
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your environment variables.");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 Connected to Database. Starting migration...");

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to process.\n`);

    let updatedCount = 0;

    for (let product of products) {
      let updates = {};
      let needsUpdate = false;

      // --- STAGE 1: IMAGE ARRAY MIGRATION ---
      // If images array is empty but old imageUrl exists, move it.
      if (product.imageUrl && (!product.images || product.images.length === 0)) {
        updates.images = [product.imageUrl];
        updates.$unset = { imageUrl: "" }; 
        needsUpdate = true;
      }

      // Determine the "source of truth" image for variants
      const effectiveImages = updates.images || product.images || [];
      const fallbackThumb = effectiveImages.length > 0 ? effectiveImages[0] : null;

      // --- STAGE 2: PRICE & STOCK LOGIC ---
      // If price is 0 and variants exist, set price to the lowest variant price
      if (product.price === 0 && product.variants?.length > 0) {
        const variantPrices = product.variants.map(v => v.price).filter(p => p > 0);
        if (variantPrices.length > 0) {
          updates.price = Math.min(...variantPrices);
          needsUpdate = true;
        }
      }

      // Calculate total stock from variants if stock is currently 0
      if (product.variants?.length > 0) {
        const totalVariantStock = product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
        if (product.stock === 0 && totalVariantStock > 0) {
          updates.stock = totalVariantStock;
          needsUpdate = true;
        }
      }

      // --- STAGE 3: VARIANT CLEANUP ---
      // Standardize variant objects to match new sub-schema
      if (product.hasVariants && product.variants?.length > 0) {
        updates.variants = product.variants.map(v => ({
          name: v.name,
          price: Number(v.price),
          stock: Number(v.stock) || 0,
          // Assign product image to variant if variant has no specific image
          imageUrl: v.imageUrl || fallbackThumb
        }));
        needsUpdate = true;
      }

      // --- STAGE 4: EXECUTION ---
      if (needsUpdate) {
        await Product.updateOne({ _id: product._id }, updates);
        console.log(`✅ Updated: ${product.name}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped (Already Updated): ${product.name}`);
      }
    }

    console.log(`\n✨ Migration complete! Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
};

migrateProducts();