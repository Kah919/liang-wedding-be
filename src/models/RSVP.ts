import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  plusOne: { type: Boolean, required: true },
  allergies: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('RSVP', rsvpSchema);