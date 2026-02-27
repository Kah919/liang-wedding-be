import express from 'express';
import RSVP from '../models/RSVP';
import { sendConfirmationEmail } from '../services/email';

const router = express.Router();

// POST /api/rsvp
router.post('/', async (req, res) => {
  try {
    const { name, email, plusOne, allergies } = req.body;

    // Save RSVP
    const rsvp = new RSVP({ name, email, plusOne, allergies });
    await rsvp.save();

    // Send confirmation email
    await sendConfirmationEmail({
      to: email,
      name,
    });

    res.status(201).json({
      success: true,
      message: 'RSVP saved and email sent',
      rsvp,
    });
  } catch (err) {
    console.error('RSVP Error:', err);

    res.status(500).json({
      success: false,
      error: 'Failed to save RSVP',
    });
  }
});

export default router;