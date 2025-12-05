package com.example.rideshare.repository;
import com.example.rideshare.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RideRepository extends JpaRepository<Ride,Long>{
 List<Ride> findByDriverId(Long id);
}
