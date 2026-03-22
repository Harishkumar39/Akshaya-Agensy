import express from "express";
import dotenv from "dotenv"
import transporter from "../utils/mailer.js";

dotenv.config()

const router = express.Router();


router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const userMailOptions = {
      from: `"Akshaya Agensy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Akshaya Agensy!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f59e0b;">Thank you for subscribing!</h2>
          <p>You'll now be the first to hear about our <b>new arrivals</b> and <b>bulk supply offers</b>.</p>
          <p style="background: #f8fafc; padding: 10px; border-radius: 5px; display: inline-block;">
            Use code <b>WELCOME10</b> for 10% off your first purchase.
          </p>
          <br/><br/>
          <p>Best regards,<br/><b>Team Akshaya Agensy</b></p>
        </div>
      `
    };

    const adminMailOptions = {
      from: `"Newsletter System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'New Newsletter Subscriber!',
      text: `A new user has subscribed with the email: ${email}`
    };

    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    res.status(200).json({ message: "Subscription successful!" });
  } catch (error) {
    console.error("Mail Error:", error);
    res.status(500).json({ message: "Error sending emails" });
  }
});

export default router;