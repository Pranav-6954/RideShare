package com.example.rideshare.dto;
import com.example.rideshare.model.Role;
import lombok.Data;
@Data
public class RegisterRequest{
 private String name;
 private String email;
 private String password;
 private Role role;
}
