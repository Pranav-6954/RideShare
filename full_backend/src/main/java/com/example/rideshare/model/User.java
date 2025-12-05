package com.example.rideshare.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name="users")
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
 private Long id;
 private String name;
 @Column(unique=true,nullable=false)
 private String email;
 private String password;
 @Enumerated(EnumType.STRING)
 private Role role;
 @Column(unique=true)
 private String token;
}
