// models/EventSubscriber.js
import mongoose from "mongoose";

const eventSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    preferredActivities: [
      {
        type: String,
        enum: [
          "hiking",
          "camping",
          "climbing",
          "fishing",
          "hunting",
          "workshop",
          "all",
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriptionDate: {
      type: Date,
      default: Date.now,
    },
    unsubscribeToken: {
      type: String,
      unique: true,
      default: () =>
        Math.random().toString(36).substring(2) + Date.now().toString(36),
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EventSubscriber", eventSubscriberSchema);
