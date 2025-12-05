package com.example.rideshare.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name="bookings")
public class Booking {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
 private Long id;
 @ManyToOne @JoinColumn(name="ride_id")
 private Ride ride;
 @ManyToOne @JoinColumn(name="passenger_id")
 private User passenger;
 @Enumerated(EnumType.STRING)
 private BookingStatus status=BookingStatus.REQUESTED;
 private Integer seatsBooked=1;
}
