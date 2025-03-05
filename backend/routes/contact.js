import express from 'express';
import sgMail from '@sendgrid/mail';

const router = express.Router();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get recipient emails from environment variable (comma-separated)
    const recipientEmails = process.env.NOTIFICATION_EMAIL.split(',').map(email => email.trim());
    
    const msg = {
      to: recipientEmails,
      from: process.env.SENDGRID_VERIFIED_SENDER, // Must be verified in SendGrid
      subject: `Website Contact: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h3>New message from TCUP website</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    };

    await sgMail.send(msg);
    
    // Send confirmation email to the sender
    const confirmationMsg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'We received your message - tCUPBOARD',
      text: `Hi ${name},\n\nThank you for contacting us. We have received your message and will get back to you as soon as possible.\n\nRegards,\nTCUP Team`,
      html: `
        <h3>Thank you for contacting us</h3>
        <p>Hi ${name},</p>
        <p>Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
        <p>Regards,<br>TCUP admins</p>
      `,
    };

    await sgMail.send(confirmationMsg);
    
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

export default router;