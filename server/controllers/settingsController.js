// controllers/settingsController.js
import User from "../models/User.js";
import Address from "../models/address.js";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper function to handle settings updates
const updateUserSettings = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  Object.keys(updates).forEach((key) => {
    user[key] = updates[key];
    user.markModified(key);
  });

  return await user.save();
};

// Get all user settings
export const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate("addresses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders = await Order.find({ user: req.user._id })
      .sort({ orderDate: -1 })
      .limit(5)
      .select("_id orderId orderDate totalAmount orderStatus items")
      .lean();

    res.json({
      notifications: user.notifications || {
        email: true,
        push: false,
        sms: true,
        orders: true,
        promotions: false,
      },
      appearance: user.appearance || {
        theme: "light",
        language: "english",
        fontSize: "medium",
      },
      addresses: user.addresses || [],
      orders: orders || [],
    });
  } catch (error) {
    console.error("Error getting user settings:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res) => {
  try {
    const { email, push, sms, orders, promotions } = req.body;

    // Validate input
    if (
      typeof email !== "boolean" ||
      typeof push !== "boolean" ||
      typeof sms !== "boolean" ||
      typeof orders !== "boolean" ||
      typeof promotions !== "boolean"
    ) {
      return res.status(400).json({
        message: "All notification settings must be boolean values",
      });
    }

    const updatedUser = await updateUserSettings(req.user._id, {
      notifications: { email, push, sms, orders, promotions },
    });

    res.json({
      message: "Notification settings updated successfully",
      notifications: updatedUser.notifications,
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({
      message: "Failed to update notification settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update appearance settings
export const updateAppearanceSettings = async (req, res) => {
  try {
    const { theme, language, fontSize } = req.body;

    // Validate input
    const validThemes = ["light", "dark", "system"];
    const validLanguages = ["english", "spanish", "french", "german"];
    const validFontSizes = ["small", "medium", "large"];

    if (
      !validThemes.includes(theme) ||
      !validLanguages.includes(language) ||
      !validFontSizes.includes(fontSize)
    ) {
      return res.status(400).json({
        message: "Invalid appearance settings values",
      });
    }

    const updatedUser = await updateUserSettings(req.user._id, {
      appearance: { theme, language, fontSize },
    });

    res.json({
      message: "Appearance settings updated successfully",
      appearance: updatedUser.appearance,
    });
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    res.status(500).json({
      message: "Failed to update appearance settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password updated successfully",
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      message: "Failed to update password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Address management
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).lean();
    res.json(addresses);
  } catch (error) {
    console.error("Error getting addresses:", error);
    res.status(500).json({
      message: "Failed to fetch addresses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const addAddress = async (req, res) => {
  try {
    const {
      addressType,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Validate required fields
    if (!addressType || !addressLine1 || !city || !province || !postalCode) {
      return res.status(400).json({
        message: "Missing required address fields",
      });
    }

    // If this is set as default, update all other addresses to not be default
    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    const address = new Address({
      user: req.user._id,
      addressType,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      province,
      postalCode,
      country: country || "Canada",
      isDefault: isDefault || false,
    });

    await address.save();

    // Add address to user's addresses array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address._id },
    });

    res.status(201).json({
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      message: "Failed to add address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const {
      addressType,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Validate required fields
    if (!addressType || !addressLine1 || !city || !province || !postalCode) {
      return res.status(400).json({
        message: "Missing required address fields",
      });
    }

    // If this is set as default, update all other addresses to not be default
    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id, _id: { $ne: req.params.id } },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        addressType,
        addressLine1,
        addressLine2: addressLine2 || "",
        city,
        province,
        postalCode,
        country: country || "Canada",
        isDefault: isDefault || false,
      },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      message: "Failed to update address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Remove address from user's addresses array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: address._id },
    });

    // If this was the default address, set another address as default
    if (address.isDefault) {
      const remainingAddress = await Address.findOne({ user: req.user._id });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      message: "Failed to delete address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    // First, set all addresses for this user to not default
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );

    // Then set the specified address as default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({
      message: "Failed to set default address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ orderDate: -1 })
      .select("_id orderId orderDate totalAmount orderStatus items")
      .lean();

    res.json(orders);
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get help information
export const getHelpInfo = async (req, res) => {
  try {
    res.json({
      contactEmail: "support@yourapp.com",
      contactPhone: "1-800-123-4567",
      faqLink: "https://yourapp.com/faq",
      liveChatAvailable: true,
    });
  } catch (error) {
    console.error("Error getting help info:", error);
    res.status(500).json({
      message: "Failed to fetch help information",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
