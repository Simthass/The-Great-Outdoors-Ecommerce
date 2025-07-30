// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import contactRoute from './routes/contact.js'; // ✅ Use full path with .js

dotenv.config();

const app = express();

app.use(express.json()); // Parse incoming JSON

// Mount contact route
app.use('/api/contact', contactRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
