package com.example.rideshare.dto;
import lombok.Data;
@Data
public class BookingRequest{
 private Long rideId;
 private Integer seats=1;
}
