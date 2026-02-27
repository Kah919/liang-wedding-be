import express from 'express';
import RSVP from '../models/RSVP';
import { sendConfirmationEmail } from '../services/email';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const rsvps = await RSVP.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rsvps.length,
      data: rsvps,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch RSVPs' });
  }
});

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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RSVP.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'RSVP not found',
      });
    }

    res.json({
      success: true,
      message: 'RSVP deleted',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete RSVP',
    });
  }
});

export default router;