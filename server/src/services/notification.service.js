import { Notification } from '../models/notification.model.js';

export const createNotification = async ({ user, title, message, type = 'system', link = '', data = {} }) => {
  try {
    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      link,
      data,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
};
