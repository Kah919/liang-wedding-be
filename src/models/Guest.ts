import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  allowedPlusOnes: { type: Number, default: 0 }, // admin sets this (0 = no plus ones allowed)
  notes: String,
  rsvpStatus: { type: String, enum: ['pending', 'attending', 'declined'], default: 'pending' },
  plusOnes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlusOne' }] // stores references to plus one documents
}, { timestamps: true });

export default mongoose.model('Guest', guestSchema);