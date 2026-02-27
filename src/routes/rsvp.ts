import express from 'express';
import RSVP from '../models/RSVP';
import sgMail from '@sendgrid/mail';

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

router.post('/', async (req, res) => {
  try {
    const { name, email, plusOne, allergies } = req.body;

    if (!name || !email || plusOne === undefined) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Save to DB
    const rsvp = await RSVP.create({
      name,
      email,
      plusOne,
      allergies
    });

    // Send email
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL!,
      subject: 'RSVP Confirmation',
      text: `
Hi ${name},

Thanks for your RSVP!

Plus One: ${plusOne ? 'Yes' : 'No'}
Allergies: ${allergies || 'None'}

See you soon!
      `
    });

    res.json({ success: true, rsvp });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;