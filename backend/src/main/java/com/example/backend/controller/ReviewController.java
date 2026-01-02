package com.example.backend.controller;

import com.example.backend.model.Review;
import com.example.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Review review, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        review.setReviewerEmail(auth.getName());
        return ResponseEntity.ok(reviewService.submitReview(review));
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getForUser(@PathVariable String email) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(email));
    }

    @GetMapping("/user/{email}/average")
    public ResponseEntity<?> getAverage(@PathVariable String email) {
        return ResponseEntity.ok(Map.of("averageRating", reviewService.getAverageRating(email)));
    }

    @GetMapping("/user/{email}/given")
    public ResponseEntity<?> getGivenReviews(@PathVariable String email) {
        System.out.println("Fetching reviews given by: " + email);
        java.util.List<Review> reviews = reviewService.getReviewsGivenByUser(email);
        System.out.println("Found " + reviews.size() + " reviews.");
        return ResponseEntity.ok(reviews);
    }
}
