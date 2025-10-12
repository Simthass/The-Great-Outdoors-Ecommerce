import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASSWORD, // your app password
  },
});

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/resetPassword/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request - Adventure Challenge",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7d9d49ff;">Adventure Challenge</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You have requested to reset your password. Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #7d9d49ff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #7d9d49ff; word-break: break-all; margin-bottom: 20px;">
            ${resetUrl}
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
