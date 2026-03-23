import express from "express";
import {sendEmail} from "../utils/mailer.js";

const router = express.Router();

router.post('/inquiry', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const adminMailOptions = {
      from: `"Contact System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Inquiry: ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
        </div>
      `
    };

    const customerMailOptions = {
      from: `"Akshaya Agency" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'We received your message!',
      html: `<p>Hi ${name},</p><p>Thanks for reaching out to <b>Akshaya Agency</b>. We have received your inquiry regarding "${subject}" and will get back to you shortly.</p>`
    };

    await Promise.all([
      sendEmail(adminMailOptions),
      sendEmail(customerMailOptions)
    ]);

    res.status(200).json({ message: "Inquiry sent successfully!" });
  } catch (error) {
    console.error("Inquiry Mail Error:", error);
    res.status(500).json({ message: "Error sending inquiry" });
  }
});

export default router;