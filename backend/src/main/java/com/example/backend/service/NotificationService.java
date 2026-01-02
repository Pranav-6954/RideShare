package com.example.backend.service;

import com.example.backend.model.Notification;
import com.example.backend.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repo;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository repo, SimpMessagingTemplate messagingTemplate) {
        this.repo = repo;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification createNotification(String email, String message, String type) {
        Notification n = new Notification(email, message, type);
        Notification saved = repo.save(n);
        // Broadcast in-app
        messagingTemplate.convertAndSend("/topic/user/" + email, saved);
        return saved;
    }

    public List<Notification> getNotificationsForUser(String email) {
        return repo.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public void markAsRead(Long id) {
        repo.findById(id).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }

    public long getUnreadCount(String email) {
        return repo.countByRecipientEmailAndIsReadFalse(email);
    }

    @org.springframework.transaction.annotation.Transactional
    public void markAllAsRead(String email) {
        repo.markAllReadForUser(email);
    }
}
