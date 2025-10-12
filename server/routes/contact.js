import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, phone, email, subject, message } = req.body;

  if (!name || !phone || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.TO_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // ✅ Send proper JSON response
    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
