package com.example.backend.service;

import com.example.backend.model.Ride;
import com.example.backend.repository.RideRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RideService {
    private final RideRepository repo;
    private final UserService userService;
    private final BookingService bookingService;
    private final GoogleMapsService googleMapsService;

    public RideService(RideRepository repo, UserService userService, BookingService bookingService,
            GoogleMapsService googleMapsService) {
        this.repo = repo;
        this.userService = userService;
        this.bookingService = bookingService;
        this.googleMapsService = googleMapsService;
    }

    public Ride create(Ride r) {
        return repo.save(r);
    }

    /**
     * Creation logic for a Driver posting a ride.
     * Handles setting driver info and creating auto-reservations.
     */
    public Ride createPost(Ride r, String userEmail) {
        // 1. Fetch User
        com.example.backend.model.User u = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        // 2. Set Driver Details
        r.setDriverEmail(u.getEmail());
        r.setDriverName(u.getName());
        r.setDriverImage(u.getProfileImage());

        // fallback to User Profile phone if not provided in request
        if (r.getDriverPhone() == null || r.getDriverPhone().isEmpty()) {
            r.setDriverPhone(u.getPhone());
        }

        // If vehicleType/ImageUrl/etc are not provided, we could ideally pull from User
        // too
        // (e.g. carModel, licensePlate). In Ride model these are not clearly mapped.
        // Let's assume vehicleType = carModel for now if empty.
        if (r.getVehicleType() == null || r.getVehicleType().isEmpty()) {
            r.setVehicleType(u.getCarModel());
        }

        // 2b. Calculate Dynamic Fare (if price is 0 or auto-calc requested)
        if (r.getPrice() <= 0 && r.getFromLocation() != null && r.getToLocation() != null) {
            long distanceMeters = googleMapsService.getDistanceInMeters(r.getFromLocation(), r.getToLocation());
            double distanceKm = distanceMeters / 1000.0;
            double baseFare = 50.0;
            double ratePerKm = 10.0;
            double totalFare = baseFare + (ratePerKm * distanceKm);

            int capacity = r.getTickets() > 0 ? r.getTickets() : 1; // avoid div/0
            double pricePerSeat = totalFare / capacity;

            // Round to 2 decimals
            pricePerSeat = Math.round(pricePerSeat * 100.0) / 100.0;

            r.setPrice(pricePerSeat);
        }

        // 3. Save Ride
        Ride saved = repo.save(r);

        // 4. Handle Reservation (if driver reserves seats for themselves/friends)
        if (r.getReservedSeats() > 0) {
            try {
                com.example.backend.model.Booking b = new com.example.backend.model.Booking();
                b.setUserEmail(u.getEmail());
                b.setRide(saved);
                b.setSeats(r.getReservedSeats());
                b.setStatus("PENDING");
                b.setPassengers(java.util.List.of(
                        new com.example.backend.model.Passenger("Driver Reserved", 0, "N/A")));
                bookingService.createBooking(b);
            } catch (Exception ex) {
                System.err.println("Failed to auto-reserve seats: " + ex.getMessage());
            }
        }
        return saved;
    }

    public List<Ride> list() {
        return repo.findAll();
    }

    public Optional<Ride> findById(Long id) {
        return repo.findById(id);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<Ride> searchRides(String from, String to) {
        return repo.searchRides(from, to);
    }

    public Ride save(Ride r) {
        return repo.save(r);
    }

    public List<Ride> getAllRides() {
        return list();
    }
}
