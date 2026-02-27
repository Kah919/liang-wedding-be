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
      <p>See you at the wedding! ❤️</p>
      <br />
      <p>- Kah & Partner</p>
    `,
  };

  await sgMail.send(msg);
}