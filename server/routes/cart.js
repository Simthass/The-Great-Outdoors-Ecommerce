import express from 'express';
const router = express.Router();

// In-memory cart storage (for demo purposes)
// In production, you might want to use Redis, MongoDB sessions, or user-specific storage
let carts = {};

// GET cart by session/user ID
router.get('/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const cart = carts[sessionId] || { items: [], totalAmount: 0 };
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD item to cart
router.post('/:sessionId/add', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { productId, productName, price, quantity = 1 } = req.body;

        if (!productId || !productName || !price) {
            return res.status(400).json({ 
                message: 'Product ID, name, and price are required' 
            });
        }

        // Initialize cart if it doesn't exist
        if (!carts[sessionId]) {
            carts[sessionId] = { items: [], totalAmount: 0 };
        }

        const cart = carts[sessionId];
        
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].total = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
        } else {
            // Add new item to cart
            cart.items.push({
                productId,
                productName,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                total: parseFloat(price) * parseInt(quantity)
            });
        }

        // Recalculate total amount
        cart.totalAmount = cart.items.reduce((total, item) => total + item.total, 0);

        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE item quantity in cart
router.put('/:sessionId/item/:productId', (req, res) => {
    try {
        const { sessionId, productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return res.status(400).json({ message: 'Valid quantity is required' });
        }

        if (!carts[sessionId]) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cart = carts[sessionId];
        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity === 0) {
            // Remove item if quantity is 0
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = parseInt(quantity);
            cart.items[itemIndex].total = cart.items[itemIndex].quantity * cart.items[itemIndex].price;
        }

        // Recalculate total amount
        cart.totalAmount = cart.items.reduce((total, item) => total + item.total, 0);

        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// REMOVE item from cart
router.delete('/:sessionId/item/:productId', (req, res) => {
    try {
        const { sessionId, productId } = req.params;

        if (!carts[sessionId]) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cart = carts[sessionId];
        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Remove item
        cart.items.splice(itemIndex, 1);

        // Recalculate total amount
        cart.totalAmount = cart.items.reduce((total, item) => total + item.total, 0);

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CLEAR entire cart
router.delete('/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        carts[sessionId] = { items: [], totalAmount: 0 };
        
        res.json({ message: 'Cart cleared successfully', cart: carts[sessionId] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CHECKOUT - Convert cart to order
router.post('/:sessionId/checkout', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { customerInfo } = req.body;

        if (!carts[sessionId] || carts[sessionId].items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        if (!customerInfo) {
            return res.status(400).json({ message: 'Customer information is required' });
        }

        const cart = carts[sessionId];
        
        // Create order data
        const orderData = {
            customerInfo,
            items: cart.items,
            totalAmount: cart.totalAmount
        };

        // Here you would typically create an order using your Order model
        // For now, we'll just return the order data
        // You can integrate this with the orders route later

        // Clear cart after checkout
        carts[sessionId] = { items: [], totalAmount: 0 };

        res.json({
            message: 'Checkout successful',
            orderData,
            cart: carts[sessionId]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
