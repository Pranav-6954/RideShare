package com.example.rideshare.controller;
import com.example.rideshare.dto.*;
import com.example.rideshare.model.User;
import com.example.rideshare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins="*")
public class AuthController {
 private final UserService service;

 @PostMapping("/register")
 public ResponseEntity<?> reg(@RequestBody RegisterRequest r){
   return ResponseEntity.ok("Registered: "+service.register(r).getEmail());
 }

 @PostMapping("/login")
 public ResponseEntity<?> login(@RequestBody LoginRequest r){
   String token=service.login(r);
   User u=service.findByToken(token).orElseThrow();
   return ResponseEntity.ok(new LoginResponse(token,u.getRole().name()));
 }

 @PostMapping("/logout")
 public ResponseEntity<?> logout(@RequestHeader("X-Auth-Token")String t){
   service.logout(t);
   return ResponseEntity.ok("Logged out");
 }
}
