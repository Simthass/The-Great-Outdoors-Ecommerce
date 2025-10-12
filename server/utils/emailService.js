// utils/emailService.js
import nodemailer from "nodemailer";
import EventSubscriber from "../models/EventSubscriber.js"; // Add this import

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  welcome: (data) => ({
    subject: "🏔️ Welcome to Adventure Notifications!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #195E29 0%, #8DC53E 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏔️ Welcome to the Adventure!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #195E29;">Thanks for subscribing!</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            You're now part of our outdoor community! You'll be the first to know about:
          </p>
          <ul style="font-size: 16px; line-height: 1.8;">
            <li>🥾 New hiking adventures</li>
            <li>🏕️ Camping expeditions</li>
            <li>🧗 Rock climbing events</li>
            <li>🎣 Fishing trips</li>
            <li>🏹 Hunting expeditions</li>
            <li>📚 Outdoor skill workshops</li>
          </ul>
          <p style="font-size: 16px; line-height: 1.6;">
            Get ready for amazing outdoor experiences!
          </p>
        </div>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Don't want these emails? <a href="${process.env.FRONTEND_URL}/unsubscribe/${data.unsubscribeToken}">Unsubscribe here</a></p>
        </div>
      </div>
    `,
  }),

  newEvent: (data) => ({
    subject: `🎯 New ${data.category} Event: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #195E29 0%, #8DC53E 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎯 New Adventure Alert!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #195E29; margin-top: 0;">${data.title}</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="font-weight: bold; color: #195E29; margin-right: 10px;">📅 Date:</span>
              <span>${new Date(data.date).toLocaleDateString()} at ${
      data.time
    }</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="font-weight: bold; color: #195E29; margin-right: 10px;">📍 Location:</span>
              <span>${data.location}</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="font-weight: bold; color: #195E29; margin-right: 10px;">💰 Price:</span>
              <span>${data.price === 0 ? "Free" : `Rs. ${data.price}`}</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="font-weight: bold; color: #195E29; margin-right: 10px;">⭐ Difficulty:</span>
              <span style="text-transform: capitalize;">${
                data.difficulty
              }</span>
            </div>
          </div>
          <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
            ${data.shortDescription}
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/events/${data._id}" 
               style="background: #8DC53E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Event Details & Register
            </a>
          </div>
          ${
            data.maxParticipants
              ? `<p style="font-size: 14px; color: #666; text-align: center;">Limited to ${data.maxParticipants} participants - Register soon!</p>`
              : ""
          }
        </div>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Don't want these emails? <a href="${
            process.env.FRONTEND_URL
          }/unsubscribe/${data.unsubscribeToken}">Unsubscribe here</a></p>
        </div>
      </div>
    `,
  }),
};

// Send email function
export const sendEventNotificationEmail = async (email, type, data) => {
  try {
    const template = emailTemplates[type](data);

    const mailOptions = {
      from: `"Adventure Gear Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`${type} email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send ${type} email to ${email}:`, error);
    throw error;
  }
};

// Send notifications to all subscribers
export const notifyNewEvent = async (eventData) => {
  try {
    // Get all active subscribers
    const subscribers = await EventSubscriber.find({
      isActive: true,
      $or: [
        { preferredActivities: "all" },
        { preferredActivities: eventData.category },
      ],
    });

    console.log(
      `Sending event notification to ${subscribers.length} subscribers`
    );

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const emailPromises = batch.map((subscriber) =>
        sendEventNotificationEmail(subscriber.email, "newEvent", {
          ...eventData,
          unsubscribeToken: subscriber.unsubscribeToken,
        }).catch((error) => {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          return null; // Continue with other emails even if one fails
        })
      );

      await Promise.all(emailPromises);

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return subscribers.length;
  } catch (error) {
    console.error("Error sending event notifications:", error);
    throw error;
  }
};
