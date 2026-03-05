import express from 'express';
import Guest, { RsvpStatus } from '../models/Guest';
import PlusOne from '../models/PlusOne';
import { sendConfirmationEmail } from '../services/email';

const router = express.Router();

interface RsvpBody {
  email: string;
  notes?: string;
  rsvpStatus: RsvpStatus;
  plusOnes?: { firstName: string; lastName: string }[];
}

// POST submit RSVP
router.post('/', async (req, res) => {
  try {
    const { email, notes, rsvpStatus, plusOnes } = req.body as RsvpBody;

    const guest = await Guest.findOne({ email });

    if (!guest) {
      res.status(404).json({ success: false, error: 'Guest not found. Please contact us.' });
      return;
    }

    // validate plus one count
    if (plusOnes && plusOnes.length > guest.allowedPlusOnes) {
      res.status(400).json({ success: false, error: `You are only allowed ${guest.allowedPlusOnes} plus one(s)` });
      return;
    }

    // save plus ones
    await PlusOne.deleteMany({ guest: guest._id });
    guest.plusOnes = [];
    if (plusOnes && plusOnes.length > 0) {
      const plusOneDocs = await PlusOne.insertMany(
        plusOnes.map((p: { firstName: string; lastName: string; }) => ({
          ...p,
          guest: guest._id
        }))
      );
      guest.plusOnes = plusOneDocs.map(p => p._id);
    }

    // update guest
    guest.rsvpStatus = rsvpStatus;
    guest.notes = notes;
    await guest.save();

    // send confirmation email
    if (guest.email) await sendConfirmationEmail({ to: guest.email, name: guest.firstName });

    res.status(200).json({ success: true, message: 'RSVP submitted!', data: guest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to submit RSVP' });
  }
});

export default router;