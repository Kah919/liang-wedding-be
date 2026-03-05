import mongoose from 'mongoose';

const RSVP_STATUSES = ['pending', 'attending', 'declined'] as const;
export type RsvpStatus = typeof RSVP_STATUSES[number];

const guestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  allowedPlusOnes: { type: Number, default: 0 }, // admin sets this (0 = no plus ones allowed)
  notes: String,
  rsvpStatus: { type: String, enum: RSVP_STATUSES, default: 'pending' },
  guestsAttending: { type: Number },
  plusOnes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlusOne' }] // stores references to plus one documents
}, { timestamps: true });

export default mongoose.model('Guest', guestSchema);