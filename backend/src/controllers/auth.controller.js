import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import {sendEmail} from "../utils/mailer.js";

const sendOTPEmail = async (email, otp) => {
  await sendEmail({
    from: `"Akshaya Agensy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; text-align: center; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
        <h2 style="color: #0f172a;">Verify Your Account</h2>
        <p>Use the code below to complete your registration at <b>Akshaya Agensy</b>.</p>
        <h1 style="color: #f59e0b; font-size: 40px; letter-spacing: 8px;">${otp}</h1>
        <p style="color: #64748b;">This code expires in 10 minutes.</p>
      </div>`,
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // FIX: If they exist but aren't verified, just send a new OTP
      if (!existingUser.isVerified) {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otp = newOtp;
        existingUser.otpExpires = Date.now() + 10 * 60 * 1000;
        await existingUser.save();
        
        await sendOTPEmail(email, newOtp);
        return res.status(200).json({ 
          message: "Account exists but is unverified. A new OTP has been sent." 
        });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    // Standard registration for brand new users...
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    await User.create({ name, email, password, phone, otp, otpExpires });
    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "OTP sent to email." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    console.log(user)

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Check if OTP matches and is not expired
    if (String(user.otp) !== String(otp) || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark as verified and clear OTP data
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "This account is already verified. Please login." });
    }

    // Generate a fresh 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update the user document with the new OTP
    user.otp = newOtp;
    user.otpExpires = newOtpExpires;
    await user.save();

    // Send the new OTP via email
    await sendOTPEmail(email, newOtp);

    res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    res.status(500).json({ message: "Server error while resending OTP" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check verification status
    if (!user.isVerified) {
      return res.status(401).json({ 
        message: "Email not verified. Please check your inbox for the OTP.",
        notVerified: true 
      });
    }

    const token = generateToken(res, user);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",          
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
};


export const getCurrentUser = async (req, res) => {
  // No need to query the DB again! 'protect' already did the work.
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  res.json(req.user); 
};


export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.phone = req.body.phone || user.phone;
    
    // Note: Do not update email or password here for security reasons
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};