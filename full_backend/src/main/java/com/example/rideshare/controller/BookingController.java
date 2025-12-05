package com.example.rideshare.controller;
import com.example.rideshare.dto.BookingRequest;
import com.example.rideshare.model.*;
import com.example.rideshare.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins="*")
public class BookingController {
 private final BookingService service;

 @PostMapping("/book")
 public ResponseEntity<?> book(@RequestBody BookingRequest r,Authentication a){
   User u=(User)a.getPrincipal();
   if(u.getRole()!=Role.PASSENGER) return ResponseEntity.status(403).body("Only passengers");
   return ResponseEntity.ok(service.bookRide(r.getRideId(),u,r.getSeats()));
 }
}
