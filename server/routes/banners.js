// routes/banners.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import your Banner model
import Banner from "../models/Banner.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Fix the path to create uploads/banners in the root directory
    const uploadPath = path.join(__dirname, "..", "uploads", "banners");
    console.log("Upload path:", uploadPath); // Debug log

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("Created directory:", uploadPath); // Debug log
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    console.log("Generated filename:", filename); // Debug log
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("File being uploaded:", file.originalname); // Debug log
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
});

// Get all banners
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple banners
router.post("/upload", upload.array("banners", 10), async (req, res) => {
  try {
    console.log("Files received:", req.files); // Debug log

    const bannerPromises = req.files.map((file, index) => {
      const imageUrl = `/uploads/banners/${file.filename}`;
      console.log("Saving banner with imageUrl:", imageUrl); // Debug log

      return new Banner({
        imageUrl,
        title: req.body.titles ? req.body.titles[index] : "",
        description: req.body.descriptions ? req.body.descriptions[index] : "",
        order: index + 1,
        isActive: true,
      }).save();
    });

    const banners = await Promise.all(bannerPromises);
    console.log("Banners saved:", banners.length); // Debug log
    res.status(201).json(banners);
  } catch (error) {
    console.error("Upload error:", error); // Debug log
    res.status(500).json({ message: error.message });
  }
});

// Update banner order
router.put("/reorder", async (req, res) => {
  try {
    const { banners } = req.body;

    const updatePromises = banners.map((banner, index) =>
      Banner.findByIdAndUpdate(banner._id, { order: index + 1 })
    );

    await Promise.all(updatePromises);
    res.json({ message: "Banner order updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete banner
router.delete("/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", banner.imageUrl);
    console.log("Deleting file:", filePath); // Debug log

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File deleted successfully"); // Debug log
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error); // Debug log
    res.status(500).json({ message: error.message });
  }
});

// Toggle banner active status
router.put("/:id/toggle", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
