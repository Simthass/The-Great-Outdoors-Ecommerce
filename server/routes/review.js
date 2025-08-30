import express from "express";
import multer from "multer";
import path from "path";
import Review from "../models/Review.js";

const router = express.Router();

// Configure multer for customer image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/customers/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "customer-" + uniqueSuffix + path.extname(file.originalname));
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

// Get homepage reviews
router.get("/homepage", async (req, res) => {
  try {
    const reviews = await Review.find({
      isHomepageReview: true,
      status: "Y",
    }).sort({ order: 1, createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews for admin
router.get("/admin", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create homepage review (admin only)
router.post("/homepage", upload.single("customerImage"), async (req, res) => {
  try {
    const { customerName, customerTitle, description, rating } = req.body;

    // Get the current max order for homepage reviews
    const maxOrderReview = await Review.findOne({
      isHomepageReview: true,
    }).sort({ order: -1 });
    const currentOrder = maxOrderReview ? maxOrderReview.order + 1 : 1;

    const review = new Review({
      customerName,
      customerTitle,
      description,
      rating: parseInt(rating),
      customerImage: req.file ? `/uploads/customers/${req.file.filename}` : "",
      isHomepageReview: true,
      order: currentOrder,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update homepage review
router.put(
  "/homepage/:id",
  upload.single("customerImage"),
  async (req, res) => {
    try {
      const { customerName, customerTitle, description, rating } = req.body;
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      review.customerName = customerName || review.customerName;
      review.customerTitle = customerTitle || review.customerTitle;
      review.description = description || review.description;
      review.rating = rating ? parseInt(rating) : review.rating;

      if (req.file) {
        review.customerImage = `/uploads/customers/${req.file.filename}`;
      }

      await review.save();
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete review
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reorder homepage reviews
router.put("/homepage/reorder", async (req, res) => {
  try {
    const { reviews } = req.body;
    for (let i = 0; i < reviews.length; i++) {
      await Review.findByIdAndUpdate(reviews[i]._id, { order: i });
    }
    res.json({ message: "Reviews reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
