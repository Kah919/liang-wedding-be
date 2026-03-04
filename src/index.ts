import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import rsvpRoutes from './routes/rsvp';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/rsvp', rsvpRoutes);

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Remove app.listen and export instead
export default app;