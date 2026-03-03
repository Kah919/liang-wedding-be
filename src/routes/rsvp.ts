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
    console.error(err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Failed to fetch RSVPs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, plusOne, allergies } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, error: 'Name and email are required' });
      return;
    }

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
    console.error(err instanceof Error ? err.message : err);
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
      res.status(404).json({ success: false, error: 'RSVP not found' });
      return;
    }

    res.json({
      success: true,
      message: 'RSVP deleted',
    });
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete RSVP',
    });
  }
});

export default router;