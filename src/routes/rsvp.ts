import express from 'express';
import Guest from '../models/Guest';
import PlusOne from '../models/PlusOne';
import { sendConfirmationEmail } from '../services/email';

const router = express.Router();

// POST submit RSVP
router.post('/', async (req, res) => {
  try {
    const { email, allergies, rsvpStatus, plusOnes } = req.body;
    // plusOnes = [{ firstName: 'John', lastName: 'Doe', allergies: 'nuts' }]

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
    await guest.save();

    // send confirmation email
    if (guest.email) await sendConfirmationEmail({ to: guest.email, name: guest.firstName });

    res.status(200).json({ success: true, message: 'RSVP submitted!', data: guest });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to submit RSVP' });
  }
});

export default router;