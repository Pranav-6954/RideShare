package com.example.rideshare.repository;
import com.example.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Long>{
 Optional<User> findByEmail(String email);
 Optional<User> findByToken(String token);
 boolean existsByEmail(String email);
}
