import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { apiFetch } from "../utils/jwt";
import NotificationItem from "./NotificationItem";

const NotificationBell = ({ userEmail }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);
    const stompClientRef = useRef(null);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    // WebSocket connection
    useEffect(() => {
        if (!userEmail) return;

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8084/ws"),
            onConnect: () => {
                console.log("✅ WebSocket connected for notifications");

                // Subscribe to user-specific notification topic
                client.subscribe(`/topic/notifications/${userEmail}`, (message) => {
                    console.log("🔔 New notification received:", message.body);

                    // Add new notification to the list
                    const newNotification = {
                        id: Date.now(), // Temporary ID until we fetch from server
                        message: message.body,
                        read: false,
                        createdAt: new Date().toISOString()
                    };

                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Show browser notification if permission granted
                    if (Notification.permission === "granted") {
                        new Notification("Ride Share", {
                            body: message.body,
                            icon: "/favicon.ico"
                        });
                    }

                    // Refresh from server to get proper ID
                    setTimeout(() => fetchNotifications(), 1000);
                });
            },
            onStompError: (error) => {
                console.error("❌ WebSocket error:", error);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        client.activate();
        stompClientRef.current = client;

        // Request notification permission
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [userEmail]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const data = await apiFetch("/api/notifications");
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiFetch(`/api/notifications/${id}/read`, {
                method: "PUT"
            });

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.read);

        try {
            // Mark all unread notifications as read
            await Promise.all(
                unreadNotifications.map(n =>
                    apiFetch(`/api/notifications/${n.id}/read`, { method: "PUT" })
                )
            );

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative" }}>
            {/* Bell Icon */}
            <div
                onClick={toggleDropdown}
                style={{
                    position: "relative",
                    cursor: "pointer",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s ease"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                }}
            >
                <span style={{ fontSize: "1.5rem" }}>🔔</span>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            backgroundColor: "#ef4444",
                            color: "white",
                            borderRadius: "50%",
                            width: unreadCount > 9 ? "22px" : "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            animation: "pulse 2s infinite"
                        }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                )}
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 12px)",
                        right: "0",
                        width: "380px",
                        maxHeight: "550px",
                        backgroundColor: "#1a1a1a", // Solid background
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "16px",
                        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
                        zIndex: 2000,
                        overflow: "hidden",
                        animation: "slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid var(--border-color)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "var(--color-bg-secondary)"
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>
                            Notifications
                        </h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--color-primary)",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    fontWeight: "500"
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div
                        style={{
                            maxHeight: "400px",
                            overflowY: "auto"
                        }}
                    >
                        {loading ? (
                            <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div
                                style={{
                                    padding: "40px 20px",
                                    textAlign: "center",
                                    color: "var(--color-text-muted)"
                                }}
                            >
                                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🔕</div>
                                <p style={{ margin: 0, fontSize: "0.9rem" }}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
        </div>
    );
};

export default NotificationBell;
