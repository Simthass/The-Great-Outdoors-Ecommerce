// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 150,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  maxParticipants: {
    type: Number,
    default: null,
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: [
      "hiking",
      "camping",
      "climbing",
      "fishing",
      "hunting",
      "workshop",
      "other",
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  registrationDeadline: {
    type: Date,
  },
  requirements: [
    {
      type: String,
    },
  ],
  includes: [
    {
      type: String,
    },
  ],
  organizer: {
    name: String,
    contact: String,
    email: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Event", eventSchema);
