package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.BookingService;
import com.example.backend.service.ReviewService;
import com.example.backend.service.RideService;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final ReviewService reviewService;
    private final BookingService bookingService;
    private final RideService rideService;

    public AdminController(UserService userService, ReviewService reviewService, BookingService bookingService, RideService rideService) {
        this.userService = userService;
        this.reviewService = reviewService;
        this.bookingService = bookingService;
        this.rideService = rideService;
    }

    // --- User Management ---

    @GetMapping("/users")
    public ResponseEntity<?> all(Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        List<User> users = userService.allUsers();
        
        List<Map<String, Object>> userListWithRatings = users.stream().map(u -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("superAdmin", u.isSuperAdmin());
            map.put("requestedAdmin", u.isRequestedAdmin());
            map.put("verified", u.isVerified());
            map.put("averageRating", reviewService.getAverageRating(u.getEmail()));
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(userListWithRatings);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> edit(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        User u = userService.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();

        // Prevent modifying other admins if not Super Admin (Simplified logic: Admin can modify anyone for now)
        if (body.containsKey("name")) u.setName(body.get("name"));
        if (body.containsKey("email")) u.setEmail(body.get("email"));
        if (body.containsKey("role")) u.setRole(body.get("role"));

        userService.save(u);
        return ResponseEntity.ok(u);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        User u = userService.findById(id).orElse(null);
        if (u != null) {
            userService.delete(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        User u = userService.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        u.setRole("ROLE_ADMIN");
        u.setRequestedAdmin(false);
        userService.save(u);
        return ResponseEntity.ok(Map.of("message", "Approved"));
    }

    @PostMapping("/users/{id}/revoke")
    public ResponseEntity<?> revoke(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        User u = userService.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        u.setRole("ROLE_USER");
        u.setRequestedAdmin(false);
        userService.save(u);
        return ResponseEntity.ok(Map.of("message", "Revoked"));
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        User u = userService.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        
        u.setRole("ROLE_BLOCKED");
        userService.save(u);
        return ResponseEntity.ok(Map.of("message", "User blocked"));
    }

    @PostMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        User u = userService.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();

        // Restore role based on car details
        if (u.getCarModel() != null && !u.getCarModel().isEmpty()) {
            u.setRole("ROLE_DRIVER");
        } else {
            u.setRole("ROLE_USER");
        }
        userService.save(u);
        return ResponseEntity.ok(Map.of("message", "User unblocked"));
    }

    @PostMapping("/users/{id}/verify")
    public ResponseEntity<?> verifyDriver(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        User u = userService.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        
        u.setVerified(true);
        userService.save(u);
        return ResponseEntity.ok(Map.of("message", "User verified"));
    }

    // --- Statistics & Maintenance ---

    @GetMapping("/users/stats/detailed")
    public ResponseEntity<?> getDetailedStats(Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        long userCount = userService.allUsers().stream().filter(u -> "ROLE_USER".equals(u.getRole())).count();
        long driverCount = userService.allUsers().stream().filter(u -> "ROLE_DRIVER".equals(u.getRole())).count();
        long blockedCount = userService.allUsers().stream().filter(u -> "ROLE_BLOCKED".equals(u.getRole())).count();
        long totalRides = rideService.getAllRides().size();

        long totalBookings = bookingService.allBookings().size();
        long cancelledBookings = bookingService.allBookings().stream()
                .filter(b -> "CANCELLED".equals(b.getStatus()) || "REJECTED".equals(b.getStatus())).count();

        double totalEarnings = bookingService.allBookings().stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()) || "PAID".equals(b.getStatus()) || "ACCEPTED".equals(b.getStatus())) // Simplified: Count accepted/paid as earnings for now
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();

        double cashVolume = bookingService.allBookings().stream()
                .filter(b -> "CASH".equalsIgnoreCase(b.getPaymentMethod()) && ("COMPLETED".equals(b.getStatus()) || "ACCEPTED".equals(b.getStatus())))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();
        
        double onlineVolume = totalEarnings - cashVolume;

        return ResponseEntity.ok(Map.of(
            "userCount", userCount,
            "driverCount", driverCount,
            "blockedCount", blockedCount,
            "totalBookings", totalBookings,
            "cancelledBookings", cancelledBookings,
            "totalEarnings", totalEarnings,
            "cashVolume", cashVolume,
            "onlineVolume", onlineVolume,
            "totalRides", totalRides));
    }

    @PostMapping("/users/fix-payment-data")
    public ResponseEntity<?> fixPaymentData(Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        int count = bookingService.fixStuckBookings();
        return ResponseEntity.ok(Map.of("message", "Fixed " + count + " bookings"));
    }

    // --- Data Monitoring ---

    @GetMapping("/rides")
    public ResponseEntity<?> getAllRides(Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        return ResponseEntity.ok(rideService.getAllRides());
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings(Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        return ResponseEntity.ok(bookingService.allBookings());
    }
}
