import express from "express";
import multer from "multer";
import path from "path";
import Banner from "../models/Banner.js";

const router = express.Router();

// Configure multer for banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/banners/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "banner-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get all banners
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple banners
router.post("/upload", upload.array("banners", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Get the current max order
    const maxOrderBanner = await Banner.findOne().sort({ order: -1 });
    let currentOrder = maxOrderBanner ? maxOrderBanner.order : 0;

    const banners = [];
    for (const file of req.files) {
      currentOrder++;
      const banner = new Banner({
        imageUrl: `/uploads/banners/${file.filename}`,
        title: req.body.title || "",
        description: req.body.description || "",
        order: currentOrder,
      });
      await banner.save();
      banners.push(banner);
    }

    res.status(201).json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete banner
router.delete("/:id", async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle banner active status
router.put("/:id/toggle", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reorder banners
router.put("/reorder", async (req, res) => {
  try {
    const { banners } = req.body;
    for (let i = 0; i < banners.length; i++) {
      await Banner.findByIdAndUpdate(banners[i]._id, { order: i });
    }
    res.json({ message: "Banners reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
