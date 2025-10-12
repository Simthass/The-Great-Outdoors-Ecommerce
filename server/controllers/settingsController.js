// controllers/settingsController.js
import User from "../models/User.js";
import Address from "../models/Address.js";
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user addresses separately for better control
    const addresses = await Address.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    // Get recent orders
    const orders = await Order.find({ user: req.user._id })
      .sort({ orderDate: -1 })
      .limit(10)
      .select("_id orderId orderDate totalAmount orderStatus items")
      .lean();

    // Ensure proper notification structure
    const notifications = user.notifications || {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: true,
      orderUpdates: true,
      promotions: false,
    };

    res.json({
      success: true,
      notifications: notifications,
      addresses: addresses || [],
      orders: orders || [],
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error getting user settings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      orderUpdates,
      promotions,
    } = req.body;

    console.log("Received notification update request:", req.body);

    // Validate input and set defaults
    const notifications = {
      emailNotifications:
        emailNotifications !== undefined ? emailNotifications : true,
      pushNotifications:
        pushNotifications !== undefined ? pushNotifications : false,
      smsNotifications:
        smsNotifications !== undefined ? smsNotifications : true,
      orderUpdates: orderUpdates !== undefined ? orderUpdates : true,
      promotions: promotions !== undefined ? promotions : false,
    };

    console.log("Processed notifications object:", notifications);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update notifications
    user.notifications = notifications;
    user.markModified("notifications");

    const updatedUser = await user.save();

    console.log("Updated user notifications:", updatedUser.notifications);

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      data: {
        notifications: updatedUser.notifications,
      },
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
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
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
      data: {
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Address management
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Error getting addresses:", error);
    res.status(500).json({
      success: false,
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
        success: false,
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
      addressType: addressType || "Home",
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
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      success: false,
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
        success: false,
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
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
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
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
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

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
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
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({
      success: false,
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
      .populate("items.product", "name images price")
      .lean();

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get help information
export const getHelpInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        contactEmail: "support@yourapp.com",
        contactPhone: "1-800-123-4567",
        faqLink: "https://yourapp.com/faq",
        liveChatAvailable: true,
        supportHours: "Monday - Friday: 9AM - 6PM",
        responseTime: "Within 24 hours",
      },
    });
  } catch (error) {
    console.error("Error getting help info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch help information",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
