import express from 'express';
import Guest from '../models/Guest';
import PlusOne from '../models/PlusOne';

const router = express.Router();

// GET guest by name — used by RSVP flow to look up a guest before submission
router.get('/lookup', async (req, res) => {
  try {
    const { firstName, lastName } = req.query as { firstName?: string; lastName?: string };

    if (!firstName || !lastName) {
      res.status(400).json({ success: false, error: 'firstName and lastName are required' });
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

    await guest.populate('plusOnes');
    res.json({ success: true, data: { _id: guest._id, firstName: guest.firstName, lastName: guest.lastName, notes: guest.notes, plusOnes: guest.plusOnes } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to look up guest' });
  }
});

// GET all guests
router.get('/', async (_req, res) => {
  try {
    const guests = await Guest.find().populate('plusOnes').sort({ createdAt: -1 });
    res.json({ success: true, count: guests.length, data: guests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch guests' });
  }
});

// POST create a guest (admin only)
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, notes, plusOnes } = req.body as {
      firstName: string;
      lastName: string;
      email?: string;
      notes?: string;
      plusOnes?: { firstName: string; lastName: string }[];
    };

    if (!firstName || !lastName) {
      res.status(400).json({ success: false, error: 'First and last name are required' });
      return;
    }

    const guest = new Guest({ firstName, lastName, email, notes });
    await guest.save();

    if (plusOnes && plusOnes.length > 0) {
      const plusOneDocs = await PlusOne.insertMany(
        plusOnes.map(p => ({ ...p, guest: guest._id }))
      );
      guest.plusOnes = plusOneDocs.map(p => p._id);
      await guest.save();
    }

    await guest.populate('plusOnes');
    res.status(201).json({ success: true, data: guest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create guest' });
  }
});

// PATCH update a guest (admin only)
router.patch('/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, notes, rsvpStatus } = req.body;
    const updates: Record<string, unknown> = {};

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;
    if (notes !== undefined) updates.notes = notes;
    if (rsvpStatus !== undefined) updates.rsvpStatus = rsvpStatus;

    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('plusOnes');

    if (!guest) {
      res.status(404).json({ success: false, error: 'Guest not found' });
      return;
    }

    res.json({ success: true, data: guest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update guest' });
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
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete guest' });
  }
});

export default router;