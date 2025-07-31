import express from 'express';
const router = express.Router();
import Order from '../models/Order';

// GET all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET order by order ID
router.get('/order/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE new order
router.post('/', async (req, res) => {
    try {
        const {
            customerInfo,
            items,
            totalAmount,
            notes
        } = req.body;

        // Validate required fields
        if (!customerInfo || !items || !totalAmount) {
            return res.status(400).json({ 
                message: 'Customer info, items, and total amount are required' 
            });
        }

        // Calculate total amount from items
        let calculatedTotal = 0;
        items.forEach(item => {
            item.total = item.quantity * item.price;
            calculatedTotal += item.total;
        });

        const order = new Order({
            customerInfo,
            items,
            totalAmount: calculatedTotal,
            notes
        });

        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE order
router.put('/:id', async (req, res) => {
    try {
        const {
            customerInfo,
            items,
            totalAmount,
            status,
            paymentStatus,
            deliveryDate,
            notes
        } = req.body;

        // Calculate total if items are provided
        let calculatedTotal = totalAmount;
        if (items) {
            calculatedTotal = 0;
            items.forEach(item => {
                item.total = item.quantity * item.price;
                calculatedTotal += item.total;
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                customerInfo,
                items,
                totalAmount: calculatedTotal,
                status,
                paymentStatus,
                deliveryDate,
                notes
            },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE order
router.delete('/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET orders by status
router.get('/status/:status', async (req, res) => {
    try {
        const orders = await Order.find({ status: req.params.status }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;