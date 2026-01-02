package com.example.backend.repository;

import com.example.backend.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {

    List<Ride> findByDriverEmail(String driverEmail);

    @Query("SELECT r FROM Ride r WHERE " +
            "(LOWER(r.fromLocation) LIKE LOWER(CONCAT('%', :from, '%')) OR LOWER(r.route) LIKE LOWER(CONCAT('%', :from, '%'))) AND "
            +
            "(LOWER(r.toLocation) LIKE LOWER(CONCAT('%', :to, '%')) OR LOWER(r.route) LIKE LOWER(CONCAT('%', :to, '%')))")
    List<Ride> searchRides(@Param("from") String from, @Param("to") String to);
}
