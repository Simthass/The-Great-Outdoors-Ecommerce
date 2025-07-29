import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

// CREATE new product
router.post("/", upload.single("image"), async (req, res) => {
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
    } = req.body;

    // Validate required fields
    if (!category || !productName || !description || !price || !brand) {
      return res.status(400).json({
        message:
          "Category, product name, description, price, and brand are required",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
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
    };

    // Add image URL if file was uploaded
    if (req.file) {
      productData.imageUrl = `/products/${req.file.filename}`;
    }

    const product = new Product(productData);
    const savedProduct = await product.save();

    // Populate category info before sending response
    await savedProduct.populate("category", "categoryName");

    res.status(201).json(savedProduct);
  } catch (error) {
    // Clean up uploaded file if product creation failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product
router.put("/:id", upload.single("image"), async (req, res) => {
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
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if category exists (if provided)
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
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

    // Handle image update
    if (req.file) {
      // Delete old image if it exists
      if (product.imageUrl) {
        const oldImagePath = path.join("public", product.imageUrl);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      updateData.imageUrl = `/products/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "categoryName");

    res.json(updatedProduct);
  } catch (error) {
    // Clean up uploaded file if update failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
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
