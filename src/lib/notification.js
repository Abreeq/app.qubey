export const getNotifications = () => {
    if (typeof window === "undefined") return [];

    const data = localStorage.getItem("notifications");

    return data ? JSON.parse(data) : [];
};

export const saveNotifications = (notifications) => {
    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );
};

export const addNotification = ({
    title,
    message,
    link = "",
}) => {
    const notifications = getNotifications();

    const newNotification = {
        id: Date.now(),
        title,
        message,
        link,
        isRead: false,
        createdAt: new Date().toISOString(),
    };

    // Add newest notification at top
    const updated = [
        newNotification,
        ...notifications,
    ].slice(0, 12); // keep only latest 12

    saveNotifications(updated);

    // Trigger UI update across app
    window.dispatchEvent(new Event("notificationsUpdated"));
};

export const markNotificationAsRead = (id) => {
    const notifications = getNotifications();

    const updated = notifications.map((item) =>
        item.id === id
            ? { ...item, isRead: true }
            : item
    );

    saveNotifications(updated);

    window.dispatchEvent(new Event("notificationsUpdated"));
};

export const markAllNotificationsAsRead = () => {
    const notifications = getNotifications();

    const updated = notifications.map((item) => ({
        ...item,
        isRead: true,
    }));

    saveNotifications(updated);

    window.dispatchEvent(new Event("notificationsUpdated"));
};


// For deletion
export const deleteNotification = (id) => {
    const notifications = getNotifications();

    const updated = notifications.filter(
        (item) => item.id !== id
    );

    saveNotifications(updated);

    window.dispatchEvent(
        new Event("notificationsUpdated")
    );
};
