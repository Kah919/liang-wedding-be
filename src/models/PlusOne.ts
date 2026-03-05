import mongoose from 'mongoose';

const plusOneSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true }
}, { timestamps: true });

export default mongoose.model('PlusOne', plusOneSchema);