package com.example.backend.repository;

import com.example.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);
    long countByRecipientEmailAndIsReadFalse(String email);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientEmail = :email")
    void markAllReadForUser(@org.springframework.web.bind.annotation.RequestParam("email") String email);
}
