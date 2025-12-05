package com.example.rideshare.service;
import com.example.rideshare.model.*;
import com.example.rideshare.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {
 private final BookingRepository brepo;
 private final RideRepository rrepo;

 @Transactional
 public Booking bookRide(Long rideId,User passenger,int seats){
   Ride ride=rrepo.findById(rideId).orElseThrow(()->new RuntimeException("Ride not found"));
   if(ride.getSeatsAvailable()<seats) throw new RuntimeException("No seats");
   ride.setSeatsAvailable(ride.getSeatsAvailable()-seats);
   rrepo.save(ride);
   Booking b=new Booking();
   b.setRide(ride);
   b.setPassenger(passenger);
   b.setSeatsBooked(seats);
   b.setStatus(BookingStatus.REQUESTED);
   return brepo.save(b);
 }
}
