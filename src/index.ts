import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import guestRoutes from './routes/guest';
import rsvpRoutes from './routes/rsvp';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://liangs.netlify.app",
    "http://localhost:5173"
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB only when needed
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await mongoose.connect(process.env.MONGO_URI!);
      isConnected = true;
    } catch (err) {
      console.error('MongoDB connection error:', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

app.use('/api/guests', guestRoutes);
app.use('/api/rsvp', rsvpRoutes);


export default app;