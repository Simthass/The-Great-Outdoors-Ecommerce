
import contactRoute from './routes/contact.js'; // ✅ Use full path with .js

app.use(express.json()); // Parse incoming JSON

// Mount contact route
app.use('/api/contact', contactRoute);
