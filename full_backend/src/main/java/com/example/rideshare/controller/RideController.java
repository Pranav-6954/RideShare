package com.example.rideshare.controller;
import com.example.rideshare.model.Ride;
import com.example.rideshare.model.Role;
import com.example.rideshare.model.User;
import com.example.rideshare.service.RideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
@CrossOrigin(origins="*")
public class RideController {
 private final RideService service;

 @PostMapping("/create")
 public ResponseEntity<?> create(@RequestBody Ride ride,Authentication a){
   User u=(User)a.getPrincipal();
   if(u.getRole()!=Role.DRIVER) return ResponseEntity.status(403).body("Only drivers allowed");
   return ResponseEntity.ok(service.createRide(ride,u));
 }

 @GetMapping("/all")
 public List<Ride> all(){ return service.listAll(); }

 @GetMapping("/my")
 public ResponseEntity<?> my(Authentication a){
   User u=(User)a.getPrincipal();
   if(u.getRole()!=Role.DRIVER) return ResponseEntity.status(403).body("Forbidden");
   return ResponseEntity.ok(service.listByDriver(u));
 }

 @GetMapping("/{id}")
 public ResponseEntity<?> one(@PathVariable Long id){
   return ResponseEntity.ok(service.findById(id));
 }
}
