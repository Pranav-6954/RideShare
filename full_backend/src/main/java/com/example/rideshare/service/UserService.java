package com.example.rideshare.service;
import com.example.rideshare.dto.LoginRequest;
import com.example.rideshare.dto.RegisterRequest;
import com.example.rideshare.model.User;
import com.example.rideshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
 private final UserRepository repo;
 private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();

 public User register(RegisterRequest r){
   if(repo.existsByEmail(r.getEmail())) throw new RuntimeException("Email exists");
   User u=new User();
   u.setName(r.getName());
   u.setEmail(r.getEmail());
   u.setPassword(encoder.encode(r.getPassword()));
   u.setRole(r.getRole());
   return repo.save(u);
 }

 public String login(LoginRequest r){
   User u=repo.findByEmail(r.getEmail()).orElseThrow(()->new RuntimeException("Bad creds"));
   if(!encoder.matches(r.getPassword(),u.getPassword())) throw new RuntimeException("Bad creds");
   String token=UUID.randomUUID().toString();
   u.setToken(token);
   repo.save(u);
   return token;
 }

 public Optional<User> findByToken(String token){
   if(token==null) return Optional.empty();
   return repo.findByToken(token);
 }

 public void logout(String token){
   repo.findByToken(token).ifPresent(u->{ u.setToken(null); repo.save(u); });
 }
}
