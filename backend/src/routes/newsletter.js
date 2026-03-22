import express from "express";
import transporter from "../utils/mailer.js";

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // 1. Send Welcome Email to User
    await transporter.sendMail({
      to: email,
      subject: 'Welcome to Akshaya Agensy!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f59e0b;">Thank you for subscribing!</h2>
          <p>You'll now be the first to hear about our <b>new arrivals</b> and <b>bulk supply offers</b>.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin:0;">Use code <b>WELCOME10</b> for 10% off your first purchase.</p>
          </div>
          <p>Best regards,<br/><b>Team Akshaya Agensy</b></p>
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