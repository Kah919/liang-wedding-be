import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

type SendEmailProps = {
  to: string;
  name: string;
};

export async function sendConfirmationEmail({ to, name }: SendEmailProps) {
  const msg = {
    to,
    from: process.env.FROM_EMAIL!,
    subject: 'Wedding RSVP Confirmation 💍',
    html: `
      <h2>Thank you for your RSVP, ${name}!</h2>
      <p>We’re so excited to celebrate with you.</p>
      <br />
      <p><strong>Date:</strong> September 26, 2026</p>
      <p><strong>Location:</strong> 214 Jericho Tpke, New Hyde Park, NY 11040</p>
      <br />
      <p>See you at the wedding! ❤️</p>
      <br />
      <p>-Mike & Ari</p>
    `,
  };

  await sgMail.send(msg);
}