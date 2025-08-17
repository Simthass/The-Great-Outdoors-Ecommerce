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
    fileSize: 10 * 1024 * 1024, // 10MB
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

// CREATE new product - JSON version (no image)
router.post("/json", async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT (JSON) ===");
    console.log("Request body:", req.body);

    const { category, productName, description, price, brand } = req.body;

    // Validate required fields
    if (!category || !productName || !description || !price || !brand) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be provided",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
    }

    const productData = {
      category,
      productName: productName.trim(),
      description: description.trim(),
      price: parseFloat(price),
      brand: brand.trim(),
      isActive: true,
    };

    // Add optional fields
    if (req.body.weight && req.body.weight.toString().trim() !== "") {
      productData.weight = parseFloat(req.body.weight);
    }
    if (req.body.dimensions && req.body.dimensions.trim() !== "") {
      productData.dimensions = req.body.dimensions.trim();
    }
    if (req.body.color && req.body.color.trim() !== "") {
      productData.color = req.body.color.trim();
    }
    if (req.body.size && req.body.size.trim() !== "") {
      productData.size = req.body.size.trim();
    }

    console.log("Creating product:", productData);

    const product = new Product(productData);
    const savedProduct = await product.save();
    await savedProduct.populate("category", "categoryName");

    console.log("Product created successfully:", savedProduct._id);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product (JSON):", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// UPDATE product - JSON version (no image)
router.put("/json/:id", async (req, res) => {
  try {
    console.log("=== UPDATE PRODUCT (JSON) ===");
    console.log("Product ID:", req.params.id);
    console.log("Request body:", req.body);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Build update data
    const updateData = {};

    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      updateData.category = req.body.category;
    }

    if (req.body.productName)
      updateData.productName = req.body.productName.trim();
    if (req.body.description)
      updateData.description = req.body.description.trim();
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.brand) updateData.brand = req.body.brand.trim();

    // Optional fields - handle empty strings properly
    if (req.body.weight !== undefined) {
      updateData.weight =
        req.body.weight && req.body.weight.toString().trim() !== ""
          ? parseFloat(req.body.weight)
          : undefined;
    }
    if (req.body.dimensions !== undefined) {
      updateData.dimensions =
        req.body.dimensions && req.body.dimensions.trim() !== ""
          ? req.body.dimensions.trim()
          : undefined;
    }
    if (req.body.color !== undefined) {
      updateData.color =
        req.body.color && req.body.color.trim() !== ""
          ? req.body.color.trim()
          : undefined;
    }
    if (req.body.size !== undefined) {
      updateData.size =
        req.body.size && req.body.size.trim() !== ""
          ? req.body.size.trim()
          : undefined;
    }

    console.log("Update data:", updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "categoryName");

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found after update" });
    }

    console.log("Product updated successfully:", updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product (JSON):", error);
    res.status(500).json({ message: error.message });
  }
});

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "categoryName")
      .sort({ createdAt: -1 });

    const productsWithImageUrls = products.map((product) => {
      const productObj = product.toObject();
      if (productObj.imageUrl) {
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

// CREATE new product WITH IMAGE - multipart version
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT WITH IMAGE ===");
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { category, productName, description, price, brand } = req.body;

    // Validate required fields
    const requiredFields = { category, productName, description, price, brand };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === "") {
        console.log(`Missing field: ${field}`);
        return res.status(400).json({
          success: false,
          error: `${field} is required`,
        });
      }
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      console.log("Category not found:", category);
      return res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
    }

    const productData = {
      category,
      productName: productName.trim(),
      description: description.trim(),
      price: parseFloat(price),
      brand: brand.trim(),
      isActive: true,
    };

    // Add optional fields
    if (req.body.weight && req.body.weight.trim() !== "") {
      productData.weight = parseFloat(req.body.weight);
    }
    if (req.body.dimensions && req.body.dimensions.trim() !== "") {
      productData.dimensions = req.body.dimensions.trim();
    }
    if (req.body.color && req.body.color.trim() !== "") {
      productData.color = req.body.color.trim();
    }
    if (req.body.size && req.body.size.trim() !== "") {
      productData.size = req.body.size.trim();
    }

    // Add image URL if file was uploaded
    if (req.file) {
      productData.imageUrl = `/products/${req.file.filename}`;
      console.log("Image saved as:", productData.imageUrl);
    }

    console.log("Final product data:", productData);

    const product = new Product(productData);
    const savedProduct = await product.save();
    await savedProduct.populate("category", "categoryName");

    console.log("Product saved successfully:", savedProduct._id);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("=== ERROR CREATING PRODUCT WITH IMAGE ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Clean up uploaded file if it exists
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// UPDATE product WITH IMAGE - multipart version
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("=== UPDATE PRODUCT WITH IMAGE ===");
    console.log("Product ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Build update data
    const updateData = {};

    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      updateData.category = req.body.category;
    }

    if (req.body.productName)
      updateData.productName = req.body.productName.trim();
    if (req.body.description)
      updateData.description = req.body.description.trim();
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.brand) updateData.brand = req.body.brand.trim();

    // Optional fields
    if (req.body.weight !== undefined && req.body.weight !== "") {
      updateData.weight = parseFloat(req.body.weight);
    }
    if (req.body.dimensions) updateData.dimensions = req.body.dimensions.trim();
    if (req.body.color) updateData.color = req.body.color.trim();
    if (req.body.size) updateData.size = req.body.size.trim();
    if (req.body.isActive !== undefined)
      updateData.isActive = req.body.isActive === "true";

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

    console.log("Update data:", updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "categoryName");

    console.log("Product updated successfully:", updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error("=== ERROR UPDATING PRODUCT WITH IMAGE ===");
    console.error("Error:", error);

    // Clean up uploaded file if update failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// Keep your existing DELETE and GET single product routes
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
