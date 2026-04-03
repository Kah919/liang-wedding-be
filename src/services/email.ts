import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

type SendEmailProps = {
  to: string;
  name: string;
  attending: boolean;
};

type BlastEmailProps = {
  recipients: { email: string; firstName: string }[];
  subject: string;
  message: string;
};

export async function sendBlastEmail({ recipients, subject, message }: BlastEmailProps): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      await sgMail.send({
        to: recipient.email,
        from: process.env.FROM_EMAIL!,
        subject,
        text: message,
        html: message.replace(/\n/g, '<br />'),
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${recipient.email}:`, err);
      failed++;
    }
  }

  return { sent, failed };
}

export async function sendConfirmationEmail({ to, name, attending }: SendEmailProps) {
  const text = attending
    ? `Thank you for your RSVP, ${name}! We can't wait to celebrate with you on September 26, 2026.\n\nThe Inn at New Hyde Park\n214 Jericho Tpke\nNew Hyde Park, NY 11040\n\nIf you need to update your response, reach us at arianaplusmichael@gmail.com.\n\nWith love,\nMike & Ari`
    : `Thank you for your RSVP, ${name}!\n\nTo update your response, please contact arianaplusmichael@gmail.com.\n\nWith love,\nMike & Ari\n\nhttps://liangs.netlify.app`;

  const html = attending
    ? `
      <p>Thank you for your RSVP, ${name}! We can’t wait to celebrate with you on September 26, 2026.</p>
      <br />
      <p>The Inn at New Hyde Park<br />214 Jericho Tpke<br />New Hyde Park, NY 11040</p>
      <br />
      <p>If you need to update your response, reach us at <a href="mailto:arianaplusmichael@gmail.com">arianaplusmichael@gmail.com</a>.</p>
      <br />
      <p>With love,<br />Mike &amp; Ari</p>
    `
    : `
      <p>Thank you for your RSVP, ${name}!</p>
      <br />
      <p>To update your response, please contact <a href="mailto:arianaplusmichael@gmail.com">arianaplusmichael@gmail.com</a>.</p>
      <br />
      <p>With love,<br />Mike &amp; Ari</p>
      <br />
      <p><a href="https://liangs.netlify.app">WWW.MIKEANDARI.COM</a></p>
    `;

  const msg = {
    to,
    from: process.env.FROM_EMAIL!,
    subject: "Wedding RSVP Confirmation",
    text,
    html,
  };

  await sgMail.send(msg);
}