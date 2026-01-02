package com.example.backend.service;

import com.example.backend.model.Review;
import com.example.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository, NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
    }

    public Review submitReview(Review review) {
        Review saved = reviewRepository.save(review);
        
        // Notify the reviewee
        String message = String.format("A new %d-star review was posted for you: \"%s\"", 
            review.getRating(), 
            review.getComment().length() > 50 ? review.getComment().substring(0, 47) + "..." : review.getComment());
        
        notificationService.createNotification(
            review.getRevieweeEmail(), 
            message, 
            "NEW_REVIEW"
        );
        
        return saved;
    }

    public List<Review> getReviewsForUser(String email) {
        return reviewRepository.findByRevieweeEmail(email);
    }

    public double getAverageRating(String email) {
        List<Review> reviews = getReviewsForUser(email);
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }

    public List<Review> getReviewsGivenByUser(String email) {
        return reviewRepository.findByReviewerEmail(email);
    }
}
