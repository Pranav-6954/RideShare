package com.example.rideshare.service;
import com.example.rideshare.model.Ride;
import com.example.rideshare.model.User;
import com.example.rideshare.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RideService {
 private final RideRepository repo;
 public Ride createRide(Ride ride,User driver){
   ride.setDriver(driver);
   if(ride.getDepartureTime()==null) ride.setDepartureTime(LocalDateTime.now().plusHours(1));
   if(ride.getSeatsAvailable()==null) ride.setSeatsAvailable(1);
   return repo.save(ride);
 }
 public List<Ride> listAll(){ return repo.findAll(); }
 public Ride findById(Long id){ return repo.findById(id).orElseThrow(()->new RuntimeException("Not found")); }
 public List<Ride> listByDriver(User d){ return repo.findByDriverId(d.getId()); }
}
