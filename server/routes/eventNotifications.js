import express from "express";
import EventSubscriber from "../models/EventSubscriber.js";
import { sendEventNotificationEmail } from "../utils/emailService.js";

const router = express.Router();

// Subscribe to event notifications
router.post("/subscribe", async (req, res) => {
  try {
    const { email, preferredActivities = ["all"] } = req.body;

    // Check if email already exists
    const existingSubscriber = await EventSubscriber.findOne({ email });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.preferredActivities = preferredActivities;
        await existingSubscriber.save();
        return res.json({
          message:
            "Welcome back! Your event notifications have been reactivated.",
        });
      } else {
        return res.status(400).json({
          message: "You're already subscribed to our event notifications!",
        });
      }
    }

    // Create new subscription
    const subscriber = new EventSubscriber({
      email,
      preferredActivities,
    });

    await subscriber.save();

    // Send welcome email
    await sendEventNotificationEmail(email, "welcome", {
      email,
      unsubscribeToken: subscriber.unsubscribeToken,
    });

    res.status(201).json({
      message:
        "Successfully subscribed! You'll receive notifications about new outdoor events.",
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({
      message: "Failed to subscribe. Please try again.",
    });
  }
});

// Unsubscribe from notifications
router.get("/unsubscribe/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const subscriber = await EventSubscriber.findOne({
      unsubscribeToken: token,
    });

    if (!subscriber) {
      return res.status(404).json({ message: "Invalid unsubscribe link" });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({ message: "Successfully unsubscribed from event notifications" });
  } catch (error) {
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

// Get subscription status (optional - for admin)
router.get("/stats", async (req, res) => {
  try {
    const totalSubscribers = await EventSubscriber.countDocuments({
      isActive: true,
    });
    const subscribersByActivity = await EventSubscriber.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$preferredActivities" },
      { $group: { _id: "$preferredActivities", count: { $sum: 1 } } },
    ]);

    res.json({
      totalSubscribers,
      subscribersByActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
