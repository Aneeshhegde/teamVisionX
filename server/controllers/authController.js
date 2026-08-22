const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const createTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
  } = process.env;

  const user = SMTP_USER || EMAIL_USER;
  const pass = SMTP_PASS || EMAIL_PASS;

  if (!user || !pass) {
    console.warn("⚠️ SMTP credentials missing (SMTP_USER or SMTP_PASS not set in environment variables)");
    return null;
  }

  // Use port 465 (SSL) for cloud hosting reliability (avoids port 587 blocks on cloud providers)
  const port = Number(SMTP_PORT || 465);
  const isSecure = port === 465 || SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port,
    secure: isSecure,
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ""), // Clean any accidental whitespace in app password
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        isOnboarded: user.isOnboarded || false,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    // Get email and password from request
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // Check password
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        isOnboarded: user.isOnboarded || false,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetOtp -resetOtpExpires");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        isOnboarded: user.isOnboarded || false,
        onboardingCompletedAt: user.onboardingCompletedAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Email not found",
      });
    }

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const transporter = createTransporter();

    if (!transporter) {
      return res.status(500).json({
        message: "Email service is not configured",
      });
    }

    try {
      console.log(`📧 Sending OTP email to: ${user.email} (Port 465 SSL)...`);
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"WealthX Security" <${process.env.SMTP_USER || "teamaitvisioners@gmail.com"}>`,
        to: user.email,
        subject: `🔒 ${otp} is your WealthX Password Reset Verification Code`,
        text: `Your WealthX password reset verification code is: ${otp}. This OTP will expire in 5 minutes. If you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #0c1322; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #38bdf8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">WealthX Security</h2>
              <span style="font-size: 11px; font-weight: 700; color: #34d399; letter-spacing: 0.05em; text-transform: uppercase;">Password Reset Verification</span>
            </div>
            <p style="color: #cbd5e1; font-size: 14.5px; line-height: 1.5; margin: 0 0 16px 0;">
              Hello <strong>${user.name || "WealthX User"}</strong>,
            </p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
              We received a request to reset the password for your WealthX account. Use the 6-digit verification code below to set a new password:
            </p>
            <div style="margin: 24px 0; padding: 18px; background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.35); border-radius: 8px; text-align: center;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; display: inline-block;">${otp}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12.5px; line-height: 1.5; margin: 0 0 24px 0;">
              ⏳ This verification code expires in <strong>5 minutes</strong>. If you did not request this password reset, your account is safe and you can safely ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
            <p style="color: #64748b; font-size: 11px; margin: 0; text-align: center;">
              WealthX (VisionX) Platform • Advanced Financial Intelligence<br />
              Never share your OTP with anyone.
            </p>
          </div>
        `,
      });
      console.log(`✅ OTP email sent successfully! MessageId: ${info.messageId}`);
    } catch (mailError) {
      console.error("❌ Failed to send OTP email:", mailError.message);
      return res.status(500).json({
        message: `Failed to send OTP email: ${mailError.message}`,
      });
    }

    return res.status(200).json({
      message: "OTP sent to email",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    return res.status(200).json({
      message: "OTP verified",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP, and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
};