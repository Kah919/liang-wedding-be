import express from 'express';
import Guest from '../models/Guest';
import PlusOne from '../models/PlusOne';

const router = express.Router();

// GET all guests
router.get('/', async (req, res) => {
  try {
    const guests = await Guest.find().populate('plusOnes').sort({ createdAt: -1 });
    res.json({ success: true, count: guests.length, data: guests });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch guests' });
  }
});

// POST create a guest (admin only)
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, allowedPlusOnes } = req.body;

    if (!firstName || !lastName) {
      res.status(400).json({ success: false, error: 'First and last name are required' });
      return;
    }

    const guest = new Guest({ firstName, lastName, email, allowedPlusOnes });
    await guest.save();

    res.status(201).json({ success: true, data: guest });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create guest' });
  }
});

// DELETE a guest
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Guest.findByIdAndDelete(req.params.id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Guest not found' });
      return;
    }

    // delete their plus ones too
    await PlusOne.deleteMany({ guest: req.params.id });

    res.json({ success: true, message: 'Guest and plus ones deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete guest' });
  }
});

export default router;