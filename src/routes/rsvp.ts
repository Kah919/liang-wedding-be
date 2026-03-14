import express from 'express';
import Guest, { RsvpStatus } from '../models/Guest';
import PlusOne from '../models/PlusOne';
import { sendConfirmationEmail } from '../services/email';

const router = express.Router();

interface RsvpBody {
  firstName: string;
  lastName: string;
  email?: string;
  notes?: string;
  rsvpStatus: RsvpStatus;
  guestsAttending?: number;
  plusOnes?: { id: string; rsvpStatus: RsvpStatus }[];
}

// POST submit RSVP
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, notes, rsvpStatus, guestsAttending, plusOnes } = req.body as RsvpBody;

    if (!firstName || !lastName || !rsvpStatus) {
      res.status(400).json({ success: false, error: 'firstName, lastName, and rsvpStatus are required' });
      return;
    }

    const guest = await Guest.findOne({
      firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
      lastName: { $regex: new RegExp(`^${lastName}$`, 'i') },
    });

    if (!guest) {
      res.status(404).json({ success: false, error: 'Guest not found. Please contact us.' });
      return;
    }

    if (plusOnes && plusOnes.length > 0) {
      await Promise.all(
        plusOnes.map(p => PlusOne.findByIdAndUpdate(p.id, { rsvpStatus: p.rsvpStatus }))
      );
    }

    guest.rsvpStatus = rsvpStatus;
    if (email) guest.email = email;
    if (notes !== undefined) guest.notes = notes;
    if (guestsAttending !== undefined) guest.guestsAttending = guestsAttending;
    await guest.save();

    if (guest.email) await sendConfirmationEmail({ to: guest.email, name: guest.firstName });

    await guest.populate('plusOnes');
    res.json({ success: true, message: 'RSVP submitted!', data: guest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to submit RSVP' });
  }
});

export default router;