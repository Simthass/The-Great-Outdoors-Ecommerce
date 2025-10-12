// routes/events.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Event from "../models/Event.js";
import { notifyNewEvent } from "../utils/emailService.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for event image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads", "events");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
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
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Get all events (public)
router.get("/", async (req, res) => {
  try {
    const { category, difficulty, featured, upcoming } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured) query.featured = featured === "true";
    if (upcoming) query.date = { $gte: new Date() };

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new event (admin) - FIXED VERSION
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("🔄 Creating new event...");

    const eventData = {
      ...req.body,
      imageUrl: `/uploads/events/${req.file.filename}`,
      requirements: req.body.requirements
        ? JSON.parse(req.body.requirements)
        : [],
      includes: req.body.includes ? JSON.parse(req.body.includes) : [],
      organizer: req.body.organizer ? JSON.parse(req.body.organizer) : {},
    };

    const event = new Event(eventData);
    await event.save();

    console.log(
      `✅ Event created successfully: ${event.title} (ID: ${event._id})`
    );
    console.log(
      `📧 Starting notification process for category: ${event.category}`
    );

    // Send notifications to subscribers with proper error handling
    try {
      const eventObject = event.toObject();
      console.log("📤 Event data being sent for notifications:", {
        title: eventObject.title,
        category: eventObject.category,
        date: eventObject.date,
        time: eventObject.time,
        location: eventObject.location,
        price: eventObject.price,
      });

      // Call notification function and wait for it to complete with timeout
      const notificationPromise = notifyNewEvent(eventObject);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Notification timeout")), 30000); // 30 second timeout
      });

      Promise.race([notificationPromise, timeoutPromise])
        .then((sentCount) => {
          console.log(
            `📬 Event notifications completed: ${sentCount} emails sent`
          );
        })
        .catch((error) => {
          console.error("❌ Event notification error:", error.message);
          // Log more details for debugging
          console.error("❌ Full error:", error);
        });
    } catch (notificationError) {
      console.error(
        "❌ Immediate notification error:",
        notificationError.message
      );
      console.error("❌ Full notification error:", notificationError);
    }

    res.status(201).json(event);
  } catch (error) {
    console.error("❌ Event creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update event (admin)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.imageUrl = `/uploads/events/${req.file.filename}`;
    }

    if (req.body.requirements)
      updateData.requirements = JSON.parse(req.body.requirements);
    if (req.body.includes) updateData.includes = JSON.parse(req.body.includes);
    if (req.body.organizer)
      updateData.organizer = JSON.parse(req.body.organizer);

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    console.log(`📝 Event updated: ${event.title}`);
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event (admin)
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete image file
    const filePath = path.join(__dirname, "..", event.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Event.findByIdAndDelete(req.params.id);
    console.log(`🗑️ Event deleted: ${event.title}`);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register for event
router.post("/:id/register", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      event.maxParticipants &&
      event.currentParticipants >= event.maxParticipants
    ) {
      return res.status(400).json({ message: "Event is full" });
    }

    event.currentParticipants += 1;
    await event.save();

    console.log(`👤 New registration for event: ${event.title}`);
    res.json({ message: "Successfully registered for event", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
