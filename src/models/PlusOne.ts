import mongoose from 'mongoose';

const RSVP_STATUSES = ['pending', 'attending', 'declined'] as const;
export type PlusOneRsvpStatus = typeof RSVP_STATUSES[number];

const plusOneSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  rsvpStatus: { type: String, enum: RSVP_STATUSES, default: 'pending' }
}, { timestamps: true });

export default mongoose.model('PlusOne', plusOneSchema);