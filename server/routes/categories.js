import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// GET all active categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ categoryName: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new category
router.post("/", async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      categoryName: { $regex: new RegExp('^' + categoryName + '$', 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      categoryName: categoryName.trim(),
      description: description?.trim(),
      isActive: true,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Category already exists" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// UPDATE category
router.put("/:id", async (req, res) => {
  try {
    const { categoryName, description, isActive } = req.body;

    const updateData = {};
    if (categoryName) updateData.categoryName = categoryName.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Category name already exists" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Instead of hard delete, soft delete by setting isActive to false
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Category deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize default categories
router.post("/init-default", async (req, res) => {
  try {
    const defaultCategories = [
      { categoryName: "Hiking", description: "Hiking gear and equipment" },
      { categoryName: "Climbing", description: "Rock climbing and mountaineering equipment" },
      { categoryName: "Hunting", description: "Hunting accessories and gear" },
      { categoryName: "Camping", description: "Camping equipment and outdoor shelter" },
      { categoryName: "Fishing", description: "Fishing rods, reels, and accessories" },
      { categoryName: "Backpacks", description: "Outdoor and adventure backpacks" },
      { categoryName: "Navigation", description: "GPS devices, compasses, and maps" },
      { categoryName: "Clothing", description: "Outdoor and adventure clothing" },
    ];

    const existingCategories = await Category.find({});
    
    if (existingCategories.length === 0) {
      await Category.insertMany(defaultCategories);
      res.json({ message: "Default categories created successfully" });
    } else {
      res.json({ message: "Categories already exist" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;