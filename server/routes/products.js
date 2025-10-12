import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { syncInventoryStatus } from "../middleware/inventorySync.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "public/products";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5, // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "categoryName")
      .populate("inventory", "quantity status")
      .sort({ createdAt: -1 });

    // Add full image URL to each product
    const productsWithImageUrls = products.map((product) => {
      const productObj = product.toObject();
      if (productObj.imageUrl) {
        // Make sure the imageUrl starts with /
        if (!productObj.imageUrl.startsWith("/")) {
          productObj.imageUrl = "/" + productObj.imageUrl;
        }
      }
      return productObj;
    });

    res.json(productsWithImageUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "categoryName")
      .populate("inventory", "quantity status lowStockThreshold"); // Populate inventory data

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new product
// CREATE new product
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      category,
      productName,
      description,
      price,
      weight,
      dimensions,
      brand,
      color,
      size,
      isFeatured,
      isHotThisWeek,
      inventory,
    } = req.body;

    // Validate required fields
    if (!category || !productName || !description || !price || !brand) {
      // Clean up uploaded files if validation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      }
      return res.status(400).json({
        message:
          "Category, product name, description, price, and brand are required",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      // Clean up uploaded files if category doesn't exist
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      }
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const productData = {
      category,
      productName,
      description,
      price: parseFloat(price),
      brand,
      weight: weight ? parseFloat(weight) : undefined,
      dimensions,
      color,
      size,
      isActive: true,
      isFeatured: isFeatured === "true",
      isHotThisWeek: isHotThisWeek === "true",
      inventory: inventory || undefined,
    };

    // Add image URLs if files were uploaded
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(
        (file) => `/products/${file.filename}`
      );
      // For backward compatibility, set the first image as imageUrl
      productData.imageUrl = `/products/${req.files[0].filename}`;
    }

    const product = new Product(productData);
    const savedProduct = await product.save();

    if (inventory) {
      await syncInventoryStatus(inventory);
    }
    // Populate category info before sending response
    await savedProduct.populate("category", "categoryName");

    res.status(201).json(savedProduct);
  } catch (error) {
    // Clean up uploaded files if product creation failed
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product
// UPDATE product
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const {
      category,
      productName,
      description,
      price,
      weight,
      dimensions,
      brand,
      color,
      size,
      isActive,
      isFeatured,
      isHotThisWeek,
      inventory,
      existingImages = "[]", // JSON string of existing images
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      // Clean up uploaded files if product not found
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      }
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse existing images
    let existingImagesArray = [];
    try {
      existingImagesArray = JSON.parse(existingImages);
    } catch (e) {
      console.error("Error parsing existing images:", e);
    }

    // Check if category exists (if provided)
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        // Clean up uploaded files if category doesn't exist
        if (req.files && req.files.length > 0) {
          req.files.forEach((file) => {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          });
        }
        return res.status(400).json({ message: "Invalid category ID" });
      }
    }

    // Update fields
    const updateData = {};
    if (category) updateData.category = category;
    if (productName) updateData.productName = productName;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (weight !== undefined && weight !== "")
      updateData.weight = parseFloat(weight);
    if (dimensions) updateData.dimensions = dimensions;
    if (brand) updateData.brand = brand;
    if (color) updateData.color = color;
    if (size) updateData.size = size;
    if (isActive !== undefined) updateData.isActive = isActive === "true";
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === "true";
    if (isHotThisWeek !== undefined)
      updateData.isHotThisWeek = isHotThisWeek === "true";
    if (inventory !== undefined) {
      updateData.inventory = inventory || undefined;
    }

    // Handle images update
    if (req.files && req.files.length > 0) {
      // Combine existing images with new ones
      const newImageUrls = req.files.map(
        (file) => `/products/${file.filename}`
      );
      updateData.images = [...existingImagesArray, ...newImageUrls];

      // For backward compatibility, set the first image as imageUrl
      updateData.imageUrl = updateData.images[0];
    } else if (existingImagesArray.length > 0) {
      updateData.images = existingImagesArray;
      updateData.imageUrl = existingImagesArray[0];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "categoryName");

    if (updateData.inventory) {
      await syncInventoryStatus(updateData.inventory);
    }
    res.json(updatedProduct);
  } catch (error) {
    // Clean up uploaded files if update failed
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }
    res.status(400).json({ message: error.message });
  }
});
// Rest of your routes remain the same...
// DELETE, GET single product, GET categories routes
// Add this to your routes/products.js file

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the image file if it exists
    if (product.imageUrl) {
      const imagePath = path.join(process.cwd(), "public", product.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image file:", err);
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add to routes/products.js
router.delete("/:id/inventory", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.inventory = undefined;
    product.stockStatus = "in_stock"; // Reset to default
    await product.save();

    res.json({
      success: true,
      message: "Inventory link removed successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Add this route to manually link a product to inventory
router.post("/:productId/link-inventory/:inventoryId", async (req, res) => {
  try {
    const { productId, inventoryId } = req.params;

    const product = await Product.findById(productId);
    const inventory = await Inventory.findById(inventoryId);

    if (!product || !inventory) {
      return res.status(404).json({
        success: false,
        message: "Product or inventory not found",
      });
    }

    // Link the inventory to the product
    product.inventory = inventoryId;
    await product.save();

    // Sync the status immediately
    const stockStatus = await syncInventoryStatus(inventoryId);

    res.json({
      success: true,
      message: "Product linked to inventory successfully",
      product: product,
      stockStatus: stockStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// GET single product (if you don't have this)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "categoryName"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
