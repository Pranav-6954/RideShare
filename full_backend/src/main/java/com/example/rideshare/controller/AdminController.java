package com.example.rideshare.controller;
import com.example.rideshare.model.*;
import com.example.rideshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins="*")
public class AdminController {
 private final UserRepository repo;
 @GetMapping("/users")
 public ResponseEntity<?> users(Authentication a){
   User u=(User)a.getPrincipal();
   if(u.getRole()!=Role.ADMIN) return ResponseEntity.status(403).body("Forbidden");
   List<User> all=repo.findAll();
   return ResponseEntity.ok(all);
 }
}
