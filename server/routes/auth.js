import express from 'express';
const router = express.Router();

// A simple test route for authentication
router.get('/', (req, res) => {
  res.send('Auth API route works!');
});

export default router;