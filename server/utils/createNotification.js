import Notification from '../models/Notification.js';

/**
 * Create a notification. Fails silently so it never breaks the main flow.
 */
export default async function createNotification({
  recipient,
  sender,
  type,
  title,
  message,
  link,
}) {
  try {
    if (!recipient) return null;
    // Don't notify yourself
    if (sender && recipient.toString() === sender.toString()) return null;

    return await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
    return null;
  }
}