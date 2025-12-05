package com.example.rideshare.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name="rides")
public class Ride {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
 private Long id;
 private String origin;
 private String destination;
 private Double fare;
 private Integer seatsAvailable=1;
 private LocalDateTime departureTime;
 @ManyToOne @JoinColumn(name="driver_id")
 private User driver;
}
