package com.example.backend.controller;

import com.example.backend.model.Notification;
import com.example.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return ResponseEntity.ok(service.getNotificationsForUser(auth.getName()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return ResponseEntity.ok(Map.of("count", service.getUnreadCount(auth.getName())));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        service.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PostMapping("/mark-read")
    public ResponseEntity<?> markAllRead(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        service.markAllAsRead(auth.getName());
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
