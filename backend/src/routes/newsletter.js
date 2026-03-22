import express from "express";
import {sendEmail} from "../utils/mailer.js";

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // 1. Send Welcome Email to User
    await sendEmail({
      from: `"Akshaya Agensy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Akshaya Agensy!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Subscription Confirmed</h2>
        
        <p>Hello,</p>
        
        <p>Thank you for subscribing to the <b>Akshaya Agensy</b> newsletter. We are excited to have you with us!</p>
        
        <p>You will now receive occasional updates regarding:</p>
        <ul>
          <li>New stationery arrivals & Discounts</li>
          <li>Bulk supply availability for businesses</li>
        </ul>

        <p>If you have any specific requirements for your office or school supplies, feel free to reply to this email directly.</p>

        <p style="margin-top: 30px;">
          Best regards,<br/>
          <strong>Ramesh G</strong><br/>
          <span style="color: #64748b; font-size: 14px;">Akshaya Agensy</span>
        </p>
      </div>
      `
    });

    // Note: We are skipping the Admin notification to save your 100-email/day quota!
    res.status(200).json({ message: "Subscription successful!" });
  } catch (error) {
    res.status(500).json({ message: "Error joining newsletter" });
  }
});

export default router;