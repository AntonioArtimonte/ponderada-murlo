// MyAwesomeShop/src/contexts/NotificationsContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]); // Array of notification objects

  // Notification object structure: { id: string, title: string, message: string, timestamp: Date, read: boolean }

  const addNotification = useCallback((title, message) => {
    const newNotification = {
      id: Math.random().toString(36).substring(2, 15), // Simple unique ID
      title,
      message,
      timestamp: new Date(),
      read: false,
    };
    // Add to the beginning of the array so newest are first
    setNotifications(prevNotifications => [newNotification, ...prevNotifications].slice(0, 50)); // Keep max 50 notifications
    console.log("Notification added:", newNotification);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notif => notif.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        unreadCount: notifications.filter(n => !n.read).length
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);