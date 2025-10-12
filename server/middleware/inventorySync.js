import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

export const syncInventoryStatus = async (inventoryId) => {
  try {
    console.log(`🔄 Syncing inventory status for ID: ${inventoryId}`);

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      console.log(`❌ Inventory not found for ID: ${inventoryId}`);
      return null;
    }

    console.log(
      `📦 Inventory found: ${inventory.name}, Quantity: ${inventory.quantity}, Threshold: ${inventory.lowStockThreshold}`
    );

    // Determine stock status based on quantity
    let stockStatus = "in_stock";
    let inventoryStatus = "normal";

    if (inventory.quantity === 0) {
      stockStatus = "out_of_stock";
      inventoryStatus = "out";
    } else if (inventory.quantity <= inventory.lowStockThreshold) {
      stockStatus = "low_stock";
      inventoryStatus = "low";
    }

    console.log(
      `📊 Determined status: stockStatus=${stockStatus}, inventoryStatus=${inventoryStatus}`
    );

    // Update inventory status field
    if (inventory.status !== inventoryStatus) {
      inventory.status = inventoryStatus;
      await inventory.save();
      console.log(`✅ Updated inventory status to: ${inventoryStatus}`);
    }

    // Find products linked to this inventory first
    const linkedProducts = await Product.find({ inventory: inventoryId });
    console.log(
      `🔗 Found ${linkedProducts.length} products linked to inventory ${inventoryId}`
    );

    if (linkedProducts.length === 0) {
      console.log(`⚠️ No products are linked to inventory ${inventoryId}`);
      return stockStatus;
    }

    // Log current product statuses
    linkedProducts.forEach((product) => {
      console.log(
        `📱 Product: ${product.productName}, Current Status: ${product.stockStatus}, ID: ${product._id}`
      );
    });

    // Update all products linked to this inventory
    const updateResult = await Product.updateMany(
      { inventory: inventoryId },
      { stockStatus }
    );

    console.log(
      `✅ Updated ${updateResult.modifiedCount} products with stock status: ${stockStatus}`
    );

    // Verify the update
    const updatedProducts = await Product.find({ inventory: inventoryId });
    updatedProducts.forEach((product) => {
      console.log(
        `✨ After update - Product: ${product.productName}, New Status: ${product.stockStatus}`
      );
    });

    return stockStatus;
  } catch (error) {
    console.error("❌ Error syncing inventory status:", error);
    throw error;
  }
};

// Fixed middleware to sync after inventory updates
// In middleware/inventorySync.js
export const inventoryUpdateMiddleware = async (req, res, next) => {
  // Store original response methods
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function (data) {
    // Call original method
    const result = originalJson.call(this, data);

    // Only sync if the response was successful
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const inventoryId = req.params.id || (data && data.data && data.data._id);
      if (inventoryId) {
        // Run sync in background
        setImmediate(async () => {
          try {
            await syncInventoryStatus(inventoryId);
          } catch (err) {
            console.error("Background inventory sync failed:", err);
          }
        });
      }
    }
    return result;
  };

  res.send = function (data) {
    // Call original method
    const result = originalSend.call(this, data);

    // Only sync if the response was successful
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const inventoryId =
        req.params.id ||
        (typeof data === "object" && data.data && data.data._id);
      if (inventoryId) {
        // Run sync in background
        setImmediate(async () => {
          try {
            await syncInventoryStatus(inventoryId);
          } catch (err) {
            console.error("Background inventory sync failed:", err);
          }
        });
      }
    }
    return result;
  };

  next();
};

export const syncAllInventoryStatus = async () => {
  try {
    console.log("🔄 Syncing all inventory status with products...");

    const allInventory = await Inventory.find({});
    for (const inventory of allInventory) {
      await syncInventoryStatus(inventory._id);
    }

    console.log("✅ All inventory status synced with products");
  } catch (error) {
    console.error("Error syncing all inventory status:", error);
  }
};
