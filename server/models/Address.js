// models/address.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    addressType: {
      type: String,
      required: true,
      enum: ["Home", "Work", "Other"],
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "Canada",
    },
    isDefault: {
      type: Boolean,
      required: true,
      default: false,
    },
    phoneNumber: {
      type: String,
    },
    instructions: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default address per user
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose
      .model("Address")
      .updateMany(
        { user: this.user, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
  }
  next();
});

const Address =
  mongoose.models.Address || mongoose.model("Address", addressSchema);

export default Address;
