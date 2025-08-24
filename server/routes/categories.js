import express from "express";
import Category from "../models/Category.js"; // adjust the path to your model

const router = express.Router();

// Initialize permanent categories (run once or at server start)
router.post("/init-default", async (req, res) => {
  try {
    const defaultCategories = [
      "Backpacks",
      "Climbing",
      "Camping",
      "Fishing",
      "Hiking",
      "Hunting",
      "Outfitting",
      "Hydration",
      "Knives & Multitools",
    ];

    for (let name of defaultCategories) {
      await Category.findOneAndUpdate(
        { categoryName: name },
        { categoryName: name },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Categories initialized successfully" });
  } catch (error) {
    console.error("Error initializing categories:", error);
    res.status(500).json({ message: "Error initializing categories" });
  }
});

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

export default router;
