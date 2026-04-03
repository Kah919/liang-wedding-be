import express from 'express';
import Guest from '../models/Guest';
import { sendBlastEmail } from '../services/email';

const router = express.Router();

// POST /api/email/blast — send an email to all attending guests with an email address
router.post('/blast', async (req, res) => {
  try {
    const { subject, message } = req.body as { subject?: string; message?: string };

    if (!subject || !message) {
      res.status(400).json({ success: false, error: 'subject and message are required' });
      return;
    }

    const guests = await Guest.find({ rsvpStatus: 'attending', email: { $exists: true, $ne: '' } });

    const recipients = guests
      .filter((g) => g.email)
      .map((g) => ({ email: g.email!, firstName: g.firstName }));

    if (recipients.length === 0) {
      res.json({ success: true, sent: 0, failed: 0, message: 'No eligible recipients found' });
      return;
    }

    const result = await sendBlastEmail({ recipients, subject, message });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to send emails' });
  }
});

export default router;
