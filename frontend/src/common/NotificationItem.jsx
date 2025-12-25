import React from "react";

const NotificationItem = ({ notification, onMarkAsRead }) => {
    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diffMs = now - notifTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-color)",
                backgroundColor: notification.read ? "transparent" : "rgba(59, 130, 246, 0.08)",
                cursor: notification.read ? "default" : "pointer",
                transition: "all 0.2s ease",
                position: "relative"
            }}
            onMouseEnter={(e) => {
                if (!notification.read) {
                    e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.12)";
                }
            }}
            onMouseLeave={(e) => {
                if (!notification.read) {
                    e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.08)";
                }
            }}
        >
            {/* Unread indicator dot */}
            {!notification.read && (
                <div
                    style={{
                        position: "absolute",
                        left: "6px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6"
                    }}
                />
            )}

            <div style={{ marginLeft: notification.read ? "0" : "12px" }}>
                <p
                    style={{
                        margin: "0 0 4px 0",
                        fontSize: "0.9rem",
                        fontWeight: notification.read ? "normal" : "600",
                        color: "var(--color-text-main)",
                        lineHeight: "1.4"
                    }}
                >
                    {notification.message}
                </p>
                <span
                    style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        fontStyle: "italic"
                    }}
                >
                    {getTimeAgo(notification.createdAt)}
                </span>
            </div>
        </div>
    );
};

export default NotificationItem;
